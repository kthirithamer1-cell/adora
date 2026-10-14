import React from 'react';
import LegalLayout, { TocItem } from '@/components/legal/LegalLayout';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, Clock, CreditCard, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Politique de Remboursement & Annulation (Refund Policy) — Adora',
  description:
    'Découvrez les conditions de remboursement transparentes d’Adora AI : garantie 14 jours sur forfaits non consommés, recréditation automatique en cas d’anomalie et annulation en 1 clic via Paddle.',
};

const TOC: TocItem[] = [
  { id: 'principes', title: '1. Principes & Transparence' },
  { id: 'biens-numeriques', title: '2. Spécificité des Crédits IA' },
  { id: 'garantie-14-jours', title: '3. Garantie de Rétractation 14 Jours' },
  { id: 'recreditation-defauts', title: '4. Recréditation Automatique' },
  { id: 'annulation-abonnements', title: '5. Résiliation des Abonnements' },
  { id: 'procedure-demande', title: '6. Procédure de Demande' },
  { id: 'delais-modalites', title: '7. Délais & Modalités de Paiement' },
  { id: 'paddle-mor', title: '8. Rôle de Paddle (Merchant of Record)' },
  { id: 'exclusions', title: '9. Cas d’Exclusion' },
  { id: 'contact-support', title: '10. Contact & Assistance Dédiée' },
];

