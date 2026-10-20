'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { AgencyConfig, ClientBrand } from '@/lib/agency';
import CheckoutModal from '@/components/CheckoutModal';
import { Award, BarChart3, Zap, Building2, Plus, Sparkles } from 'lucide-react';

export default function AgencyPortalPage() {
  const { workspace, role, switchWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'brands' | 'whitelabel' | 'invoicing'>('brands');
  const [agency, setAgency] = useState<AgencyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  // Modal d'ajout de marque cliente
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandNiche, setNewBrandNiche] = useState('Mode & Vêtements');
  const [newBrandCredits, setNewBrandCredits] = useState(40);
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);

  // Modal Checkout pour upgrade ou recharge
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<{
    id: string;
    name: string;
    price: number;
    visualsCount: number;
  }>({
    id: 'agency_299',
    name: 'Abonnement Agence B2B — 200 Visuels',
    price: 299,
    visualsCount: 200,
  });

  useEffect(() => {
    loadAgencyConfig();
  }, [workspace?.id]);

  const loadAgencyConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agency');
      const data = await res.json();
      if (data.success && data.data) {
        setAgency(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement portail agence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAgencyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agency),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAgency(data.data);
        setFeedback({ text: '✓ Paramètres Marque Blanche enregistrés avec succès !' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ text: data.error || 'Erreur lors de la sauvegarde', error: true });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erreur serveur', error: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClientBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setIsSubmittingBrand(true);
    try {
      const res = await fetch('/api/agency/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrandName.trim(),
          niche: newBrandNiche,
          creditsAllocated: newBrandCredits,
          logoUrl: '/images/logo.png',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAgency((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            clientBrands: [data.data, ...prev.clientBrands],
          };
        });
        setShowAddBrandModal(false);
        setNewBrandName('');
        setFeedback({ text: `✓ Marque "${data.data.name}" ajoutée à votre portefeuille !` });
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Erreur ajout marque:', err);
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  const handleRemoveClientBrand = async (brandId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette marque cliente de votre agence ?')) return;
    try {
      const res = await fetch(`/api/agency/brands?id=${brandId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAgency((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            clientBrands: prev.clientBrands.filter((b) => b.id !== brandId),
          };
        });
        setFeedback({ text: 'Marque cliente retirée.' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Erreur retrait marque:', err);
    }
  };

  // Calculs des quotas
  const totalAllocated = agency?.clientBrands.reduce((sum, b) => sum + b.creditsAllocated, 0) || 0;
  const totalUsed = agency?.clientBrands.reduce((sum, b) => sum + b.creditsUsed, 0) || 0;
  const totalCredits = agency?.totalMonthlyCredits || 200;
  const availablePool = Math.max(0, totalCredits - totalAllocated);

  return (
    <AppShell activeNav="agency" pageTitle="Portail Agence B2B & White-Label">
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#7C3AED',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: '#F5F3FF',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #DDD6FE',
              }}>
                Abonnement B2B Agence
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Formule active : <strong style={{ color: '#0F172A' }}>{agency?.monthlyPriceTND || 299} DT / mois</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              {agency?.agencyName || 'Portail Agence Marketing'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Gérez plusieurs boutiques clientes, allouez des quotas de visuels et activez votre marque blanche sans mention d'MarkMosaiq.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setSelectedPlanForCheckout({
                  id: 'agency_590',
                  name: 'Pack Agence Scale — 500 Visuels',
                  price: 590,
                  visualsCount: 500,
                });
                setIsCheckoutOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: '#7C3AED',
                borderRadius: '8px',
                border: 'none',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
              }}
            >
              Upgrade Plan Scale (590 DT)
            </button>
            <button
              onClick={() => setShowAddBrandModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Ajouter une Marque Cliente
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 700,
            background: feedback.error ? '#FEF2F2' : '#ECFDF5',
            border: `1px solid ${feedback.error ? '#FECACA' : '#A7F3D0'}`,
            color: feedback.error ? '#DC2626' : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Cartes KPI Quotas Agence */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            {
              label: 'Crédits Mensuels Totaux',
              val: `${totalCredits}`,
              unit: 'visuels 4K',
              color: '#7C3AED',
              icon: <Award size={18} color="#7C3AED" />,
            },
            {
              label: 'Crédits Alloués aux Marques',
              val: `${totalAllocated} / ${totalCredits}`,
              unit: `${Math.round((totalAllocated / totalCredits) * 100)}% alloués`,
              color: '#4F46E5',
              icon: <BarChart3 size={18} color="#4F46E5" />,
            },
            {
              label: 'Visuels Consommés ce Mois',
              val: `${totalUsed}`,
              unit: 'générations créées',
              color: '#059669',
              icon: <Zap size={18} color="#059669" />,
            },
            {
              label: 'Marques Clientes Gérées',
              val: `${agency?.clientBrands.length || 0}`,
              unit: 'comptes actifs',
              color: '#D97706',
              icon: <Building2 size={18} color="#D97706" />,
            },
          ].map((kpi, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{kpi.label}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>{kpi.icon}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: kpi.color, marginBottom: '4px' }}>
                {kpi.val}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                {kpi.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Barre d'onglets */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#FFFFFF',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {[
            { id: 'brands', label: `Portefeuille Marques (${agency?.clientBrands.length || 0})` },
            { id: 'whitelabel', label: 'Configuration Marque Blanche & Simulateur' },
            { id: 'invoicing', label: 'Facturation B2B & Devis Proforma' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#F5F3FF' : 'transparent',
                  color: isActive ? '#7C3AED' : '#64748B',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #7C3AED' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ONGLET 1 : PORTEFEUILLE MARQUES CLIENTES */}
        {activeTab === 'brands' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Marques & E-shops Gérés
                </h3>
                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                  Chaque marque dispose de son propre Brand Kit, catalogue produits et bibliothèque visuelle isolée.
                </p>
              </div>
              <button
                onClick={() => setShowAddBrandModal(true)}
                style={{
                  padding: '10px 18px',
                  background: '#7C3AED',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                + Ajouter une Marque
              </button>
            </div>

            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                Chargement des marques clientes...
              </div>
            ) : agency?.clientBrands.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '10px' }}>
                <p style={{ color: '#64748B', marginBottom: '14px' }}>Aucune marque cliente enregistrée pour le moment.</p>
                <button
                  onClick={() => setShowAddBrandModal(true)}
                  style={{
                    padding: '10px 18px',
                    background: '#7C3AED',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Ajouter votre premier client
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {agency?.clientBrands.map((brand) => {
                  const percentUsed = Math.min(100, Math.round((brand.creditsUsed / brand.creditsAllocated) * 100));
                  return (
                    <div
                      key={brand.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 20px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        flexWrap: 'wrap',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: '#EEF2FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          border: '1px solid #C7D2FE',
                        }}>
                          🛍️
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                            {brand.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            Secteur : {brand.niche}
                          </div>
                        </div>
                      </div>

                      {/* Quota et barre de progression */}
                      <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                          <span style={{ color: '#64748B' }}>Consommation crédits</span>
                          <span style={{ color: '#0F172A', fontWeight: 700 }}>
                            {brand.creditsUsed} / {brand.creditsAllocated} ({percentUsed}%)
                          </span>
                        </div>
                        <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${percentUsed}%`,
                            background: percentUsed > 80 ? '#EA580C' : '#7C3AED',
                            borderRadius: '3px',
                          }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Link
                          href={`/brand-kit`}
                          style={{
                            padding: '8px 14px',
                            background: '#F5F3FF',
                            border: '1px solid #DDD6FE',
                            borderRadius: '6px',
                            color: '#7C3AED',
                            fontSize: '12px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          Gérer le Brand Kit
                        </Link>
                        <Link
                          href={`/studio`}
                          style={{
                            padding: '8px 14px',
                            background: '#4F46E5',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 800,
                            textDecoration: 'none',
                          }}
                        >
                          Générer Pack
                        </Link>
                        <button
                          onClick={() => handleRemoveClientBrand(brand.id)}
                          style={{
                            padding: '8px 12px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            color: '#DC2626',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ONGLET 2 : MARQUE BLANCHE & SIMULATEUR */}
        {activeTab === 'whitelabel' && agency && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '28px', alignItems: 'start' }}>

            {/* Formulaire Marque Blanche */}
            <form onSubmit={handleSaveAgencyConfig} style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Personnalisation White-Label (100% Marque Blanche)
                </h3>
                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                  Vos clients verront le portail à vos couleurs, sous votre propre nom et logo d'agence.
                </p>
              </div>

              {/* Toggle White Label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Activer le Mode Marque Blanche
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Masque définitivement le logo et toute mention d'MarkMosaiq dans les exports ZIP et PDF.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={agency.whiteLabelActive}
                  onChange={(e) => setAgency({ ...agency, whiteLabelActive: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: '#7C3AED', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                  Nom Officiel de l'Agence
                </label>
                <input
                  type="text"
                  value={agency.agencyName}
                  onChange={(e) => setAgency({ ...agency, agencyName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                  Domaine Personnalisé (CNAME)
                </label>
                <input
                  type="text"
                  value={agency.customDomain || ''}
                  onChange={(e) => setAgency({ ...agency, customDomain: e.target.value })}
                  placeholder="Ex: studio.monagence.tn"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                  Signature de Bas de Page Client (Exports & Rapports)
                </label>
                <textarea
                  rows={3}
                  value={agency.agencyFooterText}
                  onChange={(e) => setAgency({ ...agency, agencyFooterText: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '13px',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '12px 24px',
                    background: '#7C3AED',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? 'Enregistrement...' : 'Sauvegarder la Marque Blanche'}
                </button>
              </div>
            </form>

            {/* Simulateur Live White-Label */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              position: 'sticky',
              top: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Aperçu Portail Client
                </span>
                <span style={{
                  fontSize: '11px',
                  background: agency.whiteLabelActive ? '#ECFDF5' : '#FFF7ED',
                  color: agency.whiteLabelActive ? '#059669' : '#C2410C',
                  border: `1px solid ${agency.whiteLabelActive ? '#A7F3D0' : '#FED7AA'}`,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}>
                  {agency.whiteLabelActive ? '✓ Sans Logo MarkMosaiq' : 'Mode Standard'}
                </span>
              </div>

              {/* Simulation fenêtre navigateur client */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
              }}>
                {/* Barre d'URL mock */}
                <div style={{
                  background: '#EEF2FF',
                  padding: '8px 12px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: '#64748B',
                }}>
                  <span style={{ color: '#059669' }}>🔒</span>
                  <span>https://{agency.customDomain || 'studio.hypergrowth.tn'}</span>
                </div>

                {/* Navbar mock agence */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: 900,
                    }}>
                      H
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                      {agency.agencyName}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    Solde : 60 visuels
                  </span>
                </div>

                {/* Contenu mock */}
                <div style={{ padding: '20px', textAlign: 'center', background: '#FFFFFF' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 12px',
                    background: '#F1F5F9',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    📸
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                    Espace Studio Client
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 16px 0' }}>
                    Téléchargez vos packs de photos sans aucun watermark.
                  </p>
                  <div style={{
                    padding: '8px',
                    background: '#F5F3FF',
                    borderRadius: '6px',
                    fontSize: '10px',
                    color: '#7C3AED',
                    border: '1px solid #DDD6FE',
                  }}>
                    {agency.agencyFooterText}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Certifié 100% anonymisé pour la revente client en Tunisie.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 3 : FACTURATION B2B & DEVIS */}
        {activeTab === 'invoicing' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '28px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Factures Proforma & Règlements d'Entreprise
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                    Documents officiels conformes à la législation fiscale tunisienne (TVA 19% et Timbre fiscal 1.000 DT).
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlanForCheckout({
                      id: 'agency_299',
                      name: 'Abonnement Mensuel Agence — 120 Visuels',
                      price: 299,
                      visualsCount: 120,
                    });
                    setIsCheckoutOpen(true);
                  }}
                  style={{
                    padding: '10px 18px',
                    background: '#4F46E5',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Renouveler / Payer par Virement
                </button>
              </div>

              {/* Table factures */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 16px' }}>Référence</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Désignation</th>
                      <th style={{ padding: '12px 16px' }}>Montant TTC</th>
                      <th style={{ padding: '12px 16px' }}>Statut</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        ref: 'FAC-2026-0312',
                        date: '01/03/2026',
                        item: 'Abonnement Agence B2B — 120 Crédits',
                        ttc: '356.810 DT',
                        status: 'Payée (Virement)',
                      },
                      {
                        ref: 'FAC-2026-0208',
                        date: '01/02/2026',
                        item: 'Abonnement Agence B2B — 120 Crédits',
                        ttc: '356.810 DT',
                        status: 'Payée (Konnect)',
                      },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#4F46E5' }}>{row.ref}</td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>{row.date}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.item}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 800 }}>{row.ttc}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            background: '#ECFDF5',
                            color: '#059669',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: '1px solid #A7F3D0',
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => alert(`Téléchargement de la facture ${row.ref} en PDF...`)}
                            style={{
                              padding: '6px 12px',
                              background: '#EEF2FF',
                              border: '1px solid #C7D2FE',
                              borderRadius: '4px',
                              color: '#4F46E5',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            PDF ⬇
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT MARQUE CLIENTE */}
        {showAddBrandModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              width: '100%',
              maxWidth: '500px',
              padding: '28px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Ajouter une Marque Cliente
                </h3>
                <button
                  onClick={() => setShowAddBrandModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '22px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddClientBrand} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Nom de la Boutique / Client *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Ex: Carthage Décoration"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Niche Commerciale
                    </label>
                    <select
                      value={newBrandNiche}
                      onChange={(e) => setNewBrandNiche(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    >
                      <option value="Mode & Vêtements">Mode & Vêtements</option>
                      <option value="Compléments Alimentaires">Compléments Alimentaires</option>
                      <option value="Cosmétique & Soins">Cosmétique & Soins</option>
                      <option value="Maison & Décoration">Maison & Décoration</option>
                      <option value="Montres & Bijoux">Montres & Bijoux</option>
                      <option value="Artisanat Tunisien">Artisanat Tunisien</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Crédits Alloués
                    </label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={availablePool || 100}
                      value={newBrandCredits}
                      onChange={(e) => setNewBrandCredits(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#64748B',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBrand}
                    style={{
                      flex: 2,
                      padding: '11px',
                      background: '#7C3AED',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isSubmittingBrand ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmittingBrand ? 'Ajout...' : 'Créer la Marque Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CHECKOUT POUR UPGRADE / RENOUVELLEMENT */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          packId={selectedPlanForCheckout.id}
          packName={selectedPlanForCheckout.name}
          priceTND={selectedPlanForCheckout.price}
          visualsCount={selectedPlanForCheckout.visualsCount}
        />

      </div>
    </AppShell>
  );
}
