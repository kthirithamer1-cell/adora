# 🚀 Plan Stratégique, Financier & Architecture Next.js — SaaS MarkMosaiq

> **Cible principale** : Boutiques et revendeurs de compléments alimentaires (Whey, Créatine, Pré-workout, Vitamines) en Tunisie.  
> **Promesse** : Transformer 1 simple photo smartphone d'un pot en un **Pack Marketing Complet de 20 à 25 visuels prêts à poster** (Feed, Stories, Pubs, Badges locaux).

---

## 1. La Thèse Commerciale : Pourquoi des "Packs de Contenu" ?

Vendre de "simples crédits d'images" (ex: 30 images / mois) à des commerçants tunisiens pose 3 problèmes majeurs :
1. **Syndrome de la page blanche** : Le gérant de boutique ne sait pas quoi prompter.
2. **Déformation de produit** : Une IA générative pure réinvente le texte et le logo du pot de Whey s'il n'y a pas un pipeline de composition/détourage strict.
3. **Perception de valeur faible** : "30 images brutes" ressemble à un gadget. En revanche, un **"Pack Lancement Whey 100% Gold Standard"** avec 20 visuels prêts pour Facebook Ads, Instagram Story, Feed et Promo Livraison a une valeur perçue de **150 à 300 DT** (comparé au prix d'un graphiste local).

---

## 2. Découpage des "Packs de Contenu" (L'Offre Produit)

Chaque boutique reçoit des **packs structurés et prêts à poster** selon ses besoins :

### Pack A : "Lancement Produit Pro" (20 visuels par produit)
*Idéal dès qu'une boutique rentre une nouvelle référence (ex: Créatine Creapure, Isolate, Pre-workout)*
- **5 visuels Studio / E-commerce (1080x1080)** : Fond podium minimaliste, éclairage néon sport, ombres portées réalistes.
- **5 visuels Lifestyle & Gym (1080x1080)** : Le pot posé au bord d'un banc de muscu, vestiaire premium, shaker prêt à l'emploi.
- **5 visuels Ads / Conversion (1080x1080)** : Accroches chocs ("+ de force", "Zéro sucre"), badges "Livraison Express", "100% Authentique".
- **5 visuels Stories / Reels (format vertical 1080x1920)** : Mises en avant promo flash, "Stock Limité", packshot immersif plein écran.
- **Fichier bonus** : `legende_instagram.txt` (texte rédigé par GPT-4o avec hashtags tunisiens).

### Pack B : "Campagne Promo & Déstockage" (15 visuels)
- Visuels avec bandeaux d'offre : "Pack Prise de Masse", "Offre Duo", "Shaker Offert".
- Déclinaisons Feed + Story avec stickers d'urgence marketing.

### Pack C : "Omniprésence Mensuelle" (60 à 100 visuels / mois)
- 3 à 4 lancements de produits complets par mois.
- 30 visuels motivation / tips nutrition avec branding de la boutique.

---

## 3. Workflow IA avec l'API OpenAI (DALL-E 3 + GPT-4o)

Pour les compléments alimentaires, **le produit réel (pot, étiquette, marque) ne doit JAMAIS être réinventé par DALL-E 3**. Le workflow repose sur une architecture hybride :

```
                     [Photo Smartphone du Pot]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
[1. GPT-4o Vision API]                    [2. Détourage du Produit]
• Détecte: Marque, Saveur, Type           • Suppression du fond (RMBG /
• Génère: Textes pub & Prompts décors       @imgly/background-removal)
        │                                               │
        ▼                                               │
[3. DALL-E 3 API]                                      │
• Génère les décors 4K vides au centre                 │
  (Podium néon, Gym brute, Cuisine)                     │
        │                                               │
        └───────────────────────┬───────────────────────┘
                                ▼
               [4. Moteur de Composition Next.js (Sharp)]
               • Incrustation du pot réel sur le décor
               • Rendu de l'ombre portée réaliste de contact
               • Application des Badges marketing locaux (SVG/PNG)
                                │
                                ▼
                 [5. Export Pack ZIP Structuré]
```

### Coûts Réels OpenAI & Marges (Taux 1 USD ≈ 3.15 DT)

| Ressource | Coût Unitaire USD | Coût Unitaire USD | Utilisation par Pack Pro (20 visuels) |
| :--- | :--- | :--- | :--- |
| **GPT-4o Vision** | ~0,005 $ / appel | ~0,016 DT | 1 appel analyse = **~0,016 DT** |
| **DALL-E 3 Standard (1024x1024)** | 0,040 $ / image | ~0,126 DT | 15 images carrées = **~1,89 DT** |
| **DALL-E 3 Standard (1024x1792)** | 0,080 $ / image | ~0,250 DT | 5 stories = **~1,25 DT** |
| **Détourage & Composition (Sharp)** | 0 $ (exécuté sur serveur) | 0,000 DT | 20 images = **0,00 DT** |
| **Total Coût de Revient API** | — | — | **~3,16 DT par Pack Pro** |

> **Prix de vente conseillé en Tunisie :** **59 DT**  
> **Marge Brute :** **94,6% (Bénéfice de ~55,8 DT par pack vendu !)**

---

## 4. Grille Tarifaire Spécifique Tunisie

### Vente à la carte (Sans engagement)
- **Pack Flash (10 visuels pour 1 produit)** : **29 DT** *(Coût API : ~1,3 DT)*
- **Pack Lancement Pro (20 visuels complets)** : **59 DT** *(Coût API : ~3,2 DT)*

### Abonnements Mensuels Récurrents (MRR)
- **Starter Boutique (50 visuels / mois - 2 à 3 produits)** : **49 DT / mois** *(Marge : ~41 DT)*
- **Pro Nutrition (150 visuels / mois - 7 à 8 produits)** : **99 DT / mois** *(Marge : ~80 DT)*
- **Chaîne / Franchise (400 visuels / mois)** : **199 DT / mois** *(Marge : ~155 DT)*

---

## 5. Architecture Technique Détaillée Next.js (App Router)

### 5.1 Arborescence du Projet Next.js

```
MarkMosaiq/
├── app/
│   ├── layout.tsx                  # Layout global (Thème dark fitness, Polices Inter/Outfit)
│   ├── page.tsx                    # Landing Page marketing (Présentation packs, démo avant/après)
│   ├── studio/
│   │   └── page.tsx                # Studio de création (Upload -> Sélecteur Pack -> Live Preview)
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts            # Route GPT-4o Vision : Analyse photo & extraction métadonnées
│   │   ├── generate-background/
│   │   │   └── route.ts            # Route DALL-E 3 : Génération des arrière-plans gym & studio
│   │   ├── composite/
│   │   │   └── route.ts            # Route Sharp : Fusion pot détouré + ombre + badges
│   │   └── export-pack/
│   │   │   └── route.ts            # Route JSZip : Génération de l'archive ZIP structurée
├── components/
│   ├── DropzoneUpload.tsx          # Zone drag & drop avec preview instantané et cadrage
│   ├── PackSelector.tsx            # Choix du pack (10, 20 visuels, templates)
│   ├── BadgePicker.tsx             # Sélecteur de badges ("Livraison 24 gouv", "-20%", "100% Original")
│   ├── VisualCard.tsx              # Carte de visuel individuel avec action de retouche / téléchargement
│   ├── LiveGenerationGrid.tsx      # Grille interactive avec indicateurs de progression en direct
│   └── DownloadModal.tsx           # Modale de téléchargement du ZIP complet
├── lib/
│   ├── openai.ts                   # Instance client OpenAI initialisée avec OPENAI_API_KEY
│   ├── prompt-library.ts           # Bibliothèque des prompts décors (Studio Dark, Gym Fonte, Néons)
│   ├── compositor.ts               # Fonctions utilitaires Sharp pour assembler les calques
│   └── zip-builder.ts              # Classeur des visuels dans l'archive finale
├── public/
│   ├── badges/                     # Badges SVG haute définition
│   │   ├── livraison_express.svg
│   │   ├── authentique_100.svg
│   │   ├── paiement_livraison.svg
│   │   └── promo_flag.svg
│   └── templates/                  # Décors studio pré-calculés (pour économiser l'API)
├── .env.local                      # OPENAI_API_KEY=sk-...
├── package.json
└── tailwind.config.js / styles/
```

### 5.2 Description des Route Handlers Next.js

#### 1. `POST /api/analyze` (GPT-4o Vision)
- **Rôle** : Reçoit la photo du pot en base64 / FormData.
- **Action GPT-4o** :
  ```typescript
  // Extrait automatiquement les caractéristiques clés
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Tu es un expert marketing spécialisé dans les compléments alimentaires fitness en Tunisie."
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyse cette photo de complément. Renvoie un JSON avec: brand, productName, category (whey/creatine/etc), dominantColors, targetGoal (masse/sèche/force), et 3 idées de légendes Instagram percutantes avec hashtags tunisiens." },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ],
    response_format: { type: "json_object" }
  });
  ```

#### 2. `POST /api/generate-background` (DALL-E 3)
- **Rôle** : Génère un décor sur mesure selon le style sélectionné (ex: "Podium Gym Dark", "Vestiaire Moderne", "Cuisine Diète").
- **Prompt optimisé pour laisser le centre vide** :
  ```typescript
  const prompt = `Professional commercial product photography background, luxury dark modern gym interior, sleek concrete podium in the lower center with soft rim lighting, dramatic moody red and blue LED sport atmosphere, pristine empty centered pedestal ready for product placement, shallow depth of field, 8k, ultra-realistic.`;
  ```

#### 3. `POST /api/composite` (Sharp / Canvas)
- **Rôle** : Prend le pot détouré, redimensionne selon l'échelle, ajoute une ombre d'occlusion douce sous la base, fusionne avec l'arrière-plan DALL-E 3, et applique le badge sélectionné en haut à droite.

#### 4. `POST /api/export-pack` (JSZip)
- **Rôle** : Crée à la volée une archive `.zip` organisée :
  ```
  Pack_Gold_Standard_Whey_MarkMosaiq/
  ├── 01_Feed_Instagram_1080x1080/
  │   ├── studio_podium_01.png
  │   ├── gym_ambiance_02.png
  │   └── promo_reduction_03.png
  ├── 02_Stories_Reels_9x16/
  │   ├── story_lancement_01.png
  │   └── story_promo_02.png
  └── legende_et_hashtags_instagram.txt
  ```

---

## 6. Optimisations de Coûts & Vitesse

1. **Système de Cache des Décors (Bibliothèque Hybride)** :
   - Plutôt que d'appeler DALL-E 3 pour chaque image, MarkMosaiq stocke une galerie de **50 arrière-plans pré-générés 4K ultra-beaux** (salle de sport, podium, néon, vestiaire).
   - Le commerçant peut choisir un fond existant (coût DALL-E = **0 DT**) ou demander un décor sur-mesure (coût DALL-E = **0,126 DT**).
   - **Résultat** : Votre marge passe de 94% à **98%** sur les packs utilisant des décors de la bibliothèque !

2. **Détourage Local Gratuit** :
   - Exécution du détourage avec Sharp + masquage ou le modèle local open-source `RMBG-1.4` / `@imgly/background-removal-node`. Coût : **0 DT**.

---

## 7. Roadmap d'Intégration dans Next.js

1. **Configuration du template Studio** : Page d'upload avec sélecteur de pack (10 ou 20 visuels) et prévisualisation directe.
2. **Connexion de l'API OpenAI** : Mise en place des routes `/api/analyze` et `/api/generate-background`.
3. **Pipeline de Composition & Badges** : Intégration de Sharp et des badges tunisiens (`Livraison 24 gouvernorats`, `Paiement à la livraison`).
4. **Téléchargement ZIP** : Bouton d'exportation en 1 clic pour livrer le pack complet au client.
