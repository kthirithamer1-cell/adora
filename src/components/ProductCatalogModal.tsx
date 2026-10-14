'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { CatalogProduct } from '@/lib/brandkit';

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: CatalogProduct) => void;
}

export default function ProductCatalogModal({
  isOpen,
  onClose,
  onSelectProduct,
}: ProductCatalogModalProps) {
  const { workspace } = useWorkspace();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire d'ajout
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [priceTND, setPriceTND] = useState(49);
  const [category, setCategory] = useState('nutrition');
  const [originalImageUrl, setOriginalImageUrl] = useState('/images/bottle_nutrex.png');
  const [descriptionDarija, setDescriptionDarija] = useState('');
  const [badgeId, setBadgeId] = useState('livraison');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, workspace?.id]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement catalogue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || workspace?.name,
          category,
          priceTND: Number(priceTND) || 49,
          originalImageUrl: originalImageUrl.trim(),
          cutoutImageUrl: originalImageUrl.trim(),
          descriptionDarija: descriptionDarija.trim(),
          badgeId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setBrand('');
        setDescriptionDarija('');
        setActiveTab('list');
        await loadProducts();
      }
    } catch (err) {
      console.error('Erreur ajout produit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Supprimer ce produit de votre catalogue marchand ?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
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
        maxWidth: '680px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        color: '#0F172A',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Catalogue Marchand
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 2px', color: '#0F172A' }}>
              Bibliothèque Produits — {workspace?.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Chargez vos articles en 1 clic sans re-télécharger de photo
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'list' ? '1px solid #C7D2FE' : '1px solid transparent',
              background: activeTab === 'list' ? '#EEF2FF' : 'transparent',
              color: activeTab === 'list' ? '#4F46E5' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            📋 Produits Enregistrés ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'add' ? '1px solid #C7D2FE' : '1px solid transparent',
              background: activeTab === 'add' ? '#EEF2FF' : 'transparent',
              color: activeTab === 'add' ? '#4F46E5' : '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            ➕ Ajouter un Article au Catalogue
          </button>
        </div>

        {activeTab === 'list' ? (
          <div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Chargement…</div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <p style={{ color: '#64748B', marginBottom: '14px' }}>Aucun produit enregistré pour cette boutique.</p>
                <button
                  onClick={() => setActiveTab('add')}
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Ajouter votre premier produit ➔
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={p.cutoutImageUrl || p.originalImageUrl}
                          alt={p.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                          <span>{p.brand}</span>
                          <span>•</span>
                          <span style={{ color: '#EA580C', fontWeight: 700 }}>{p.priceTND} DT</span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>{p.category}</span>
                        </div>
                        {p.descriptionDarija && (
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>
                            "{p.descriptionDarija}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                        }}
                      >
                        ⚡ Charger dans le Studio
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECDD3',
                          color: '#E11D48',
                          borderRadius: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Supprimer"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleAddProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Nom du Produit *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Optimum Nutrition Whey 2kg"
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Marque</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Optimum Nutrition"
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Prix de Vente (DT)</label>
                <input
                  type="number"
                  value={priceTND}
                  onChange={(e) => setPriceTND(Number(e.target.value))}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                >
                  <option value="nutrition">Compléments & Sport</option>
                  <option value="mode">Mode & Vêtements</option>
                  <option value="cosmetique">Cosmétiques & Parfums</option>
                  <option value="montre">Montres & Bijoux</option>
                  <option value="deco">Décoration & Maison</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Badge Par Défaut</label>
                <select
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                >
                  <option value="livraison">Livraison 24 Gouvernorats</option>
                  <option value="paiement_livraison">Paiement à la Livraison</option>
                  <option value="authentique">100% Authentique</option>
                  <option value="stock_limite">Stock Limité</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Image du Produit (Chemin ou URL)</label>
              <input
                type="text"
                value={originalImageUrl}
                onChange={(e) => setOriginalImageUrl(e.target.value)}
                placeholder="/images/bottle_nutrex.png"
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#4F46E5', fontWeight: 700, marginBottom: '4px' }}>
                Accroche Darija pour les Stories & Posts :
              </label>
              <input
                type="text"
                value={descriptionDarija}
                onChange={(e) => setDescriptionDarija(e.target.value)}
                placeholder="Ex: Weslet el commande fi boutique mteena, quantité limitée !"
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                style={{ flex: 1, background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', padding: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Retour à la liste
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ flex: 2, background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)' }}
              >
                {isSubmitting ? 'Enregistrement…' : 'Enregistrer dans le Catalogue ➔'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
