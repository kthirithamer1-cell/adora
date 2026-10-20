'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { BillingTransaction, WorkspaceUsage } from '@/lib/billing';
import CheckoutModal from '@/components/CheckoutModal';

export default function BillingHistoryPage() {
  const { workspace } = useWorkspace();
  const [usage, setUsage] = useState<WorkspaceUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingTransaction | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'invoices' | 'audit_trail'>('invoices');

  useEffect(() => {
    loadUsage();
  }, [workspace?.id]);

  const loadUsage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/usage');
      const data = await res.json();
      if (data.success && data.data) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const transactions = usage?.transactions || [];
  const totalSpentTND = transactions.reduce((acc, t) => acc + t.amountTND, 0);

  const gatewayBadges: Record<string, { label: string; color: string; bg: string }> = {
    whop: { label: 'Whop MoR', color: '#FF6243', bg: 'rgba(255, 98, 67, 0.15)' },
    flouci: { label: 'Flouci Mobile', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.15)' },
    konnect: { label: 'Konnect Gateway', color: '#FF5722', bg: 'rgba(255, 87, 34, 0.15)' },
    b2b_invoice: { label: 'Virement / Chèque B2B', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
  };

  return (
    <AppShell activeNav="billing-history" pageTitle="Historique des Factures & Recharges">
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>

        {/* En-tête de la page */}
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
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: '#ECFDF5',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #A7F3D0',
              }}>
                Comptabilité & Fiscalité Tunisienne
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Espace : <strong style={{ color: '#0F172A' }}>{workspace?.name}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Factures, Devis & Historique des Recharges
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Téléchargez vos factures proforma certifiées avec TVA (19%) et timbre fiscal de 1.000 DT pour vos déclarations d'entreprise.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: '#4F46E5',
                borderRadius: '8px',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              Recharger un Pack en Dinars
            </button>
            <Link
              href="/pricing"
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
                textDecoration: 'none',
              }}
            >
              Consulter les Tarifs
            </Link>
          </div>
        </div>

        {/* 4 Cartes KPI Financières */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            {
              label: 'Total Commandes Réglées',
              val: `${totalSpentTND} DT`,
              sub: 'Dépenses globales en Dinars',
              color: '#0F172A',
            },
            {
              label: 'Solde Crédits Actif',
              val: `${usage?.creditsRemaining ?? workspace?.creditsRemaining ?? 0}`,
              sub: 'Visuels 4K immédiatement disponibles',
              color: '#EA580C',
            },
            {
              label: 'Visuels Utilisés',
              val: `${usage?.creditsUsed ?? 0}`,
              sub: 'Images haute définition générées',
              color: '#4F46E5',
            },
            {
              label: 'Packs ZIP Exportés',
              val: `${usage?.totalPacksExported ?? 1}`,
              sub: 'Archives complètes prêtes pour Facebook/IG',
              color: '#059669',
            },
          ].map((kpi, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: kpi.color, marginBottom: '4px' }}>
                {kpi.val}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Onglets de Navigation : Factures vs Audit Trail API */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              border: activeTab === 'invoices' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
              background: activeTab === 'invoices' ? '#EEF2FF' : '#FFFFFF',
              color: activeTab === 'invoices' ? '#4F46E5' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📄 Factures & Règlements</span>
            <span style={{
              background: activeTab === 'invoices' ? '#4F46E5' : '#E2E8F0',
              color: activeTab === 'invoices' ? '#FFF' : '#475569',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit_trail')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              border: activeTab === 'audit_trail' ? '2px solid #059669' : '1px solid #CBD5E1',
              background: activeTab === 'audit_trail' ? '#ECFDF5' : '#FFFFFF',
              color: activeTab === 'audit_trail' ? '#059669' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚡ Audit Trail des Appels API & Coûts IA (MarkMosaiq-74)</span>
            <span style={{
              background: activeTab === 'audit_trail' ? '#059669' : '#E2E8F0',
              color: activeTab === 'audit_trail' ? '#FFF' : '#475569',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {usage?.apiLogs?.length || 0}
            </span>
          </button>
        </div>

        {/* CONTENU ONGLET 1 : FACTURES & RÈGLEMENTS */}
        {activeTab === 'invoices' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Journal des Règlements & Factures Émises
              </h3>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                ● Rapprochement bancaire automatique
              </span>
            </div>

            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                Chargement de l'historique financier...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed #E2E8F0', borderRadius: '10px' }}>
                <p style={{ color: '#64748B', marginBottom: '14px' }}>Aucune facture enregistrée pour le moment.</p>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  style={{
                    padding: '10px 18px',
                    background: '#4F46E5',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Commander votre premier pack
                </button>
              </div>
            ) : (
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 16px' }}>N° Facture</th>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Pack Acheté</th>
                      <th style={{ padding: '12px 16px' }}>Crédits</th>
                      <th style={{ padding: '12px 16px' }}>Passerelle</th>
                      <th style={{ padding: '12px 16px' }}>Montant Payé</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const badge = gatewayBadges[tx.gateway] || gatewayBadges.flouci;
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#4F46E5' }}>
                            {tx.invoiceNumber}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>
                            {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                            {tx.packName}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#059669', fontWeight: 800 }}>
                            +{tx.creditsAdded}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: badge.color,
                              background: badge.bg,
                              border: `1px solid ${badge.color}40`,
                            }}>
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 900, color: '#0F172A' }}>
                            {tx.amountTND} DT
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedInvoice(tx)}
                              style={{
                                padding: '6px 12px',
                                background: '#EEF2FF',
                                border: '1px solid #C7D2FE',
                                borderRadius: '6px',
                                color: '#4F46E5',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Aperçu Proforma
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET 2 : AUDIT TRAIL API & COÛTS RÉELS IA (MarkMosaiq-74 & MarkMosaiq-73) */}
        {activeTab === 'audit_trail' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Audit Trail Détaillé des Appels API (OpenAI & Moteur Studio)
                </h3>
                <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0' }}>
                  Suivi unitaire des modèles, tokens consommés, latence réseau, débits de crédits et coûts réels en Dinars Tunisiens (USD).
                </p>
              </div>
              <div style={{
                background: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
              }}>
                Coût Cumulé : {usage?.apiMetrics?.totalCostTND ?? 0} DT (${usage?.apiMetrics?.totalCostUSD ?? 0})
              </div>
            </div>

            {(!usage?.apiLogs || usage.apiLogs.length === 0) ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', border: '1px dashed #E2E8F0', borderRadius: '10px' }}>
                Aucun appel API consigné pour ce workspace.
              </div>
            ) : (
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 14px' }}>Date & Heure</th>
                      <th style={{ padding: '12px 14px' }}>Endpoint & Modèle</th>
                      <th style={{ padding: '12px 14px' }}>Produit / Visuel</th>
                      <th style={{ padding: '12px 14px' }}>Résolution / Tokens</th>
                      <th style={{ padding: '12px 14px' }}>Latence</th>
                      <th style={{ padding: '12px 14px' }}>Coût Réel ($ / DT)</th>
                      <th style={{ padding: '12px 14px' }}>Crédits Débités</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.apiLogs.map((log) => {
                      const isImage = log.model.includes('image') || log.model.includes('dall-e') || log.model.includes('sharp');
                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid #E2E8F0', color: '#0F172A' }}>
                          <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{log.model}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{log.endpoint}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.productName || 'Scène Staging Studio'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {isImage ? (
                              <span style={{ fontWeight: 700, color: '#4F46E5' }}>{log.resolution || '1024x1024'}</span>
                            ) : (
                              <span>{log.totalTokens || 0} tokens <small style={{ color: '#94A3B8' }}>({log.promptTokens} in / {log.completionTokens} out)</small></span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748B' }}>
                            {log.latencyMs} ms
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A' }}>
                            {log.costTND.toFixed(4)} DT <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>(${log.costUSD.toFixed(4)})</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {log.creditsDeducted > 0 ? (
                              <span style={{
                                background: '#FEF2F2',
                                color: '#EF4444',
                                border: '1px solid #FECACA',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 800,
                              }}>
                                -{log.creditsDeducted} crédit
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8' }}>Inclus (0)</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              background: '#ECFDF5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '11px',
                            }}>
                              HTTP {log.statusCode}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL APERÇU FACTURE PROFORMA DÉTAILLÉE */}
        {selectedInvoice && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              background: '#FFF',
              color: '#07090E',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              padding: '36px',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>

              {/* En-tête facture */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #07090E', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                    MarkMosaiq STUDIO SARL
                  </h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    Plateforme IA E-Commerce Tunisie<br />
                    Matricule Fiscal : <strong>1849201/X/A/M/000</strong><br />
                    Avenue Habib Bourguiba, Tunis, Tunisie
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#07090E', color: '#FFF', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    FACTURE PROFORMA
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '8px' }}>
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Date : {new Date(selectedInvoice.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Destinataire Client */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Client Facturé :
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>
                  {workspace?.name || 'Boutique E-commerce'}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Espace Marchand : {workspace?.slug || 'nutristore-tn'} — République Tunisienne (24 Gouvernorats)
                </div>
              </div>

              {/* Ligne de commande */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CBD5E1', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px 0' }}>Désignation de la prestation</th>
                    <th style={{ padding: '8px 0', textAlign: 'center' }}>Qté</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Prix Unitaire HT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 0', fontWeight: 700 }}>
                      {selectedInvoice.packName} (+{selectedInvoice.creditsAdded} crédits IA 4K)
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>
                      {(selectedInvoice.amountTND / 1.19).toFixed(3)} DT
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Calculs Fiscaux Tunisie (TVA 19% + Timbre 1.000 DT) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <div style={{ width: '260px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Total Brut HT :</span>
                    <span>{(selectedInvoice.amountTND / 1.19).toFixed(3)} DT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>TVA Tunisienne (19%) :</span>
                    <span>{(selectedInvoice.amountTND - selectedInvoice.amountTND / 1.19).toFixed(3)} DT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Droit de Timbre Fiscal :</span>
                    <span>1.000 DT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '16px', borderTop: '2px solid #07090E', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Net à Payer TTC :</span>
                    <span style={{ color: '#07090E' }}>
                      {(selectedInvoice.amountTND + 1).toFixed(3)} DT
                    </span>
                  </div>
                </div>
              </div>

              {/* Mentions & Boutons d'action */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Passerelle de règlement : <strong>{selectedInvoice.gateway.toUpperCase()}</strong> (Paiement validé)
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      padding: '8px 16px',
                      background: '#4F46E5',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Imprimer / PDF
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    style={{
                      padding: '8px 16px',
                      background: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal de Checkout pour recharge rapide */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          packId="pro"
          packName="Pack Lancement Pro ⚡"
          priceTND={59}
          visualsCount={20}
        />

      </div>
    </AppShell>
  );
}
