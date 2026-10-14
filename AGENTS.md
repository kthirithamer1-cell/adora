<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🧠 Antigravity Agent Engineering Constitution — Adora SaaS

This repository contains **Adora**, the premier AI Content & Product Staging Studio for E-commerce in Tunisia.
All agents operating in this workspace **MUST** adhere strictly to the following architectural, cognitive, and domain rules.

---

## 1. 🔍 The 5-Step Cognitive Protocol (How the Agent MUST Think)

Before touching any code, proposing any diff, or closing any ticket, the agent must execute this mental loop:

```
[1. Deep Context Audit] ➔ [2. Architectural Scoping] ➔ [3. Surgical Implementation] ➔ [4. Coherence & Build Gate] ➔ [5. Jira Verification & Close]
```

### Step 1: Deep Context Audit (Never Blind Edit)
- Always inspect at least **50 to 100 lines** around the targeted change with `view_file`.
- Count and verify opening/closing braces `{}`, parentheses `()`, and JSX tags `<>` before editing.
- Confirm state declarations, imports, and return types before inserting new handlers.

### Step 2: Architectural Scoping
- Respect the existing design tokens, CSS modules, and Next.js App Router patterns.
- Follow the business domain: **E-commerce in Tunisia** (24 Gouvernorats, Dinars TND, authentic Darija, local delivery & payments).
- **Design Coherence Mandate**: Every newly created page or view MUST strictly mirror and preserve the existing luxury dark athletic aesthetic, typography, component structure, and layout tokens.

### Step 3: Surgical Implementation
- **Zero Syntax Slips**: Never leave dangling expressions (e.g. `console.`, unfinished ternaries).
- **JSX Tree Balance**: Every conditional branch returning multiple elements MUST be wrapped in a React Fragment (`<>...</>`).
- Keep edits focused, clean, and typed with strict TypeScript.

### Step 4: Coherence & Build Verification Gate (Mandatory)
- **Before telling the user "It's done"**, verify the entire modified block.
- Ensure the TypeScript parser and Next.js compiler will accept the AST without syntax errors.
- Confirm closing tags, commas, and quotes match 1-to-1.

### Step 5: Jira & Production Close
- Document technical changes clearly in the Jira ticket (`jira_add_comment`).
- Transition the ticket status (`jira_transition_issue` to `Terminé`).

---

## 2. 🎨 Architecture, Tech Stack & Design Coherence Rules

1. **Framework**: Next.js 16 (App Router) + React 19 + TypeScript.
2. **State & Client Components**:
   - Add `'use client'` only to files requiring React hooks or browser APIs.
   - Separate server data fetching (Route Handlers) from interactive client staging components.
3. **Styling & Design Tokens**:
   - Use CSS Modules (`generate.module.css`) and global variables defined in `globals.css`.
   - Maintain the luxury dark athletic / e-commerce aesthetic:
     - Primary backgrounds: `#0B0E14`, `#07090E`, `#FFFFFF` (for landing showcase).
     - Accents: Neon Cyan `#00E5FF`, Crimson Red `#E11D48` / `#FF5722`, Gold `#F59E0B`.
   - Avoid generic browser defaults. Never use placeholder styles when design tokens exist.
4. **Dependencies**:
   - Only use libraries present in `package.json` (`jszip`, `lucide-react`, `sharp`, `next`, `react`).
   - If adding a new dependency is strictly necessary, confirm with the user first.

### 2.1 🎯 Règle Impérative de Cohérence Visuelle (Design System Continuity Mandate)
Toute nouvelle page créée dans l'application (ex: `/checkout`, `/pricing`, `/dashboard`, nouveaux modals) **DOIT IMPÉRATIVEMENT** être à 100% cohérente et harmonisée avec le design existant d'Adora :
1. **Palette & Tokens Identiques** :
   - Fond d'écran sombre luxueux : `#07090E` (page background), `#0B0E14` (card & panel background).
   - Surfaces vitreuses : classe `glass-card`, bordures fines semi-transparentes (`rgba(255, 255, 255, 0.08)` à `0.12`), backdrop blur `16px` à `20px`.
   - Couleurs d'action : Néon Cyan `#00E5FF` (technologie/actions principales), Orange/Rouge `#FF5722` (urgences/ventes/promos), Violet `#A855F7` (B2B/agences), Vert `#10B981` (succès/validations).
2. **Harmonie de Mise en Page (Layout & Navigation)** :
   - Toute page applicative doit comporter la **Navbar Standard** avec le logo Adora officiel, le breadcrumb, le lien d'accueil, et le composant multi-tenant `<WorkspaceSelector />`.
   - Les conteneurs doivent respecter les espacements existants (`maxWidth: 1080px / 1200px`, paddings `24px` à `40px`).
