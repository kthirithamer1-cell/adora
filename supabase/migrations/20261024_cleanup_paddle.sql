-- Migration : Nettoyage définitif et suppression des colonnes & index Paddle
-- Date : 2026-10-24
-- Auteur : MarkMosaiq AI Studio

-- 1. Suppression de l'index de transaction Paddle obsolète
DROP INDEX IF EXISTS public.idx_invoices_paddle_txn;

-- 2. Suppression des colonnes Paddle de la table public.invoices
ALTER TABLE public.invoices 
  DROP COLUMN IF EXISTS paddle_transaction_id,
  DROP COLUMN IF EXISTS paddle_customer_id,
  DROP COLUMN IF EXISTS paddle_subscription_id;

