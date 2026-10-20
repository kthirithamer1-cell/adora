# 🚀 Guide Complet de Configuration Whop Commerce — MarkMosaiq SaaS

Ce document détaille toutes les étapes pour configurer et exploiter **Whop** comme Merchant of Record (MoR) international officiel pour **MarkMosaiq AI Studio**.

---

## 📌 1. Vue d'ensemble de l'Architecture Whop

MarkMosaiq utilise Whop pour :
1. **L'encaissement international sécurisé** (Cartes bancaires Visa, Mastercard, American Express, Apple Pay, Google Pay).
2. **Le rôle de Merchant of Record (MoR)** : Whop assume la conformité fiscale internationale, la collecte de la TVA/Sales Tax et les normes PCI-DSS Niveau 1.
3. **Le crédit instantané des forfaits MarkMosaiq** : Dès validation du paiement, le webhook officiel (`/api/payment/whop-webhook`) crédite automatiquement le workspace utilisateur en base de données Supabase.

---

## 🔑 2. Variables d'Environnement Définies

Votre fichier `.env` est déjà configuré avec vos clés Whop :

```env
# Clé API Whop v5
WHOP_API_KEY=apik_gymiPhtjirYpk_A2220069_C_9a519ed3db80a58af07b47dee871c6976c7199353932d1109ccdd622f83f98

# Identifiant d'Application Whop
NEXT_PUBLIC_WHOP_APP_ID=app_cq4CAvyxpAN8u5

# Secret de signature Webhook (À copier depuis le tableau de bord Whop Webhooks)
WHOP_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Identifiants des Plans Whop (Dashboard > Products > Plans)
WHOP_PLAN_FLASH=plan_flash_markmosaiq_starter
WHOP_PLAN_PRO=plan_pro_markmosaiq_launch
WHOP_PLAN_AGENCY=plan_agency_markmosaiq_b2b

# Liens directs de checkout hébergé Whop (Optionnel si vous utilisez des liens de redirection)
NEXT_PUBLIC_WHOP_STORE_URL=https://whop.com/markmosaiq
```

---

## 🛠️ 3. Étapes de Configuration sur le Dashboard Whop

### Étape 1 : Créer votre Société & Boutique
1. Rendez-vous sur [dash.whop.com](https://dash.whop.com).
2. Créez votre boutique : **MarkMosaiq AI**.
3. Définissez le logo officiel (`/public/images/logo.png`) et la description.

### Étape 2 : Créer vos 3 Produits / Plans
Dans l'onglet **Products**, créez vos offres correspondant aux forfaits MarkMosaiq :

| Forfait MarkMosaiq | Tarif USD | Tarif indicatif USD | Crédits attribués | Type de facturation |
| :--- | :--- | :--- | :--- | :--- |
| **Starter Découverte** (`flash`) | **$19** | ~59 DT | 10 crédits HD | Paiement unique ou mensuel |
| **Pro Lancement ⚡** (`pro`) | **$49** | ~149 DT | 30 crédits HD | Paiement unique ou mensuel |
| **Advanced Agence B2B** (`agency_299`) | **$100** | ~299 DT | 100 crédits HD | Mensuel récurrent |

> 💡 **Important** : Pour chaque plan créé dans Whop, copiez son ID (format `plan_xxxxxxxx`) et renseignez-le dans les variables `WHOP_PLAN_FLASH`, `WHOP_PLAN_PRO`, `WHOP_PLAN_AGENCY` de votre fichier `.env`.

### Étape 3 : Configurer le Webhook Whop
1. Dans le tableau de bord Whop, allez dans **Developer** ➔ **Webhooks**.
2. Cliquez sur **Add Endpoint**.
3. Renseignez l'URL de votre serveur :
   ```
   https://app.markmosaiq.tn/api/payment/whop-webhook
   ```
4. Sélectionnez les événements suivants à écouter :
   - `payment.succeeded` (Paiement réussi)
   - `membership.went_valid` (Adhésion activée)
   - `membership.went_invalid` (Adhésion résiliée)
5. Copiez le **Webhook Secret** (commençant par `whsec_...`) et collez-le dans `WHOP_WEBHOOK_SECRET` de votre fichier `.env`.

---

## 🗄️ 4. Migration Base de Données Supabase

Exécutez la migration préparée dans [supabase/migrations/20261017_whop_migration.sql](file:///c:/Users/MEDIA%20INFOPLUS/.gemini/antigravity-ide/scratch/adora/supabase/migrations/20261017_whop_migration.sql) dans l'éditeur SQL de votre console Supabase :

```sql
-- 1. Autoriser 'whop' dans la contrainte CHECK de la table invoices
ALTER TABLE public.invoices 
  DROP CONSTRAINT IF EXISTS invoices_payment_gateway_check;

ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_payment_gateway_check 
  CHECK (payment_gateway IN ('whop', 'flouci', 'konnect', 'credit_card', 'b2b_invoice'));

-- 2. Colonnes de tracking Whop
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS whop_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS whop_checkout_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS whop_customer_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS whop_membership_id VARCHAR(100);

-- 3. Indexation de performance
CREATE INDEX IF NOT EXISTS idx_invoices_whop_payment ON public.invoices(whop_payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_whop_checkout ON public.invoices(whop_checkout_id);
```

---

## 🔄 5. Flux de Paiement & Idempotence

1. **Initiation** : L'utilisateur clique sur « S'abonner » sur `/pricing` ou valide sa commande sur `/checkout`.
2. **Checkout** : MarkMosaiq redirige vers la page de paiement sécurisée Whop avec les métadonnées (`workspace_id`, `pack_id`, `credits_to_add`).
3. **Webhook & Rechargement** :
   - Whop déclenche l'événement `payment.succeeded`.
   - L'API MarkMosaiq valide la signature cryptographique HMAC-SHA256 (`webhook-signature`).
   - Vérification d'idempotence (aucun double crédit si le webhook est renvoyé).
   - Insertion de la facture officielle `WHO-2026-XXXX`.
   - Incrémentation du solde `workspaces.credits_remaining`.
   - Journalisation dans la table d'audit `credit_transactions`.
4. **Confirmation** : L'utilisateur est redirigé vers `/payment/success` et ses nouveaux visuels sont prêts dans le Studio.

---

## 🛡️ 6. Conformité & Sécurité
- Aucune donnée bancaire ne transite par les serveurs de MarkMosaiq.
- Whop assure la certification PCI-DSS Niveau 1 et le protocole 3D Secure 2.0.
- Les pages légales (`/terms`, `/privacy`, `/refunds`) sont 100% alignées sur les directives Whop.
