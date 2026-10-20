-- Migration : Intégration de la passerelle MacroPay en remplacement de Paddle
-- Date : 2026-10-15
-- Auteur : MarkMosaiq AI Studio

-- 1. Mise à jour de la contrainte CHECK sur le gateway de paiement
ALTER TABLE public.invoices 
  DROP CONSTRAINT IF EXISTS invoices_payment_gateway_check;

ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_payment_gateway_check 
  CHECK (payment_gateway IN ('macropay', 'paddle', 'flouci', 'konnect', 'credit_card', 'b2b_invoice'));

-- 2. Ajout des colonnes de tracking MacroPay
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS macropay_checkout_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS macropay_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS macropay_customer_id VARCHAR(100);

-- 3. Indexation pour les webhooks
CREATE INDEX IF NOT EXISTS idx_invoices_macropay_order ON public.invoices(macropay_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_macropay_checkout ON public.invoices(macropay_checkout_id);
