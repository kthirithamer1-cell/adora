'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { AgencyConfig, ClientBrand } from '@/lib/agency';

interface AgencyPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgencyPortalModal({ isOpen, onClose }: AgencyPortalModalProps) {
  const { workspace } = useWorkspace();
  const [config, setConfig] = useState<AgencyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'brands' | 'whitelabel'>('overview');

  // Formulaire nouvelle marque client
  const [brandName, setBrandName] = useState('');
  const [brandNiche, setBrandNiche] = useState('Cosmétiques & Parfums');
  const [allocatedCredits, setAllocatedCredits] = useState(40);
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAgencyConfig();
    }
  }, [isOpen, workspace?.id]);

  const loadAgencyConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agency');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error('Erreur agence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async (partial: Partial<AgencyConfig>) => {
    if (!config) return;
    try {
      const updated = { ...config, ...partial };
      setConfig(updated);
      const res = await fetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: '✓ Paramètres agence enregistrés.' });
      }
    } catch (err: any) {
      setMsg({ text: err.message, error: true });
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    setIsSubmittingBrand(true);
    setMsg(null);
    try {
      const res = await fetch('/api/agency/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandName.trim(),
          niche: brandNiche,
          creditsAllocated: allocatedCredits,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBrandName('');
        setMsg({ text: `✓ Client "${data.data.name}" ajouté avec succès !` });
        await loadAgencyConfig();
        setActiveTab('brands');
      }
    } catch (err: any) {
      setMsg({ text: err.message, error: true });
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Retirer cette marque client de l\'espace agence ?')) return;
    try {
      const res = await fetch(`/api/agency/brands?id=${brandId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadAgencyConfig();
      }
    } catch (err) {
      console.error('Erreur suppression marque:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        maxWidth: '720px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        color: '#0F172A',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7E22CE', background: '#FAF5FF', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Offre High-Ticket B2B
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>
                299 DT / Mois
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '6px 0 2px', color: '#0F172A' }}>
              Portail Agence & Marque Blanche 🏆
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Gérez vos marques clientes, supprimez tout branding Adora et exportez en marque blanche
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {msg && (
          <div style={{
            background: msg.error ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${msg.error ? '#FECDD3' : '#BBF7D0'}`,
            color: msg.error ? '#991B1B' : '#166534',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '18px',
          }}>
            {msg.text}
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'overview' ? '1px solid #D8B4FE' : '1px solid transparent',
              background: activeTab === 'overview' ? '#FAF5FF' : 'transparent',
              color: activeTab === 'overview' ? '#7E22CE' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            📊 Vue Générale Agence
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'brands' ? '1px solid #D8B4FE' : '1px solid transparent',
              background: activeTab === 'brands' ? '#FAF5FF' : 'transparent',
              color: activeTab === 'brands' ? '#7E22CE' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            🏢 Marques Clientes ({config?.clientBrands.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whitelabel')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'whitelabel' ? '1px solid #D8B4FE' : '1px solid transparent',
              background: activeTab === 'whitelabel' ? '#FAF5FF' : 'transparent',
              color: activeTab === 'whitelabel' ? '#7E22CE' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            ✨ Mode Marque Blanche
          </button>
        </div>

        {isLoading || !config ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Chargement…</div>
        ) : activeTab === 'overview' ? (
          <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' }}>
              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#7E22CE', textTransform: 'uppercase', fontWeight: 700 }}>Forfait Mensuel</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6B21A8', marginTop: '4px' }}>299 DT / m</div>
                <div style={{ fontSize: '0.72rem', color: '#15803D', marginTop: '2px' }}>Renouvellement automatique</div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Crédits Visuels Inclus</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4F46E5', marginTop: '4px' }}>{config.totalMonthlyCredits} / mois</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Rendus DALL-E 3 & GPT-4o 4K</div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Statut Marque Blanche</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: config.whiteLabelActive ? '#15803D' : '#D97706', marginTop: '4px' }}>
                  {config.whiteLabelActive ? 'ACTIVÉ ✓' : 'STANDBY'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Zero branding Adora</div>
              </div>
            </div>

            {/* Avantages Agence */}
            <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7E22CE', marginBottom: '10px' }}>
                🎯 Ce qui est inclus dans votre Pack Agence 299 DT :
              </h4>
              <ul style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                <li><strong>Marque Blanche Totale :</strong> Vos clients finaux ne voient jamais le nom "Adora". Les archives ZIP portent le nom de votre agence.</li>
                <li><strong>Multi-Comptes Clients :</strong> Basculez d’un client à l’autre (mode, cosmétique, compléments) sans déconnexion.</li>
                <li><strong>Exports Formats Multiples :</strong> Feed 1080x1080, Stories 9:16 sans safe-zone conflictuelle, Facebook Ads et bannières.</li>
                <li><strong>Facturation B2B Proforma & Virement :</strong> Factures conformes avec TVA 19% et matricule fiscal déductible.</li>
              </ul>
            </div>
          </div>
        ) : activeTab === 'brands' ? (
          <div>
            {/* Liste des marques clients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {config.clientBrands.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{b.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                      Niche : {b.niche} • {b.creditsUsed} / {b.creditsAllocated} crédits consommés
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '4px 8px', borderRadius: '6px' }}>
                      {b.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleDeleteBrand(b.id)}
                      style={{ background: '#FEF2F2', border: '1px solid #FECDD3', color: '#E11D48', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulaire ajout client */}
            <form onSubmit={handleAddBrand} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#7E22CE', marginBottom: '12px' }}>
                ➕ Enregistrer un Nouveau Client d'Agence
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Nom du client (ex: Carthage Déco)"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Secteur / Niche d'activité"
                    value={brandNiche}
                    onChange={(e) => setBrandNiche(e.target.value)}
                    style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Crédits"
                    value={allocatedCredits}
                    onChange={(e) => setAllocatedCredits(Number(e.target.value))}
                    style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmittingBrand}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '9px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)' }}
              >
                {isSubmittingBrand ? 'Ajout...' : 'Ajouter le Client'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* White-Label Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Activer la Marque Blanche (White-Label)</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Supprime toute mention d'Adora sur les exports ZIP, badges et documents livrables</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.whiteLabelActive}
                  onChange={(e) => handleUpdateConfig({ whiteLabelActive: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Nom Commercial de Votre Agence</label>
                <input
                  type="text"
                  value={config.agencyName}
                  onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                  onBlur={() => handleUpdateConfig({ agencyName: config.agencyName })}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Sous-domaine personnalisé Agence (Optionnel)</label>
                <input
                  type="text"
                  value={config.customDomain || ''}
                  onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                  onBlur={() => handleUpdateConfig({ customDomain: config.customDomain })}
                  placeholder="studio.monagence.tn"
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Signature de livraison client (Pied de page des archives ZIP)</label>
                <input
                  type="text"
                  value={config.agencyFooterText}
                  onChange={(e) => setConfig({ ...config, agencyFooterText: e.target.value })}
                  onBlur={() => handleUpdateConfig({ agencyFooterText: config.agencyFooterText })}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            Fermer le Portail
          </button>
        </div>
      </div>
    </div>
  );
}
