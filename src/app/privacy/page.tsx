import React from 'react';
import LegalLayout, { TocItem } from '@/components/legal/LegalLayout';
import { ShieldCheck, CheckCircle2, EyeOff, Lock, Server, FileText, Scale } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & GDPR Compliance — MarkMosaiq Technologies Ltd.',
  description:
    'Read our GDPR-compliant Privacy Policy. Learn how MarkMosaiq Technologies Ltd. protects your product assets, merchant catalogs, and personal data in strict compliance with EU Regulation 2016/679.',
};

const TOC: TocItem[] = [
  { id: 'controller', title: '1. Data Controller & Scope' },
  { id: 'data-collected', title: '2. Personal Data We Collect' },
  { id: 'legal-bases', title: '3. Legal Bases for Processing (GDPR)' },
  { id: 'asset-protection', title: '4. Product Asset Protection & AI Policy' },
  { id: 'payment-whop', title: '5. Payments & Whop (Merchant of Record)' },
  { id: 'international-transfers', title: '6. International Data Transfers' },
  { id: 'security', title: '7. Technical & Organizational Security' },
  { id: 'retention', title: '8. Data Retention & Deletion' },
  { id: 'gdpr-rights', title: '9. Your GDPR Data Subject Rights' },
  { id: 'dpo-contact', title: '10. Contact & Irish DPC Supervision' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      currentTab="privacy"
      title="Privacy Policy & GDPR Compliance"
      subtitle="MarkMosaiq Technologies Ltd. is committed to protecting your business assets, product catalogs, and personal data under Regulation (EU) 2016/679 (GDPR)."
      lastUpdated="October 25, 2026"
      toc={TOC}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: '#CBD5E1', fontSize: '0.96rem', lineHeight: 1.75 }}>

        {/* GDPR Seal Banner */}
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
          <ShieldCheck size={24} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 6px', fontSize: '1rem', fontWeight: 800 }}>
              EU GDPR & Irish Data Protection Compliance Guarantee
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Your product assets, trade photos, and customer catalogs remain <strong>strictly confidential</strong>. MarkMosaiq Technologies Ltd. never sells your media, never trains public generative models on your proprietary products, and guarantees end-to-end data segregation in accordance with EU Regulation 2016/679.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section id="controller" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            1. Data Controller & Scope
          </h2>
          <p>
            This Privacy Policy sets out how personal data is collected, stored, and processed by <strong>MarkMosaiq Technologies Ltd.</strong> ("MarkMosaiq", "we", "us", or "our") when you access or use the MarkMosaiq AI creative studio platform.
          </p>
          <div
            style={{
              background: '#131823',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px 20px',
              margin: '14px 0',
            }}
          >
            <div style={{ color: '#FFFFFF', fontWeight: 800, marginBottom: '4px' }}>Registered Legal Entity:</div>
            <div><strong>MarkMosaiq Technologies Ltd.</strong></div>
            <div>The Chase, Carmanhall Road, Sandyford Business Park</div>
            <div>Dublin 18, D18 Y3X2, Ireland</div>
            <div style={{ marginTop: '6px' }}>Email: <a href="mailto:privacy@markmosaiq.ai" style={{ color: '#00E5FF' }}>privacy@markmosaiq.ai</a></div>
          </div>
          <p>
            We act as the <strong>Data Controller</strong> for account registration, billing data, telemetry, and service provisioning under the General Data Protection Regulation (Regulation (EU) 2016/679 - GDPR) and the Irish Data Protection Act 2018.
          </p>
        </section>

        {/* Section 2 */}
        <section id="data-collected" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            2. Personal Data We Collect
          </h2>
          <p>
            We process the minimum necessary personal data required to deliver high-performance visual staging services:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Account & Identity Data:</strong> Full name, business email address, company or store name, hashed password, and preferred UI language.</li>
            <li><strong>Merchant Creative Assets:</strong> Original product photographs uploaded for background removal and staging, brand guidelines, color palettes, and custom slogans.</li>
            <li><strong>Usage & Telemetry Data:</strong> Generation volume, credits consumed, chosen formats (1:1 Feed, 9:16 Stories, 1.91:1 Banners), and log event timestamps.</li>
            <li><strong>Technical & Connectivity Data:</strong> IP address, device user-agent, operating system, and strictly necessary session cookies.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="legal-bases" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            3. Legal Bases for Processing (Article 6 GDPR)
          </h2>
          <p>
            Under Article 6 of the GDPR, every processing operation relies on a verified lawful basis:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '16px 0' }}>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#00E5FF', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>Performance of a Contract (Art. 6(1)(b))</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8' }}>Executing automated product cutout, generating 3D studio environments, allocating monthly credits, and providing customer support.</p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#10B981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>Legitimate Interests (Art. 6(1)(f))</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8' }}>Maintaining platform integrity, preventing fraudulent abuse, defending against cyber attacks, and optimizing GPU inference throughput.</p>
            </div>
            <div style={{ background: '#131823', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.9rem', marginBottom: '6px' }}>Legal Obligation (Art. 6(1)(c))</div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94A3B8' }}>Maintaining statutory commercial accounting, Irish VAT compliance (23% digital services), EU OSS reporting, and tax audit records.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="asset-protection" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            4. Product Asset Protection & AI Model Ethics
          </h2>
          <p>
            Unlike generic consumer AI tools, MarkMosaiq operates under an ironclad enterprise IP protection policy:
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
              <span>Zero Public Model Training & Strict Tenant Isolation</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.6 }}>
              Your product photos, unreleased prototypes, packaging files, and brand assets are <strong>never used to train, fine-tune, or calibrate public AI foundation models</strong>. Your data remains strictly isolated within your organization’s dedicated multi-tenant workspace.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="payment-whop" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            5. Payments & Whop Inc. as Merchant of Record (MoR)
          </h2>
          <p>
            All international transactions, recurring subscription billing, and tax calculations are handled by our certified Merchant of Record:
          </p>
          <p>
            <strong>Whop Inc.</strong> acts as the legal merchant on customer invoices. Whop manages global sales tax, EU VAT MOSS/OSS compliance, and applies the standard <strong>23% Irish VAT</strong> for Irish retail consumers (B2C) or EU reverse-charge (0%) for validated VAT-registered B2B entities.
          </p>
          <p>
            <strong>Cardholder Security:</strong> Payments are processed on Whop's PCI-DSS Level 1 certified infrastructure. MarkMosaiq Technologies Ltd. never receives, stores, or processes your complete credit card numbers, CVVs, or bank security details.
          </p>
        </section>

        {/* Section 6 */}
        <section id="international-transfers" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            6. International Data Transfers & Subprocessors
          </h2>
          <p>
            Where data is transferred outside the European Economic Area (EEA), such transfers are governed by European Commission approved <strong>Standard Contractual Clauses (SCCs)</strong> and the EU-U.S. Data Privacy Framework.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Whop Inc. (USA / Global):</strong> Merchant of Record, automated VAT remittance, and payment processing.</li>
            <li><strong>Supabase Inc. (EU Region - Frankfurt / Ireland):</strong> Encrypted PostgreSQL user authentication and workspace state.</li>
            <li><strong>Enterprise Cloud GPU Clusters:</strong> High-speed headless rendering nodes operating with disk-level encryption.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="security" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            7. Technical & Organizational Security Measures
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>TLS 1.3 / HTTPS encryption for all web endpoints and API transmissions.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>AES-256 encryption at rest for all stored media buckets and staged exports.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>HttpOnly, Secure, and SameSite strict cookies for session token defense.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Row-Level Security (RLS) ensuring strict cryptographic isolation between workspace tenants.</span>
            </div>
          </div>
        </section>

        {/* Section 8 */}
        <section id="retention" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            8. Data Retention & Deletion
          </h2>
          <p>
            Your generated product creatives and uploaded source images are stored during the active lifespan of your account so you can redownload your marketing assets at any time.
          </p>
          <p>
            Upon account closure or an explicit deletion request, all personal data and uploaded media are permanently purged from active storage within <strong>30 calendar days</strong>. Invoicing and financial transaction records are retained for the statutory 6-year period required under Irish tax and company law.
          </p>
        </section>

        {/* Section 9 */}
        <section id="gdpr-rights" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            9. Your GDPR Data Subject Rights (Articles 15–22)
          </h2>
          <p>
            Under Chapter III of the GDPR, European citizens and international customers have the following enforceable rights:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Right of Access (Art. 15):</strong> Request a copy of all personal data held about you.</li>
            <li><strong>Right to Rectification (Art. 16):</strong> Update or correct inaccurate account information directly from your profile.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten", Art. 17):</strong> Request the permanent deletion of your account and uploaded product media.</li>
            <li><strong>Right to Restriction of Processing (Art. 18):</strong> Restrict processing during verification or legal disputes.</li>
            <li><strong>Right to Data Portability (Art. 20):</strong> Export your generated media in structured 4K formats (ZIP / PNG) and account data in JSON format.</li>
            <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or direct marketing at any time.</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section id="dpo-contact" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
            10. Privacy Contact & Supervisory Authority
          </h2>
          <p>
            To exercise any of your GDPR rights or for inquiries regarding data governance:
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
            <div><strong>Data Protection Officer (DPO) — MarkMosaiq Technologies Ltd.</strong></div>
            <div>The Chase, Carmanhall Road, Sandyford Business Park, Dublin 18, D18 Y3X2, Ireland</div>
            <div>Direct Email: <a href="mailto:privacy@markmosaiq.ai" style={{ color: '#00E5FF' }}>privacy@markmosaiq.ai</a></div>
            <div>Response SLA: <strong>within 24 business hours</strong></div>
          </div>
          <p style={{ marginTop: '14px' }}>
            If you are unsatisfied with our response, you have the statutory right under Article 77 GDPR to lodge a complaint with our lead supervisory authority:
          </p>
          <div style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 18px', fontSize: '0.88rem' }}>
            <strong>Data Protection Commission (DPC) Ireland</strong><br />
            21 Fitzwilliam Square South, Dublin 2, D02 RD28, Ireland<br />
            Website: <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" style={{ color: '#00E5FF' }}>dataprotection.ie</a>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
}
