'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import AgencyPortalModal from '@/components/AgencyPortalModal';
import BillingUsageModal from '@/components/BillingUsageModal';

export default function WorkspaceSelector() {
  const {
    workspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
  } = useWorkspace();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsPlan, setNewWsPlan] = useState<'flash' | 'pro' | 'agency'>('flash');

  if (!workspace) return null;

  const handleCreateNewWs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    await createWorkspace(newWsName.trim(), newWsPlan);
    setNewWsName('');
    setIsNewWsModalOpen(false);
    setIsDropdownOpen(false);
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'agency':
        return { label: 'AGENCE 🏆', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
      case 'pro':
        return { label: 'PRO ⚡', color: '#FF5722', bg: 'rgba(255, 87, 34, 0.15)' };
      default:
        return { label: 'FLASH', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.15)' };
    }
  };

  const planBadge = getPlanBadge(workspace.plan);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '7px 12px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '0.84rem',
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ fontSize: '0.95rem' }}>🏢</span>
          <span className="ws-selector-name">{workspace.name}</span>
          <span className="ws-badge-plan" style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            color: planBadge.color,
            background: planBadge.bg,
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${planBadge.color}33`,
          }}>
            {planBadge.label}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>▼</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '260px',
            maxWidth: 'calc(100vw - 24px)',
            background: '#0B0E14',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 20px 45px rgba(0,0,0,0.7)',
            zIndex: 100,
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Vos Boutiques & Espaces
            </div>

            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id);
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: ws.id === workspace.id ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                  border: ws.id === workspace.id ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
                  color: ws.id === workspace.id ? '#00E5FF' : '#CBD5E1',
                  fontSize: '0.82rem',
                  fontWeight: ws.id === workspace.id ? 800 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{ws.name}</span>
                {ws.id === workspace.id && <span style={{ fontWeight: 800 }}>✓</span>}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '6px 0', paddingTop: '6px' }} />

            <button
              onClick={() => {
                setIsNewWsModalOpen(true);
                setIsDropdownOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#00E5FF',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ➕ Créer un nouvel espace boutique
            </button>
          </div>
        )}
      </div>

      {/* Bouton Solde Crédits & Facturation */}
      <button
        type="button"
        onClick={() => setIsBillingModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(255, 87, 34, 0.12)',
          border: '1px solid rgba(255, 87, 34, 0.35)',
          borderRadius: '10px',
          padding: '7px 11px',
          color: '#FF7A50',
          fontSize: '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 0 12px rgba(255, 87, 34, 0.12)',
          transition: 'all 0.15s ease',
        }}
      >
        <span>⚡</span>
        <span>{workspace.creditsRemaining}<span className="ws-credits-label"> crédits</span></span>
      </button>

      {/* Bouton Portail Agence si Plan Agence */}
      {workspace.plan === 'agency' && (
        <button
          type="button"
          onClick={() => setIsAgencyModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FAF5FF',
            border: '1px solid #D8B4FE',
            borderRadius: '10px',
            padding: '6px 12px',
            color: '#7E22CE',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 800,
          }}
        >
          <span>🏆</span>
          <span>Portail Agence</span>
        </button>
      )}

      {/* Modal Agence */}
      <AgencyPortalModal
        isOpen={isAgencyModalOpen}
        onClose={() => setIsAgencyModalOpen(false)}
      />

      {/* Modal Facturation & Quotas Dinars */}
      <BillingUsageModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />



      {/* Modal Créer Nouveau Workspace */}
      {isNewWsModalOpen && (
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
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            color: '#0F172A',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: '#0F172A' }}>
              Créer un Nouvel Espace Boutique
            </h3>
            <form onSubmit={handleCreateNewWs}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                  Nom de la Marque ou Boutique
                </label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Ex: Carthage Cosmétiques"
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#0F172A',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                  Forfait Initial
                </label>
                <select
                  value={newWsPlan}
                  onChange={(e: any) => setNewWsPlan(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="flash">Pack Flash (29 DT - 10 visuels)</option>
                  <option value="pro">Pack Pro (59 DT - 20 visuels)</option>
                  <option value="agency">Abonnement Agence (299 DT/mois - White-label)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewWsModalOpen(false)}
                  style={{
                    flex: 1,
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  Créer l'Espace ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
