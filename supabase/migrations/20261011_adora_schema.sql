-- =========================================================================
-- ADORA SAAS — MIGRATION INITIALE SUPABASE & POSTGRESQL
-- Projet Ref : ucgslhophamzwqbkkayu
-- =========================================================================

-- 1. EXTENSIONS REQUISES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 2. TABLES PRINCIPALES
-- =========================================================================

-- 2.1 Table des Utilisateurs Marchands
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Table des Boutiques / Workspaces (MVP Mono-utilisateur)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    plan VARCHAR(20) DEFAULT 'flash' CHECK (plan IN ('flash', 'pro', 'agency')),
    credits_remaining INTEGER NOT NULL DEFAULT 10 CHECK (credits_remaining >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);

-- 2.3 Table Brand Kit (Identité visuelle de la marque tunisienne)
CREATE TABLE IF NOT EXISTS public.brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    shop_name VARCHAR(150) NOT NULL,
    logo_url TEXT NOT NULL,
    primary_color VARCHAR(10) DEFAULT '#00E5FF',
    secondary_color VARCHAR(10) DEFAULT '#FF5722',
    accent_color VARCHAR(10) DEFAULT '#10B981',
    font_family VARCHAR(50) DEFAULT 'Outfit, sans-serif',
    slogan_darija TEXT,
    slogan_fr TEXT,
    instagram_handle VARCHAR(100),
    whatsapp_number VARCHAR(30),
    delivery_mention VARCHAR(150) DEFAULT 'Livraison 24-48h sur les 24 gouvernorats',
    watermark_enabled BOOLEAN DEFAULT FALSE,
    watermark_position VARCHAR(20) DEFAULT 'top-right',
    ai_preferences JSONB DEFAULT '{}'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Table Catalogue Produits
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(80) DEFAULT 'general',
    price_tnd NUMERIC(10, 3) NOT NULL, -- Format Dinar Tunisien avec 3 décimales (millimes)
    original_image_url TEXT NOT NULL,
    cutout_image_url TEXT,
    description_fr TEXT,
    description_darija TEXT,
    badge_label VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_workspace ON public.products(workspace_id);

-- 2.5 Table des Sessions de Génération IA
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    prompt_used TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    credits_deducted INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_workspace ON public.generations(workspace_id);

-- 2.6 Table des Visuels Créatifs Publicitaires (Formats Sociaux Réels)
CREATE TABLE IF NOT EXISTS public.creative_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    format_type VARCHAR(20) NOT NULL CHECK (format_type IN ('story', 'facebook', 'instagram_post')),
    aspect_ratio VARCHAR(10) NOT NULL, -- '9:16', '1.91:1', '1:1'
    final_image_url TEXT NOT NULL,
    background_url TEXT NOT NULL,
    headline VARCHAR(255) NOT NULL,
    subheadline_darija TEXT,
    cta_text VARCHAR(60) DEFAULT 'Commander',
    price_displayed VARCHAR(50),
    badge_text VARCHAR(60),
    shadow_physics JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_generation ON public.creative_assets(generation_id);
CREATE INDEX IF NOT EXISTS idx_assets_product ON public.creative_assets(product_id);

-- 2.7 Journal d'Audit des Crédits (Transactions Atomiques)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('TOPUP', 'CONSUME', 'REFUND')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_workspace ON public.credit_transactions(workspace_id);

-- 2.8 Table Facturation & Paiements Tunisiens (Flouci, Konnect, Facture B2B)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount_tnd NUMERIC(10, 3) NOT NULL,
    pack_id VARCHAR(30) NOT NULL,
    payment_gateway VARCHAR(30) NOT NULL CHECK (payment_gateway IN ('flouci', 'konnect', 'credit_card', 'b2b_invoice')),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')),
    gateway_reference VARCHAR(150),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30),
    matricule_fiscal VARCHAR(80),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_workspace ON public.invoices(workspace_id);

-- 2.9 Table Social Hub & Publications Réseaux Sociaux
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    creative_asset_id UUID REFERENCES public.creative_assets(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
    caption_darija TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_workspace ON public.social_posts(workspace_id);

-- =========================================================================
-- 3. POLITIQUES DE SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
