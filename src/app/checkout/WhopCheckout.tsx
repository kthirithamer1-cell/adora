'use client';

import React from 'react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';

interface WhopCheckoutProps {
  sessionId?: string;
  planId?: string;
  returnUrl?: string;
}

export default function WhopCheckout({ sessionId, planId, returnUrl }: WhopCheckoutProps) {
  const returnTarget = returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/checkout/complete`;
  const isSandbox = process.env.NEXT_PUBLIC_WHOP_SANDBOX === 'true' || process.env.WHOP_SANDBOX === 'true';

  // Si un sessionId serveur est fourni (recommandé en production)
  if (sessionId) {
    return (
      <div style={{ width: '100%', minHeight: '620px', borderRadius: '16px', overflow: 'hidden' }}>
        <WhopCheckoutEmbed
          sessionId={sessionId}
          returnUrl={returnTarget}
          environment={isSandbox ? 'sandbox' : 'production'}
          theme="dark"
        />
      </div>
    );
  }

  // Fallback embed direct par planId
  const effectivePlanId =
    planId ||
    process.env.NEXT_PUBLIC_WHOP_PRO_PLAN_ID ||
    process.env.WHOP_PRO_PLAN_ID ||
    process.env.WHOP_PLAN_PRO ||
    'plan_PX0I2P5FGQMFi';

  return (
    <div style={{ width: '100%', minHeight: '620px', borderRadius: '16px', overflow: 'hidden' }}>
      <WhopCheckoutEmbed
        planId={effectivePlanId}
        returnUrl={returnTarget}
        environment={isSandbox ? 'sandbox' : 'production'}
        theme="dark"
      />
    </div>
  );
}
