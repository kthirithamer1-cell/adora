-- =========================================================================
-- Migration : Politiques RLS pour Invoices, Workspaces et Credit Transactions
-- Permet à l'application Next.js (clé anon) d'enregistrer les factures et recharges
-- =========================================================================

CREATE POLICY "Enable insert for invoices" ON public.invoices 
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Enable select for invoices" ON public.invoices 
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Enable update for invoices" ON public.invoices 
  FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Enable all for workspaces" ON public.workspaces 
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for credit_transactions" ON public.credit_transactions 
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
