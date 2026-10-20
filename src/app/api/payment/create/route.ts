import { NextRequest, NextResponse } from 'next/server';
import { initFlouciPayment, initCreditCardPayment, generateB2BProformaInvoice, PaymentInitParams, initWhopPayment } from '@/lib/payment';
import { createInvoiceAction } from '@/actions/billing.actions';

export async function POST(req: NextRequest) {
  try {
    const body: PaymentInitParams = await req.json();

    if (!body.amountTND || body.amountTND <= 0) {
      return NextResponse.json({ success: false, error: 'Montant en USD invalide' }, { status: 400 });
    }

    if (!body.gateway) {
      return NextResponse.json({ success: false, error: 'Passerelle de paiement requise (whop, flouci, credit_card, b2b_invoice)' }, { status: 400 });
    }

    // Enregistrement persistant de la facture dans Supabase
    try {
      await createInvoiceAction({
        packId: body.packId || 'flash',
        amountTND: body.amountTND,
        paymentGateway: body.gateway as any,
        customerName: body.customerName || 'Client MarkMosaiq',
        customerPhone: body.customerPhone,
        matriculeFiscal: body.matriculeFiscal,
      });
    } catch (invErr) {
      console.warn('Persistance Supabase facture notice :', invErr);
    }

    if (body.gateway === 'whop') {
      const result = await initWhopPayment(body);
      return NextResponse.json(result);
    } else if (body.gateway === 'flouci') {
      const result = await initFlouciPayment(body);
      return NextResponse.json(result);
    } else if (body.gateway === 'credit_card' || body.gateway === 'konnect') {
      const result = await initCreditCardPayment(body);
      return NextResponse.json(result);
    } else if (body.gateway === 'b2b_invoice') {
      const invoice = generateB2BProformaInvoice(body);
      return NextResponse.json({
        success: true,
        paymentId: invoice.invoiceNumber,
        gateway: 'b2b_invoice',
        amountTND: body.amountTND,
        amountMillimes: Math.round(body.amountTND * 1000),
        invoiceNumber: invoice.invoiceNumber,
        invoiceHtml: invoice.html,
      });
    }

    return NextResponse.json({ success: false, error: 'Passerelle non supportée' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/payment/create error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur lors de l\'initialisation du paiement' }, { status: 500 });
  }
}