3. **Typographie & Composants de Formulaire** :
   - Polices officielles : `Outfit, sans-serif` et `Plus Jakarta Sans, sans-serif`.
   - Titrages percutants (`font-weight: 800` ou `900`, `letter-spacing: -0.02em`).
   - Champs de formulaire unifiés : fond `#131823`, bordure subtile `#1E293B`, texte `#FFF`, coins arrondis `8px` à `10px`.
   - Boutons d'action : dégradés vibrants (`linear-gradient(135deg, ...)`), ombres portées diffuses (`box-shadow: 0 4px 14px rgba(...)`), texte en gras 800/900.
4. **Audit Visuel Préalable Obligatoire** :
   - Avant de créer ou styliser une nouvelle vue, l'agent doit inspecter `globals.css`, `studio/page.tsx` et `generate/page.tsx` pour en réutiliser la structure exacte sans inventer de nouveaux styles discordants.

---

## 3. 🤖 AI Pipeline & Prompt Engineering Rules (Zero-Hallucination Protocol)

1. **Strictly Positive Prompts (No Negative Words)**:
   - **PROHIBITED**: Never use words like `"no bottles, no text, no logos, without objects"`. Modern diffusion models (DALL-E 3, gpt-image-1/2, Flux) treat negative tokens as visual cues and will hallucinate unwanted objects.
   - **MANDATORY**: Always describe vacancy positively:
     `"The central pedestal top surface is completely vacant, pristine, smooth and polished, cleanly awaiting an object. Clean seamless background."`
2. **Product Preservation Principle**:
   - The merchant's actual product (bottle, box, fashion item, watch) must **NEVER** be redrawn or hallucinated by AI.
   - The AI generates the vacant background.
   - The application cuts out the product and composites it cleanly on top with physically accurate shadows.
3. **Physics of Relative Shadows**:
   - **Contact Blur**: $W_{\text{product}} \times 0.035$ (Ambient occlusion under the base).
   - **Contact Height**: $H_{\text{product}} \times 0.04$.
   - **Cast Shadow Offset**: Projected strictly opposite to the scene's `keyLightDirection`.
   - **Specular Mirroring**: Applied only on glossy surfaces (marble/acrylic) via inverted scale with linear gradient fade.
4. **Safe Zones for Social Media**:
   - **Instagram Stories (9:16)**:
     - Top 14% forbidden (profile header, close button, progress bars).
     - Bottom 20% forbidden (reply field, interactive stickers, nav bar).
     - Useful content zone: strictly between 14% and 80% height.
   - **Feed (1:1)**: Centered, balanced margins, 15° camera elevation.
5. **Cost-Aware QA Loop**:
   - Inspect generated backdrops with `gpt-4o-mini` (`detail: 'low'` = 85 tokens) to check vacant center, pedestal presence, and absence of text.
   - Max 1 automatic retry with reinforced vacant prompt if QA fails.

---

## 4. 🇹🇳 Tunisian E-Commerce Localization Standards

1. **Geography**:
   - Tunisia has strictly **24 Gouvernorats** (Tunis, Ariana, Ben Arous, Manouba, Nabeul, Zaghouan, Bizerte, Béja, Jendouba, Le Kef, Siliana, Sousse, Monastir, Mahdia, Sfax, Kairouan, Kasserine, Sidi Bouzid, Gabès, Médenine, Tataouine, Gafsa, Tozeur, Kébili).
   - **NEVER** use 58 (which refers to Algerian wilayas).
2. **Currency & Pricing**:
   - Always display prices in **DT** or **TND** (e.g. `49 DT`, `59 DT`, `189 DT`).
   - Never use EUR (€) or USD ($) in merchant-facing copy.
3. **Authentic Darija & Conversion Copywriting**:
   - Use natural Tunisian commercial hooks that generate DM orders:
     - *"Khlas and el livrison"* ou *"El khlass waqt el livri"* (Paiement à la livraison).
     - *"Weslet el commande fi boutique mteena !"* (Nouvel arrivage).
     - *"Livri fisaa fi tounes el kol (24-48h)"* (Livraison rapide).
     - *"Abathna message bech treservi pot mteeek !"* (Appel à l'action DM).
4. **Local Payment & B2B Invoicing**:
   - Integrate local gateways: **Flouci**, **Konnect**, and **ClickToPay / GPG**.
   - Provide formal B2B invoice generation (Facture proforma / Devis) for wire transfer and check payments.
5. **Commercial Value Framing**:
   - Do not sell "raw AI image credits".
   - Sell structured **Packs de Contenu Clé en Main** (Pack Flash 10 visuels 29 DT, Pack Pro 20 visuels 59 DT, Abonnement Agence 299 DT/mois).

---

## 5. 📦 Production Quality & Deliverables

1. **No Fake Mocks**:
   - When generating or testing ZIP exports, always pack real `.png`/`.jpg` images, real vector SVGs, and real copy files.
   - Never generate dummy `.txt` files in place of media files.
2. **API Route Reliability**:
   - Every Route Handler (`route.ts`) must wrap logic in `try / catch`.
   - Always return typed responses: `{ success: boolean, data?: ..., error?: string }` with correct HTTP status codes (`200`, `400`, `500`).
3. **Continuous Coherence**:
   - Before ending any turn or declaring a task complete, verify that all modified files have balanced tags, correct imports, and no dangling code.
