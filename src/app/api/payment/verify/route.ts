import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentAction } from '@/actions/billing.actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('payment_id');
    const gateway = searchParams.get('gateway') || 'flouci';
    const creditsParam = searchParams.get('credits');
    const creditsToAdd = creditsParam ? parseInt(creditsParam, 10) : 10;

    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'payment_id manquant' }, { status: 400 });
    }

    // Flouci verification
    if (gateway === 'flouci') {
      const appToken = process.env.FLOUCI_APP_TOKEN;
      const appSecret = process.env.FLOUCI_APP_SECRET;

      if (appToken && appSecret && !paymentId.startsWith('flouci_test_')) {
        const verifyRes = await fetch(`https://api.flouci.com/api/verify_payment/${paymentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            apppublic: appToken,
            appsecret: appSecret,
          },
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const isPaid = verifyData.result?.status === 'SUCCESS';

          if (isPaid) {
            try {
              await confirmPaymentAction({
                invoiceNumber: paymentId,
                creditsToAdd,
                gatewayReference: paymentId,
              });
            } catch (payErr) {
              console.warn('Persistance confirmation paiement notice :', payErr);
            }
          }

          return NextResponse.json({
            success: true,
            status: isPaid ? 'PAID' : 'PENDING',
            paymentId,
            details: verifyData.result,
          });
        }
      }

      // Simulation mode
      try {
        await confirmPaymentAction({
          invoiceNumber: paymentId,
          creditsToAdd,
          gatewayReference: 'SIMULATED_FLOUCI',
        });
      } catch (simErr) {
        console.warn('Simulation paiement notice :', simErr);
      }

      return NextResponse.json({
        success: true,
        status: 'PAID',
        paymentId,
        simulated: true,
      });
    }

    // Konnect verification
    if (gateway === 'konnect') {
      const apiKey = process.env.KONNECT_API_KEY;
      if (apiKey && !paymentId.startsWith('konnect_test_')) {
        const verifyRes = await fetch(`https://api.konnect.network/api/v2/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        });

        if (verifyRes.ok) {
          const data = await verifyRes.json();
          const isPaid = data?.payment?.status === 'completed';

          if (isPaid) {
            try {
              await confirmPaymentAction({
                invoiceNumber: paymentId,
                creditsToAdd,
                gatewayReference: paymentId,
              });
            } catch (payErr) {
              console.warn('Konnect confirmation notice :', payErr);
            }
          }

          return NextResponse.json({
            success: true,
            status: isPaid ? 'PAID' : 'PENDING',
            paymentId,
            details: data?.payment,
          });
        }
      }

      try {
        await confirmPaymentAction({
          invoiceNumber: paymentId,
          creditsToAdd,
          gatewayReference: 'SIMULATED_KONNECT',
        });
      } catch (simErr) {
        console.warn('Konnect simulation notice :', simErr);
      }

      return NextResponse.json({
        success: true,
        status: 'PAID',
        paymentId,
        simulated: true,
      });
    }

    return NextResponse.json({ success: false, error: 'Passerelle inconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/payment/verify error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur lors de la vérification' }, { status: 500 });
  }
}
