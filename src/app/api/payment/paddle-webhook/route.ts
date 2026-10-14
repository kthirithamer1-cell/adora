import { NextRequest, NextResponse } from 'next/server';
import { verifyPaddleWebhookSignature, PADDLE_PLANS } from '@/lib/paddle';
import { supabase } from '@/lib/supabase';
import { findWorkspaceById } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('paddle-signature');

    // 1. Validation de la signature cryptographique Paddle
    const isWebhookValid = verifyPaddleWebhookSignature(rawBody, signature);

    // En environnement de dev/simulation avec clé de test
    const isTestEnv =
      process.env.PADDLE_ENV === 'sandbox' &&
      (!process.env.PADDLE_WEBHOOK_SECRET_KEY ||
        process.env.PADDLE_WEBHOOK_SECRET_KEY.includes('test_webhook_secret'));

    if (!isWebhookValid && !isTestEnv) {
      console.error('Paddle Webhook : Signature non valide rejetée');
      return NextResponse.json({ success: false, error: 'Signature invalide' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event_type;
    const eventData = payload.data;

    console.log(`[Paddle Webhook] Événement reçu : ${eventType}`, {
      eventId: payload.event_id,
      transactionId: eventData?.id,
    });

    // 2. Traitement de la finalisation d'une transaction (Paiement validé)
    if (eventType === 'transaction.completed' || eventType === 'transaction.paid') {
      const transactionId = eventData.id;
      const customData = eventData.custom_data || {};
      const workspaceId = customData.workspace_id || customData.workspaceId || 'ws_nutristore';
      const packId = customData.pack_id || customData.packId || 'pro';
      const customerName = customData.customer_name || customData.customerName || 'Client Adora';
      const creditsToAdd =
        Number(customData.credits_to_add || customData.creditsToAdd) ||
        PADDLE_PLANS[packId]?.credits ||
        10;
      const amountTotal = eventData.details?.totals?.grand_total
        ? parseFloat(eventData.details.totals.grand_total) / 100
        : PADDLE_PLANS[packId]?.priceUSD || 19;

      // A. Vérification d'idempotence dans Supabase
      try {
        const existingInvoices = await supabase.from('invoices').select('*', {
          eq: { paddle_transaction_id: transactionId },
        });

        if (Array.isArray(existingInvoices) && existingInvoices.length > 0) {
          const inv = existingInvoices[0];
          if (inv.payment_status === 'PAID') {
            console.log(`[Paddle Webhook] Transaction ${transactionId} déjà traitée (Idempotence).`);
            return NextResponse.json({ success: true, message: 'Transaction déjà traitée' });
          }
        }
      } catch (checkErr) {
        console.warn('[Paddle Webhook] Notice vérification idempotence :', checkErr);
      }

      // B. Mise à jour ou insertion de la facture
      const invoiceNumber = `PAD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        await supabase.from('invoices').insert({
          workspace_id: workspaceId,
          invoice_number: invoiceNumber,
          amount_tnd: PADDLE_PLANS[packId]?.priceTND || 59,
          pack_id: packId,
          payment_gateway: 'paddle',
          payment_status: 'PAID',
          gateway_reference: transactionId,
          paddle_transaction_id: transactionId,
          paddle_customer_id: eventData.customer_id || '',
          customer_name: customerName,
          paid_at: new Date().toISOString(),
        });
      } catch (invErr) {
        console.warn('[Paddle Webhook] Notice persistance facture Supabase :', invErr);
      }

      // C. Incrémentation des crédits de la boutique
      try {
        const wsRows = await supabase.from('workspaces').select('credits_remaining', {
          eq: { id: workspaceId },
          limit: 1,
        });

        const currentCredits = wsRows?.[0]?.credits_remaining ?? 10;
        const newBalance = currentCredits + creditsToAdd;

        await supabase.from('workspaces').update(
          { id: workspaceId },
          { credits_remaining: newBalance }
        );

        // Journaliser la recharge
        await supabase.from('credit_transactions').insert({
          workspace_id: workspaceId,
          type: 'TOPUP',
          amount: creditsToAdd,
          balance_after: newBalance,
          reason: `Recharge Paddle Billing (+${creditsToAdd} crédits) - Réf: ${transactionId}`,
        });

        console.log(`[Paddle Webhook] Succès : +${creditsToAdd} crédits crédités au workspace ${workspaceId}.`);
      } catch (wsErr) {
        console.warn('[Paddle Webhook] Notice mise à jour crédits workspace :', wsErr);
      }

      // Fallback mémoire locale
      const wsMem = findWorkspaceById(workspaceId);
      if (wsMem) {
        wsMem.creditsRemaining += creditsToAdd;
      }

      return NextResponse.json({
        success: true,
        message: `Paiement Paddle validé, ${creditsToAdd} crédits ajoutés`,
        transactionId,
      });
    }

    // Autres événements (ex: subscription.created, subscription.canceled)
    return NextResponse.json({
      success: true,
      received: true,
      eventType,
    });
  } catch (error: any) {
    console.error('[Paddle Webhook] Erreur interne :', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur webhook interne' },
      { status: 500 }
    );
  }
}
