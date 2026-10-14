import React from 'react';
import LegalLayout, { TocItem } from '@/components/legal/LegalLayout';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, Scale, Sparkles } from 'lucide-react';

export const metadata = {
  title: "Conditions Générales d'Utilisation et de Vente (Terms of Service) — Adora",
  description:
    "Consultez les Conditions Générales d'Adora AI : modalités d'abonnement, propriété des visuels e-commerce, paiement sécurisé Paddle Merchant of Record et droits d'utilisation.",
};

const TOC: TocItem[] = [
  { id: 'presentation', title: '1. Présentation du Service' },
  { id: 'acceptation', title: '2. Acceptation & Évolution' },
  { id: 'comptes', title: '3. Inscription & Sécurité' },
  { id: 'abonnements-tarifs', title: '4. Formules & Crédits' },
  { id: 'paddle-paiement', title: '5. Paiement & Paddle (MoR)' },
  { id: 'propriete-intellectuelle', title: '6. Propriété & Droits Commerciaux' },
  { id: 'usage-acceptable', title: '7. Usages Acceptables & Restrictions' },
  { id: 'fiabilite-ia', title: '8. Nature des Générations IA' },
  { id: 'resiliation', title: '9. Résiliation de Compte' },
  { id: 'responsabilite-droit', title: '10. Droit Applicable & Contact' },
];

