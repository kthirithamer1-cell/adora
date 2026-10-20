'use server';

import { supabase, resolveWorkspaceUuid } from '@/lib/supabase';
import { getCurrentSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createInvoiceAction(params: {
  packId: string;
  amountTND: number;
  paymentGateway: 'whop' | 'flouci' | 'konnect' | 'credit_card' | 'b2b_invoice';
  customerName: string;
  customerPhone?: string;
  matriculeFiscal?: string;
}) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    }
    const wsId = resolveWorkspaceUuid(session.workspace.id);

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let invoice = null;
    try {
      const rows = await supabase.from('invoices').insert({
        workspace_id: wsId,
        invoice_number: invoiceNumber,
        amount_tnd: params.amountTND,
        pack_id: params.packId,
        payment_gateway: params.paymentGateway,
        payment_status: 'PENDING',
        customer_name: params.customerName,
        customer_phone: params.customerPhone || '',
        matricule_fiscal: params.matriculeFiscal || '',
      });

      if (Array.isArray(rows) && rows.length > 0) {
        invoice = rows[0];
      }
    } catch (dbErr) {
      console.warn('Supabase invoice creation notice :', dbErr);
    }

    return {
      success: true,
      invoiceNumber,
      invoice,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function confirmPaymentAction(params: {
  invoiceNumber: string;
  creditsToAdd: number;
  gatewayReference?: string;
}) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    }
    const wsId = resolveWorkspaceUuid(session.workspace.id);

    let newBalance = session.workspace.creditsRemaining + params.creditsToAdd;

    try {
      // 1. Mettre à jour la facture
      await supabase.from('invoices').update(
        { invoice_number: params.invoiceNumber },
        {
          payment_status: 'PAID',
          gateway_reference: params.gatewayReference || '',
          paid_at: new Date().toISOString(),
        }
      );

      // 2. Mettre à jour le solde dans la boutique
      const wsRows = await supabase.from('workspaces').select('credits_remaining', {
        eq: { id: wsId },
        limit: 1,
      });

      const current = wsRows?.[0]?.credits_remaining ?? session.workspace.creditsRemaining;
      newBalance = current + params.creditsToAdd;

      await supabase.from('workspaces').update({ id: wsId }, {
        credits_remaining: newBalance,
      });

      // 3. Journaliser la recharge
      await supabase.from('credit_transactions').insert({
        workspace_id: wsId,
        type: 'TOPUP',
        amount: params.creditsToAdd,
        balance_after: newBalance,
        reason: `Recharge Pack (${params.creditsToAdd} crédits) Facture ${params.invoiceNumber}`,
      });
    } catch (dbErr) {
      console.warn('Supabase confirmPayment notice :', dbErr);
    }

    if (session.workspace) {
      session.workspace.creditsRemaining = newBalance;
    }

    revalidatePath('/studio');

    return {
      success: true,
      newBalance,
      message: `✓ Paiement validé avec succès ! +${params.creditsToAdd} crédits ajoutés.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
