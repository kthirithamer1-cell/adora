-- =========================================================================
-- MarkMosaiq SaaS — Fix Row-Level Security (RLS) Policies
-- Résout l'erreur 42501: "new row violates row-level security policy for table users"
-- =========================================================================

-- 1. Table USERS : Permettre la synchronisation et la gestion des comptes
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for users" ON public.users;
CREATE POLICY "Enable all for users" ON public.users 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 2. Table WORKSPACES : Assurer l'accès complet pour anon et authenticated
ALTER TABLE IF EXISTS public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for workspaces" ON public.workspaces;
CREATE POLICY "Enable all for workspaces" ON public.workspaces 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 3. Table BRAND_KITS : Permettre la sauvegarde de l'identité de marque
ALTER TABLE IF EXISTS public.brand_kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for brand_kits" ON public.brand_kits;
CREATE POLICY "Enable all for brand_kits" ON public.brand_kits 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 4. Table PRODUCTS : Permettre l'accès au catalogue produit
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for products" ON public.products;
CREATE POLICY "Enable all for products" ON public.products 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 5. Table GENERATIONS & CREATIVE_ASSETS : Permettre la sauvegarde des visuels IA
ALTER TABLE IF EXISTS public.generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for generations" ON public.generations;
CREATE POLICY "Enable all for generations" ON public.generations 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.creative_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for creative_assets" ON public.creative_assets;
CREATE POLICY "Enable all for creative_assets" ON public.creative_assets 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

-- 6. Tables FACTURATION & COMMERCE (Invoices, Credit Transactions, Orders, Ledger)
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for invoices" ON public.invoices;
CREATE POLICY "Enable all for invoices" ON public.invoices 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for credit_transactions" ON public.credit_transactions;
CREATE POLICY "Enable all for credit_transactions" ON public.credit_transactions 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for orders" ON public.orders;
CREATE POLICY "Enable all for orders" ON public.orders 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for subscriptions" ON public.subscriptions;
CREATE POLICY "Enable all for subscriptions" ON public.subscriptions 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for credit_ledger" ON public.credit_ledger;
CREATE POLICY "Enable all for credit_ledger" ON public.credit_ledger 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for payment_events" ON public.payment_events;
CREATE POLICY "Enable all for payment_events" ON public.payment_events 
  FOR ALL TO anon, authenticated 
  USING (true) 
  WITH CHECK (true);
