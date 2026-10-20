-- Migration MM-104 : Modèle de données Facturation Whop, Subscriptions & Credit Ledger Append-Only
-- Date : 2026-10-17
-- Auteur : MarkMosaiq AI Studio

-- 1. Table des Commandes (Orders) avec idempotence et snapshot catalogue
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  pack TEXT NOT NULL,
  cycle TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount_minor INT NOT NULL,
  status TEXT NOT NULL, -- 'CREATED', 'PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELED', 'EXPIRED'
  gateway TEXT NOT NULL DEFAULT 'whop',
  gateway_ref TEXT, -- Whop payment_id / checkout_id
  idempotency_key TEXT NOT NULL,
  catalog_snapshot JSONB NOT NULL DEFAULT '{}',
  failure_code TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_orders_idempotency UNIQUE (user_id, idempotency_key),
  CONSTRAINT uq_orders_gateway_ref UNIQUE (gateway, gateway_ref)
);

CREATE INDEX IF NOT EXISTS idx_orders_workspace ON public.orders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 2. Journal d'Audit Immuable des Événements Passerelle (Payment Events)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL DEFAULT 'whop',
  gateway_ref TEXT,
  kind TEXT NOT NULL, -- 'init', 'webhook', 'poll', 'reconcile'
  http_status INT,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order ON public.payment_events(order_id);

-- 3. Abonnements Actifs par Espace de Travail (Subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  workspace_id UUID PRIMARY KEY,
  pack TEXT NOT NULL,
  cycle TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'grace', 'expired'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  last_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Grand Livre des Crédits Append-Only (Credit Ledger)
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  delta INT NOT NULL,
  reason TEXT NOT NULL, -- 'trial_grant', 'whop_plan_grant', 'generation_spend', 'refund', 'adjustment'
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contraintes d'intégrité anti-doublon et anti-replay
CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_ledger_order_reason 
  ON public.credit_ledger (order_id, reason) 
  WHERE order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_ledger_trial_grant 
  ON public.credit_ledger (workspace_id, reason) 
  WHERE reason = 'trial_grant';

CREATE INDEX IF NOT EXISTS idx_credit_ledger_workspace ON public.credit_ledger(workspace_id);

-- 5. Enrichissement de la table Workspaces (Champs Checkout & Onboarding)
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS pending_checkout JSONB,
  ADD COLUMN IF NOT EXISTS onboarding_state JSONB;

-- 6. Rétro-compatibilité : Backfill d'ajustement initial basé sur le solde existant
INSERT INTO public.credit_ledger (workspace_id, delta, reason)
SELECT id, credits_remaining, 'adjustment'
FROM public.workspaces
WHERE credits_remaining > 0
ON CONFLICT DO NOTHING;
