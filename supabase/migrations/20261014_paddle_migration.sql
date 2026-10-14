-- Migration : Intégration de Paddle Billing en remplacement de Flouci
-- Date : 2026-10-14
-- Auteur : Adora AI Studio

-- 1. Mise à jour de la contrainte CHECK sur le gateway de paiement
ALTER TABLE public.invoices 
  DROP CONSTRAINT IF EXISTS invoices_payment_gateway_check;

ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_payment_gateway_check 
  CHECK (payment_gateway IN ('paddle', 'flouci', 'konnect', 'credit_card', 'b2b_invoice'));

-- 2. Ajout des colonnes de tracking Paddle
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS paddle_transaction_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS paddle_customer_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS paddle_subscription_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'EUR';

-- 3. Indexation pour les webhooks
CREATE INDEX IF NOT EXISTS idx_invoices_paddle_txn ON public.invoices(paddle_transaction_id);
