import React from 'react';
import LegalLayout, { TocItem } from '@/components/legal/LegalLayout';
import { Lock, ShieldCheck, CheckCircle2, EyeOff, Server, Database, UserCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Politique de Confidentialité & Protection des Données (Privacy Policy) — Adora',
  description:
    'Découvrez comment Adora protège vos photos de produits, vos données marchandes et vos informations de paiement en conformité avec les standards de sécurité les plus stricts.',
};

const TOC: TocItem[] = [
  { id: 'engagement', title: '1. Engagement & Responsable' },
  { id: 'donnees-collectees', title: '2. Données Collectées' },
  { id: 'finalites', title: '3. Finalités du Traitement' },
  { id: 'protection-photos', title: '4. Vos Photos & Ségrégation IA' },
  { id: 'paiement-paddle', title: '5. Sécurité Bancaire & Paddle' },
  { id: 'sous-traitants', title: '6. Sous-traitants Certifiés' },
  { id: 'securite-chiffrement', title: '7. Sécurité & Chiffrement' },
  { id: 'conservation', title: '8. Durée de Conservation' },
  { id: 'vos-droits', title: '9. Vos Droits & Portabilité' },
  { id: 'contact-dpo', title: '10. Contact & Délégué aux Données' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      currentTab="privacy"
      title="Politique de Confidentialité & Protection des Données"
      subtitle="La confidentialité de votre catalogue e-commerce et la sécurité de vos informations marchandes constituent notre priorité absolue. Voici notre engagement transparent."
      lastUpdated="14 Octobre 2026"
      toc={TOC}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: '#CBD5E1', fontSize: '0.96rem', lineHeight: 1.75 }}>
        
        {/* Intro Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 229, 255, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <ShieldCheck size={22} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>
              Garantie d'étanchéité de vos visuels produits
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Vos photos de produits, prototypes et nouveaux lancements restent <strong>strictement confidentiels</strong>. Adora ne commercialise jamais vos catalogues, ne les partage à aucun concurrent et isole rigoureusement vos données dans votre espace de travail privé.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section id="engagement" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            1. Engagement Général & Responsable du Traitement
          </h2>
          <p>
            La présente Politique de Confidentialité s’applique à l’ensemble des données personnelles et visuelles collectées sur le site et l’application logicielle <strong>Adora AI</strong>.
          </p>
          <p>
            Le responsable du traitement des données personnelles de la plateforme est la société exploitante d’Adora AI. Pour toute question relative à l’application de cette politique ou à l’exercice de vos droits, vous pouvez nous contacter à <code style={{ color: '#00E5FF' }}>privacy@adora.ai</code>.
          </p>
        </section>

        {/* Section 2 */}
        <section id="donnees-collectees" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            2. Données Collectées
          </h2>
          <p>
            Dans le cadre de l’utilisation de nos services, nous collectons les catégories d’informations suivantes :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Données de compte et d’identité :</strong> Nom, prénom, adresse e-mail professionnelle, numéro de téléphone (optionnel), nom de votre boutique ou marque e-commerce.</li>
            <li><strong>Contenus créatifs et fichiers marchands :</strong> Photos de vos produits téléversées pour détourage, logos de marque, instructions de staging et paramètres de couleur (Brand Kit).</li>
            <li><strong>Données de télémétrie et d’usage :</strong> Historique des générations de visuels, crédits consommés, options sélectionnées (angles de caméra, ratios 1:1 ou 9:16, surfaces de contact).</li>
            <li><strong>Informations techniques :</strong> Adresse IP, type de navigateur, identifiants de session et cookies techniques indispensables.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="finalites" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            3. Finalités du Traitement
          </h2>
          <p>
            Vos informations sont traitées exclusivement pour répondre aux finalités suivantes :
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '16px 0' }}>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#00E5FF', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>Rendu & Mises en Scène</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8' }}>Détourage automatique de l'article, composition avec les arrière-plans IA choisis et projection d'ombres physiques réalistes.</p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#10B981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>Gestion des Abonnements</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8' }}>Suivi des quotas de visuels, renouvellement des forfaits Starter, Pro ou Agence et émission des factures.</p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>Support & Fiabilité</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8' }}>Assistance technique par e-mail, prévention des fraudes et amélioration de la vitesse d'inférence de nos pipelines.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="protection-photos" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            4. Protection de Vos Photos & Ségrégation des Données IA
          </h2>
          <p>
            Le modèle d’ingénierie d’Adora repose sur une règle inviolable :
          </p>
          <div
            style={{
              background: '#0B131E',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: '12px',
              padding: '18px 22px',
              margin: '14px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00E5FF', fontWeight: 800, marginBottom: '8px' }}>
              <EyeOff size={18} />
              <span>Aucune exploitation commerciale de vos visuels</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.6 }}>
              Vos photos de produits ne sont ni vendues, ni louées, ni cédées à des courtiers de données. Elles ne sont <strong>jamais intégrées dans des bases publiques d'entraînement</strong> de modèles tiers. Vos fichiers restent confinés dans l'infrastructure chiffrée dédiée à votre organisation.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="paiement-paddle" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            5. Sécurité Bancaire & Rôle de Paddle
          </h2>
          <p>
            La sécurité de vos règlements est garantie par notre partenaire bancaire agréé :
          </p>
          <p>
            <strong>Paddle Payments Ltd</strong> opère comme <em>Merchant of Record</em>. Lorsque vous souscrivez à un forfait Adora ou réglez un pack de crédits en ligne, vous transmettez directement vos coordonnées de carte bancaire ou compte PayPal sur les serveurs sécurisés de Paddle, certifiés <strong>PCI-DSS Niveau 1</strong> (le plus haut standard international de sécurité bancaire).
          </p>
          <p>
            <strong>Adora ne stocke, ne voit et n’a jamais accès à votre numéro complet de carte bancaire ou code CVV.</strong> Nous recevons uniquement un jeton chiffré (token) confirmant la validité du paiement et l'attribution des crédits correspondants.
          </p>
        </section>

        {/* Section 6 */}
        <section id="sous-traitants" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            6. Sous-traitants & Partenaires Techniques
          </h2>
          <p>
            Pour délivrer un service haute performance, Adora s’appuie exclusivement sur des partenaires d’infrastructure reconnus pour leur conformité aux réglementations de protection des données :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Paddle :</strong> Facturation internationale, conformité fiscale et gestion des devises.</li>
            <li><strong>Infrastructures Cloud & GPU :</strong> Hébergement haute disponibilité, clusters de rendu d’images et serveurs d’inférence sécurisés avec chiffrement des disques.</li>
            <li><strong>Passerelles locales tunisiennes :</strong> Traitement agréé pour les marchands payant en TND (Konnect / Flouci).</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="securite-chiffrement" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            7. Mesures de Sécurité & Chiffrement
          </h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles conformes aux standards de l'art :
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Chiffrement systématique TLS 1.3 / HTTPS de l’ensemble des échanges web et API.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Chiffrement au repos (AES-256) de toutes les images stockées sur nos buckets de médias.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Authentification par sessions sécurisées avec cookies HttpOnly et SameSite stricts.</span>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section id="conservation" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            8. Durée de Conservation des Données
          </h2>
          <p>
            Vos images et métadonnées sont conservées aussi longtemps que votre compte reste actif afin de vous permettre de retélécharger vos visuels à tout moment. Si vous supprimez un produit ou demandez la clôture de votre compte, vos images sont purgées définitivement de nos serveurs actifs sous 30 jours calendaires.
          </p>
          <p>
            Les pièces comptables et factures sont conservées conformément aux durées légales obligatoires imposées par la réglementation fiscale et notre Merchant of Record.
          </p>
        </section>

        {/* Section 9 */}
        <section id="vos-droits" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            9. Vos Droits & Portabilité
          </h2>
          <p>
            Conformément aux réglementations sur la protection des données personnelles, vous disposez des droits suivants :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Droit d'accès et de rectification :</strong> Vous pouvez consulter et corriger vos informations depuis votre profil.</li>
            <li><strong>Droit à l'effacement (« Droit à l'oubli ») :</strong> Vous pouvez exiger la suppression intégrale de vos médias et de votre compte en écrivant au support.</li>
            <li><strong>Droit à la portabilité :</strong> Vous pouvez exporter vos visuels générés sous format haute résolution (PNG / ZIP) à tout moment.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section id="contact-dpo" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            10. Contact & Délégué aux Données
          </h2>
          <p>
            Pour toute réclamation, demande d’exercice de vos droits ou signalement de vulnérabilité :
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
            <div><strong>Délégué à la Protection des Données (DPO) — Adora AI</strong></div>
            <div>E-mail direct : <a href="mailto:privacy@adora.ai" style={{ color: '#00E5FF' }}>privacy@adora.ai</a></div>
            <div>Délai de réponse moyen constaté : <strong>moins de 24 heures ouvrées</strong></div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
}