export default function RefundsPage() {
  return (
    <LegalLayout
      currentTab="refunds"
      title="Politique de Remboursement & Rétractation"
      subtitle="Une politique claire, équitable et conforme aux normes internationales de notre Merchant of Record Paddle. Nous privilégions votre satisfaction."
      lastUpdated="14 Octobre 2026"
      toc={TOC}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: '#CBD5E1', fontSize: '0.96rem', lineHeight: 1.75 }}>
        
        {/* Intro Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <RotateCcw size={22} color="#00E5FF" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>
              Garantie d'équité pour les marchands
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Si vous souscrivez à un forfait ou pack de crédits et changez d’avis <strong>sans avoir consommé vos générations</strong>, vous bénéficiez d’un remboursement intégral sous 14 jours sans condition. Si un bug technique empêche la génération d’un visuel, votre crédit vous est <strong>automatiquement restitué</strong>.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section id="principes" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            1. Principes & Transparence
          </h2>
          <p>
            Chez <strong>Adora AI</strong>, nous nous engageons à offrir une expérience transparente et sans friction. La présente politique détaille les conditions dans lesquelles vous pouvez obtenir l’annulation d’un achat, la recréditation de générations ou le remboursement des sommes versées.
          </p>
          <p>
            Cette politique est conforme aux directives de protection des consommateurs dans le commerce électronique et aux standards stricts de notre <em>Merchant of Record</em> mondial <strong>Paddle</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section id="biens-numeriques" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            2. Spécificité des Services Numériques & Crédits de Rendu IA
          </h2>
          <p>
            Les services fournis par Adora consistent en la mise à disposition d’infrastructures de calcul GPU et de modèles d’intelligence artificielle pour la génération immédiate de visuels publicitaires à haute résolution.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Crédits consommés :</strong> Une fois qu’un visuel a été généré avec succès et téléchargé ou mis à disposition de l’Utilisateur, le coût serveur et GPU a été engagé de manière irréversible. Les crédits consommés ne sont donc pas remboursables sous forme monétaire, sauf en cas d’anomalie technique avérée (voir article 4).</li>
            <li><strong>Crédits non consommés :</strong> Les crédits achetés mais non encore utilisés demeurent éligibles à un remboursement dans les conditions précisées ci-après.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="garantie-14-jours" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            3. Garantie de Rétractation de 14 Jours
          </h2>
          <p>
            Tout client achetant un premier pack (Starter $19, Pro $49) ou souscrivant à un abonnement mensuel (Advanced $100 / 299 DT) bénéficie d’un <strong>délai légal de rétractation de 14 jours</strong> calendaires à compter de la date de la commande.
          </p>
          <div
            style={{
              background: '#131823',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              margin: '14px 0',
            }}
          >
            <div style={{ color: '#10B981', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
              Condition de remboursement à 100% :
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.6 }}>
              Si vous n’avez pas consommé de crédits de génération sur la période facturée, votre demande sera acceptée sans discussion et remboursée à 100%. Si vous avez consommé une fraction des crédits pour tester le service (ex: 1 à 2 visuels), un remboursement au prorata ou un geste commercial sous forme de crédits compensatoires vous sera proposé.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="recreditation-defauts" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            4. Recréditation Automatique en Cas d'Anomalie Technique
          </h2>
          <p>
            Nous nous assurons que vous ne payez jamais pour un échec machine :
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '16px 0' }}>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00E5FF', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                <RefreshCw size={16} />
                <span>Échec de Découpage ou de Rendu</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8' }}>
                Si le serveur rencontre un timeout ou une erreur 500 lors de la synthèse du décor, le crédit n'est <strong>jamais décompté</strong> de votre solde.
              </p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>
                <CheckCircle2 size={16} />
                <span>Signalement Visuel Défectueux</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94A3B8' }}>
                Si une aberration visuelle majeure survient malgré le respect des consignes de prise de vue, notre support recrédite manuellement vos générations en 24h.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section id="annulation-abonnements" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            5. Résiliation des Abonnements Récurrents
          </h2>
          <p>
            Les abonnements mensuels Adora sont <strong>sans engagement</strong> de durée :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Vous pouvez interrompre le renouvellement automatique à tout moment en 1 clic depuis votre tableau de bord (« Espace Facturation ») ou via le lien de gestion présent dans les e-mails de facture Paddle.</li>
            <li>L’interruption prend effet à la date d'échéance du cycle mensuel en cours.</li>
            <li>Aucun prélèvement ultérieur ne sera effectué suite à votre confirmation de résiliation.</li>
            <li>Vous conservez l'accès au Studio et à vos crédits restants jusqu'à la fin de la période facturée.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="procedure-demande" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            6. Procédure pour Demander un Remboursement
          </h2>
          <p>
            Pour effectuer une demande de remboursement en toute simplicité, suivez ces 3 étapes :
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ color: '#00E5FF', fontWeight: 900, fontSize: '1.1rem' }}>1</span>
              <span>Rassemblez votre référence de commande Paddle (ex: <code>pdl_...</code> ou numéro de reçu reçu par e-mail).</span>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ color: '#00E5FF', fontWeight: 900, fontSize: '1.1rem' }}>2</span>
              <span>Envoyez un e-mail à <a href="mailto:support@adora.ai" style={{ color: '#00E5FF', fontWeight: 700 }}>support@adora.ai</a> avec pour objet <em>« Demande de remboursement - [N° de commande] »</em>.</span>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ color: '#00E5FF', fontWeight: 900, fontSize: '1.1rem' }}>3</span>
              <span>Notre équipe traite votre demande sous 24h ouvrées et confirme l’ordre de recrédit.</span>
            </div>
          </div>
        </section>

        {/* Section 7 */}
        <section id="delais-modalites" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            7. Délais & Modalités de Paiement
          </h2>
          <p>
            Dès validation par notre service client, l’ordre de remboursement est transmis instantanément à Paddle :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Cartes bancaires (Visa, Mastercard, etc.) :</strong> Les fonds apparaissent sur votre relevé sous 3 à 5 jours ouvrés selon les délais de traitement de votre banque émettrice.</li>
            <li><strong>PayPal :</strong> Le montant est crédité immédiatement sur votre solde PayPal.</li>
            <li><strong>Paiements locaux en Dinars (TND) :</strong> Recréditation via la passerelle émettrice ou virement sous 2 à 4 jours ouvrés.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section id="paddle-mor" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            8. Rôle de Paddle (Merchant of Record)
          </h2>
          <p>
            En tant que Merchant of Record officiel, <strong>Paddle Payments Ltd</strong> assure l’intégrité financière et le respect strict des droits des acheteurs. Si vous rencontrez la moindre difficulté avec une transaction ou si vous souhaitez joindre directement l'assistance de Paddle, vous pouvez consulter le portail d'assistance dédié aux acheteurs sur <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" style={{ color: '#00E5FF', fontWeight: 700 }}>paddle.net</a>.
          </p>
        </section>

        {/* Section 9 */}
        <section id="exclusions" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            9. Cas d'Exclusion
          </h2>
          <p>
            Le remboursement peut être refusé dans les cas exceptionnels suivants :
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Demande effectuée au-delà du délai de rétractation de 14 jours alors que le service a été pleinement accessible.</li>
            <li>Consommation intégrale des quotas de visuels avant l'envoi de la demande de rétractation.</li>
            <li>Comptes clôturés ou suspendus pour violation grave des règles d'usage acceptable (contenus illicites, piratage ou fraude bancaire).</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section id="contact-support" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            10. Contact & Assistance Facturation
          </h2>
          <p>
            Nous sommes à votre écoute pour trouver la solution la plus juste :
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
            <div><strong>Service Client & Facturation Adora AI</strong></div>
            <div>E-mail : <a href="mailto:support@adora.ai" style={{ color: '#00E5FF' }}>support@adora.ai</a></div>
            <div>Assistance Paddle Merchant : <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" style={{ color: '#00E5FF' }}>paddle.net</a></div>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
}