export default function TermsPage() {
  return (
    <LegalLayout
      currentTab="terms"
      title="Conditions Générales d'Utilisation & de Vente"
      subtitle="Cadre contractuel régissant l'utilisation de la plateforme Adora AI, les crédits de génération visuelle pour le commerce électronique et les transactions opérées via Paddle."
      lastUpdated="14 Octobre 2026"
      toc={TOC}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: '#CBD5E1', fontSize: '0.96rem', lineHeight: 1.75 }}>
        
        {/* Intro Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <Sparkles size={22} color="#00E5FF" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>
              Synthèse en langage clair pour les marchands
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Vous conservez <strong>100% de la propriété intellectuelle</strong> de vos produits et des images publicitaires générées sur Adora. Vous êtes libre d’utiliser ces créations à des fins commerciales sans redevance. Nos abonnements et achats de crédits sont sans engagement caché et nos paiements internationaux sont sécurisés par Paddle (Merchant of Record).
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section id="presentation" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            1. Présentation du Service
          </h2>
          <p>
            La plateforme <strong>Adora</strong> (accessible via le domaine web officiel et ses sous-domaines) est une solution SaaS de studio créatif assisté par intelligence artificielle. Adora permet aux marchands en ligne, marques, créateurs et agences d’importer leurs photos de produits brutes pour générer automatiquement des mises en scène publicitaires, des décors studio haute définition, des déclinaisons pour les réseaux sociaux (Instagram, TikTok, Facebook) ainsi que des argumentaires de vente adaptés.
          </p>
          <p>
            Le terme « Utilisateur » ou « Client » désigne toute personne physique ou morale accédant à la plateforme et utilisant ses fonctionnalités gratuites ou payantes.
          </p>
        </section>

        {/* Section 2 */}
        <section id="acceptation" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            2. Acceptation & Évolution des Conditions
          </h2>
          <p>
            L’inscription, l’accès ou l’utilisation de la plateforme Adora emporte acceptation sans réserve des présentes Conditions Générales d’Utilisation et de Vente (CGU/CGV). Si l’Utilisateur n’accepte pas l’intégralité de ces dispositions, il est prié de cesser immédiatement l’utilisation de la plateforme.
          </p>
          <p>
            Adora se réserve le droit de modifier unilatéralement les présentes conditions à tout moment pour tenir compte des évolutions techniques, législatives ou commerciales. Les Utilisateurs inscrits seront informés des modifications substantielles par e-mail ou notification sur leur espace de travail au moins 15 jours avant leur entrée en vigueur.
          </p>
        </section>

        {/* Section 3 */}
        <section id="comptes" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            3. Inscription & Sécurité des Comptes Marchands
          </h2>
          <p>
            Pour accéder aux fonctionnalités complètes du Studio Adora, l’Utilisateur doit créer un compte en fournissant une adresse e-mail professionnelle valide ainsi qu’un mot de passe sécurisé. L’Utilisateur garantit l’exactitude des données transmises et s’engage à mettre à jour ses coordonnées en cas de changement.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Confidentialité des accès :</strong> Les identifiants sont strictement individuels. L'Utilisateur est seul responsable de toute activité réalisée depuis son compte ou ses espaces de travail multi-tenants.</li>
            <li><strong>Suspicion d'intrusion :</strong> Tout usage frauduleux ou tentative d’accès non autorisé doit être notifié sans délai à l'adresse <code style={{ color: '#00E5FF' }}>support@adora.ai</code>.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="abonnements-tarifs" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            4. Formules d'Abonnement, Packs de Crédits & Tarification
          </h2>
          <p>
            Adora propose plusieurs offres commerciales adaptées aux besoins des e-commerçants :
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', margin: '18px 0' }}>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#00E5FF', fontWeight: 800, fontSize: '0.92rem' }}>Pack Starter Découverte</div>
              <div style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, margin: '6px 0' }}>$19 / 59 DT</div>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>Pack ponctuel de 10 visuels studio ultra-HD, sans récurrence obligatoire.</p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#00E5FF', fontWeight: 800, fontSize: '0.92rem' }}>Pack Pro Lancement ⚡</div>
              <div style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, margin: '6px 0' }}>$49 / 149 DT</div>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>Pack étendu de 30 générations studio, déclinaisons multiformats et copies marketing.</p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#A855F7', fontWeight: 800, fontSize: '0.92rem' }}>Abonnement Agence Advanced</div>
              <div style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 900, margin: '6px 0' }}>$100 / 299 DT /mois</div>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>100 crédits mensuels rechargeables, multi-espaces clients et support prioritaire 24/7.</p>
            </div>
          </div>
          <p>
            Les abonnements mensuels sont renouvelés automatiquement à leur date anniversaire jusqu’à résiliation par l’Utilisateur via son espace de facturation. Les crédits non consommés lors d’un mois actif restent valides tant que l’abonnement demeure en cours.
          </p>
        </section>

        {/* Section 5 */}
        <section id="paddle-paiement" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            5. Modalités de Paiement & Rôle de Paddle (Merchant of Record)
          </h2>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '16px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.6 }}>
              <strong>Important :</strong> Pour toutes les commandes internationales réglées par carte bancaire ou PayPal, <strong>Paddle Payments Ltd</strong> (ou Paddle Inc.) intervient en qualité de <em>Merchant of Record</em> (commerçant officiel).
            </p>
          </div>
          <p>
            À ce titre, Paddle encaisse le paiement pour le compte d’Adora, émet les factures officielles incluant la TVA, la Sales Tax ou toute taxe locale applicable selon le pays de l’acheteur, et traite les demandes d’autorisation bancaire 3D Secure v2.
          </p>
          <p>
            Pour les règlements locaux en Tunisie (Dinars Tunisiens TND), les marchands bénéficient d’options de règlement agréées (passerelles nationales Konnect, Flouci ou virement bancaire inter-entreprises avec facturation locale émise par l’entité exploitante).
          </p>
        </section>

        {/* Section 6 */}
        <section id="propriete-intellectuelle" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            6. Propriété Intellectuelle & Droits Commerciaux sur les Visuels
          </h2>
          <p>
            Le respect des marques et des créations de nos clients est au cœur de l’éthique d’Adora :
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#FFFFFF' }}>Vos Produits & Photos Brutes :</strong> Vous conservez l’intégralité de vos droits d’auteur, marques déposées et droits de propriété industrielle sur les photos de vos articles téléversées dans le Studio. Adora n’acquiert aucun droit de propriété sur vos produits.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#FFFFFF' }}>Visuels Publicitaires Générés :</strong> Dès la génération complète et le débit de vos crédits, Adora vous accorde une <strong>licence commerciale exclusive, mondiale, perpétuelle et sans redevance</strong> pour exploiter, modifier, reproduire et diffuser les visuels générés (boutiques Shopify/WooCommerce, catalogues papier, campagnes sponsorisées Meta, TikTok, Google Shopping, etc.).
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#FFFFFF' }}>Technologie Adora :</strong> L’architecture applicative, l’interface graphique, les algorithmes de compositing d’ombres physiques et les modèles logiciels demeurent la propriété exclusive d’Adora.
              </div>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="usage-acceptable" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            7. Usages Acceptables & Restrictions d'Utilisation
          </h2>
          <p>
            En accédant au service Adora, l’Utilisateur s’interdit rigoureusement de :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Téléverser des images de produits contrefaits, illicites, dangereux, diffamatoires ou contraires à l’ordre public.</li>
            <li>Tenter d’extraire le code source, d’effectuer de l’ingénierie inverse (reverse engineering) ou d’automatiser des requêtes massives non autorisées (scraping/DDoS).</li>
            <li>Générer des visuels à caractère haineux, pornographique ou violant les droits de tiers.</li>
          </ul>
          <p>
            Tout manquement donne droit à Adora de suspendre immédiatement le compte de l’Utilisateur sans préavis ni remboursement des crédits résiduels.
          </p>
        </section>

        {/* Section 8 */}
        <section id="fiabilite-ia" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            8. Nature des Générations par Intelligence Artificielle
          </h2>
          <p>
            L’Utilisateur reconnaît que les fonds de décors et éclairages sont synthétisés à l’aide de modèles d’apprentissage profond génératifs. Bien qu’Adora applique un protocole physique strict (détourage haute précision, occlusion ambiante et projection d’ombres relatives), le résultat dépend de la qualité de la photo originale fournie.
          </p>
          <p>
            L’Utilisateur est invité à vérifier l’exactitude de chaque visuel et des textes publicitaires suggérés avant de lancer des dépenses publicitaires à large échelle.
          </p>
        </section>

        {/* Section 9 */}
        <section id="resiliation" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            9. Résiliation & Clôture de Compte
          </h2>
          <p>
            L’Utilisateur peut mettre fin à son abonnement récurrent à tout moment, sans justification ni pénalité, directement depuis l’onglet « Facturation » de son compte ou via le portail de gestion Paddle reçu lors de sa commande.
          </p>
          <p>
            La résiliation prend effet au terme de la période mensuelle en cours. L’Utilisateur conserve l’accès à son espace et à ses crédits jusqu’à l’échéance du cycle de facturation payé.
          </p>
        </section>

        {/* Section 10 */}
        <section id="responsabilite-droit" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            10. Droit Applicable & Contact
          </h2>
          <p>
            Les présentes Conditions Générales sont régies par le droit applicable aux prestations de services numériques et par les dispositions protectrices des transactions commerciales internationales de notre Merchant of Record.
          </p>
          <p>
            En cas de contestation ou de litige, l’Utilisateur s’engage à rechercher en priorité une solution amiable avec le service client d’Adora en écrivant à :
          </p>
          <div
            style={{
              background: '#131823',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div><strong>ADORA AI Studio — Service Juridique & Conformité</strong></div>
            <div>E-mail de support : <a href="mailto:support@adora.ai" style={{ color: '#00E5FF' }}>support@adora.ai</a></div>
            <div>Contact Paddle Billing : <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" style={{ color: '#00E5FF' }}>paddle.net</a></div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
}
