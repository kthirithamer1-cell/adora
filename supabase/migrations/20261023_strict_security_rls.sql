-- =========================================================================
-- MarkMosaiq SaaS — Strict Production Security Policies (RLS)
-- Architecture : Backend-for-Frontend Sécurisé avec Service Role
-- =========================================================================

-- 1. ACTIVER LE ROW-LEVEL SECURITY SUR TOUTES LES TABLES SENSIBLES
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_events ENABLE ROW LEVEL SECURITY;

-- 2. NETTOYER LES ANCIENNES POLITIQUES TROP PERMISSIVES (OUVERTES AU PUBLIC)
DROP POLICY IF EXISTS "Enable all for users" ON public.users;
DROP POLICY IF EXISTS "Enable all for workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Enable all for brand_kits" ON public.brand_kits;
DROP POLICY IF EXISTS "Enable all for products" ON public.products;
DROP POLICY IF EXISTS "Enable all for generations" ON public.generations;
DROP POLICY IF EXISTS "Enable all for creative_assets" ON public.creative_assets;
DROP POLICY IF EXISTS "Enable all for invoices" ON public.invoices;
DROP POLICY IF EXISTS "Enable insert for invoices" ON public.invoices;
DROP POLICY IF EXISTS "Enable select for invoices" ON public.invoices;
DROP POLICY IF EXISTS "Enable update for invoices" ON public.invoices;
DROP POLICY IF EXISTS "Enable all for credit_transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Enable all for orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all for subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable all for credit_ledger" ON public.credit_ledger;
DROP POLICY IF EXISTS "Enable all for payment_events" ON public.payment_events;

-- =========================================================================
-- 3. POLITIQUES STRICTES : VERROUILLAGE TOTAL POUR LA CLÉ PUBLIQUE (ANON)
-- Seul le serveur Next.js (utilisant SUPABASE_SERVICE_ROLE_KEY) a accès aux données.
-- Les requêtes anonymes depuis le web/navigateur ne peuvent RIEN insérer, modifier ou voler.
-- =========================================================================

-- USERS : Aucun accès public direct. Seul le serveur authentifie et synchronise.
-- (Pas de politique anon = accès 100% bloqué depuis le web)

-- WORKSPACES : Aucun accès public direct.
-- (Accès 100% bloqué depuis le web)

-- INVOICES, ORDERS, CREDIT_LEDGER : Données financières strictement verrouillées.
-- (Accès 100% bloqué depuis le web)

-- PRODUCTS : Seule la lecture publique des produits actifs est autorisée (pour les vitrines / démos)
CREATE POLICY "Strict : Lecture publique des produits actifs" ON public.products
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- CREATIVE_ASSETS : Seule la lecture des assets est autorisée
CREATE POLICY "Strict : Lecture publique des visuels" ON public.creative_assets
  FOR SELECT TO anon, authenticated
  USING (true);

-- BRAND_KITS : Lecture publique autorisée pour l'affichage des logos/couleurs
CREATE POLICY "Strict : Lecture publique du Brand Kit" ON public.brand_kits
  FOR SELECT TO anon, authenticated
  USING (true);
