-- Migration : Intégration de Whop Commerce (Merchant of Record) en remplacement de MacroPay & Paddle
-- Date : 2026-10-17
-- Auteur : MarkMosaiq AI Studio

-- 1. Mise à jour de la contrainte CHECK sur le gateway de paiement pour inclure 'whop'
ALTER TABLE public.invoices 
  DROP CONSTRAINT IF EXISTS invoices_payment_gateway_check;

ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_payment_gateway_check 
  CHECK (payment_gateway IN ('whop', 'flouci', 'konnect', 'credit_card', 'b2b_invoice'));

-- 2. Ajout des colonnes de tracking Whop
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS whop_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS whop_checkout_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS whop_customer_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS whop_membership_id VARCHAR(100);

-- 3. Indexation pour les webhooks et l'idempotence
CREATE INDEX IF NOT EXISTS idx_invoices_whop_payment ON public.invoices(whop_payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_whop_checkout ON public.invoices(whop_checkout_id);
CREATE INDEX IF NOT EXISTS idx_invoices_whop_customer ON public.invoices(whop_customer_id);
