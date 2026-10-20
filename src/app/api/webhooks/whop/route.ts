import { NextRequest, NextResponse } from 'next/server';
import { verifyWhopWebhookSignature, WHOP_PLANS } from '@/lib/whop';
import { supabase, resolveWorkspaceUuid } from '@/lib/supabase';
import { findWorkspaceById } from '@/lib/auth';
import { finalizeOrder } from '@/lib/services/finalizeOrder';

/**
 * Route Webhook officielle Whop — Déblocage sécurisé des fonctionnalités & crédits IA
 * Endpoint : /api/webhooks/whop
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers);

    // 1. Validation de la signature cryptographique Whop (Standard Webhooks HMAC-SHA256)
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
    const isTestEnv =
      !webhookSecret ||
      webhookSecret.includes('your_webhook_secret') ||
      webhookSecret.includes('your_live');

    let event: { id?: string; type?: string; action?: string; data?: Record<string, any> };

    try {
      // Tentative via helper SDK officiel
      const { unwrapWebhook } = await import('@whop/sdk/helpers');
      if (webhookSecret && !isTestEnv) {
        event = unwrapWebhook(rawBody, {
          headers: headers as Record<string, string>,
          key: webhookSecret,
        }) as any;
      } else {
        event = JSON.parse(rawBody);
      }
    } catch (sdkErr: any) {
      // Fallback vérification cryptographique directe
      const signatureHeaders = {
        id: request.headers.get('webhook-id') || request.headers.get('msg-id'),
        timestamp: request.headers.get('webhook-timestamp'),
        signature: request.headers.get('webhook-signature') || request.headers.get('whop-signature'),
      };

      const isValid = verifyWhopWebhookSignature(rawBody, signatureHeaders, webhookSecret);
      if (!isValid && !isTestEnv) {
        console.error('[Whop Webhook] Signature invalide rejetée :', sdkErr.message);
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }

      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    const eventType = event.type || event.action || (event as any).event;
    const eventData = event.data || (event as any);
    const eventId = event.id || (eventData && eventData.id) || `evt_${Date.now()}`;

    console.log(`[Whop Webhook] Événement reçu : ${eventType}`, { eventId });

    // 2. Traitement selon le type d'événement
    switch (eventType) {
      // A. PAIEMENT RÉUSSI OU ADHÉSION ACTIVÉE ➔ DÉBLOCAGE DES CRÉDITS IA
      case 'payment.succeeded':
      case 'payment_succeeded':
      case 'membership.activated':
      case 'membership_activated':
      case 'membership.went_valid': {
        const paymentId = eventData.id || eventData.payment_id || eventId;
        const metadata = eventData.metadata || eventData.custom_fields || {};
        const orderId = metadata.orderId || metadata.order_id;

        // Finalisation atomique & idempotente de la commande (MM-110)
        if (orderId) {
          const finalResult = await finalizeOrder(orderId, 'webhook', {
            whopPaymentId: paymentId,
            whopCheckoutId: eventData.checkout_id || '',
            whopMembershipId: eventData.membership_id || '',
          });
          if (finalResult.alreadyPaid) {
            console.log(`[Whop Webhook] Commande ${orderId} déjà finalisée (Idempotence).`);
            return NextResponse.json({ received: true, status: 'already_processed' });
          }
        }

        const workspaceId = resolveWorkspaceUuid(metadata.workspaceId || metadata.workspace_id);
        const userId = metadata.userId || metadata.user_id || 'user_mohamed';
        const packId = metadata.packId || metadata.pack_id || 'pro';
        const customerName = metadata.customerName || eventData.user?.username || 'Client MarkMosaiq';
        const planConfig = WHOP_PLANS[packId] || WHOP_PLANS['pro'];
        const creditsToAdd = Number(metadata.creditsToAdd || metadata.credits_to_add) || planConfig.credits;

        // Idempotence legacy : Vérifier si cet événement a déjà été traité
        try {
          const existingInvoices = await supabase.from('invoices').select('*', {
            eq: { gateway_reference: paymentId },
          });

          if (Array.isArray(existingInvoices) && existingInvoices.length > 0) {
            const inv = existingInvoices[0];
            if (inv.payment_status === 'PAID') {
              console.log(`[Whop Webhook] Paiement ${paymentId} déjà traité (Idempotence).`);
              return NextResponse.json({ received: true, status: 'already_processed' });
            }
          }
        } catch (checkErr) {
          console.warn('[Whop Webhook] Notice idempotence :', checkErr);
        }

        // Persistance de la facture dans Supabase
        const invoiceNumber = `WHO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          await supabase.from('invoices').insert({
            workspace_id: workspaceId,
            invoice_number: invoiceNumber,
            amount_tnd: planConfig.priceUSD,
            pack_id: packId,
            payment_gateway: 'whop',
            payment_status: 'PAID',
            gateway_reference: paymentId,
            whop_payment_id: paymentId,
            whop_checkout_id: eventData.checkout_id || '',
            whop_customer_id: eventData.user_id || eventData.customer_id || '',
            whop_membership_id: eventData.membership_id || '',
            customer_name: customerName,
            paid_at: new Date().toISOString(),
          });
        } catch (invErr) {
          console.warn('[Whop Webhook] Notice persistance facture :', invErr);
        }

        // Mise à jour transactionnelle du solde de crédits et du plan
        try {
          const wsRows = await supabase.from('workspaces').select('credits_remaining', {
            eq: { id: workspaceId },
            limit: 1,
          });

          const currentCredits = wsRows?.[0]?.credits_remaining ?? 10;
          const newBalance = currentCredits + creditsToAdd;

          await supabase.from('workspaces').update(
            { id: workspaceId },
            {
              credits_remaining: newBalance,
              plan: packId === 'agency_299' ? 'agency' : packId === 'pro' ? 'pro' : 'flash',
            }
          );

          // Audit log de recharge
          await supabase.from('credit_transactions').insert({
            workspace_id: workspaceId,
            type: 'TOPUP',
            amount: creditsToAdd,
            balance_after: newBalance,
            reason: `Recharge Whop (+${creditsToAdd} crédits) - Réf: ${paymentId}`,
          });

          console.log(`[Whop Webhook] ✓ Workspace ${workspaceId} rechargé de +${creditsToAdd} crédits (Nouveau solde: ${newBalance})`);
        } catch (wsErr) {
          console.error('[Whop Webhook] Erreur mise à jour crédits workspace :', wsErr);
        }

        // Mise à jour de la mémoire locale de session
        const wsMem = findWorkspaceById(workspaceId);
        if (wsMem) {
          wsMem.creditsRemaining += creditsToAdd;
        }

        return NextResponse.json({
          received: true,
          granted: true,
          creditsAdded: creditsToAdd,
          invoiceNumber,
        });
      }

      // B. ÉCHEC DE PAIEMENT OU RENOUVELLEMENT ➔ NOTIFICATION & RESTRICTION
      case 'payment.failed':
      case 'payment_failed': {
        const paymentId = eventData.id || eventId;
        console.warn(`[Whop Webhook] ⚠️ Échec de paiement Whop pour ${paymentId} :`, eventData.failure_reason || 'Raison inconnue');

        try {
          await supabase.from('invoices').insert({
            workspace_id: resolveWorkspaceUuid(eventData.metadata?.workspaceId),
            invoice_number: `FAIL-${Date.now()}`,
            amount_tnd: 0,
            pack_id: eventData.metadata?.packId || 'pro',
            payment_gateway: 'whop',
            payment_status: 'FAILED',
            gateway_reference: paymentId,
            customer_name: eventData.metadata?.customerName || 'Client MarkMosaiq',
          });
        } catch (failErr) {
          console.warn('[Whop Webhook] Notice log échec paiement :', failErr);
        }

        return NextResponse.json({ received: true, status: 'payment_failed_logged' });
      }

      // C. ADHÉSION RÉVOQUÉE OU EXPIRÉE ➔ DÉSACTIVATION DE L'ABONNEMENT
      case 'membership.deactivated':
      case 'membership_deactivated':
      case 'membership.went_invalid': {
        const membershipId = eventData.id || eventId;
        const workspaceId = eventData.metadata?.workspaceId;
        console.log(`[Whop Webhook] Adhésion Whop désactivée (${membershipId})`);

        if (workspaceId) {
          try {
            await supabase.from('workspaces').update(
              { id: workspaceId },
              { plan: 'flash' }
            );
          } catch (deactErr) {
            console.warn('[Whop Webhook] Notice désactivation plan :', deactErr);
          }
        }

        return NextResponse.json({ received: true, status: 'membership_deactivated' });
      }

      default:
        console.log(`[Whop Webhook] Événement non traité directement : ${eventType}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Whop Webhook] Erreur interne :', error);
    return NextResponse.json(
      { error: error.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}
