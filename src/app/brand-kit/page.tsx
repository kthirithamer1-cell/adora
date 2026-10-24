'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthRedirectScreen from '@/components/AuthRedirectScreen';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { BrandKit, CatalogProduct } from '@/lib/brandkit';
import { Palette, MessageSquareText, Package, Plus, Sparkles, Check, Trash2, Camera, ShieldCheck, Upload, Wand2 } from 'lucide-react';
import { extractPaletteFromLogo } from '@/lib/colorExtractor';

export default function BrandKitPage() {
  const router = useRouter();
  const { workspace, user, isLoading: isAuthLoading } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'identity' | 'catalog' | 'ai-extract'>('identity');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login?redirect=/brand-kit');
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'catalog') {
        setActiveTab('catalog');
      }
    }
  }, []);

  // Brand Kit State
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [isLoadingKit, setIsLoadingKit] = useState(true);
  const [isSavingKit, setIsSavingKit] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [isExtractingLogoColors, setIsExtractingLogoColors] = useState(false);
  const [isColorsFromLogo, setIsColorsFromLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Extraction Automatique IA (MarkMosaiq-41)
  const [extractUrl, setExtractUrl] = useState('');
  const [extractInstagram, setExtractInstagram] = useState('');
  const [extractDescription, setExtractDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Products State
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(49);
  const [newProductCategory, setNewProductCategory] = useState('nutrition');
  const [newProductImage, setNewProductImage] = useState('/images/bottle_nutrex.png');
  const [newProductDarija, setNewProductDarija] = useState('');
  const [productError, setProductError] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const handleExtractColorsFromLogo = async (targetLogoUrl?: string) => {
    let url = targetLogoUrl || brandKit?.logoUrl;
    if (!url) {
      setSaveStatus({ text: 'Veuillez d\'abord importer ou spécifier un logo.', error: true });
      setTimeout(() => setSaveStatus(null), 3500);
      return;
    }
    // Normaliser les chemins relatifs sans slash initial
    if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('/')) {
      url = '/' + url;
    }
    setIsExtractingLogoColors(true);
    try {
      const palette = await extractPaletteFromLogo(url);
      setBrandKit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          logoUrl: url,
          primaryColor: palette.primary,
          secondaryColor: palette.secondary,
          accentColor: palette.accent,
          palette: {
            primary: palette.primary,
            secondary: palette.secondary,
            accent: palette.accent,
            background: prev.palette?.background || '#0B0E14',
          },
        };
      });
      setIsColorsFromLogo(true);
      setSaveStatus({
        text: `✨ Couleurs extraites du logo avec succès : ${palette.primary} (Primaire), ${palette.secondary} (Secondaire), ${palette.accent} (Accent)`,
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err: any) {
      console.error('Erreur extraction couleur logo:', err);
      setSaveStatus({ text: 'Erreur lors de l\'extraction des couleurs', error: true });
      setTimeout(() => setSaveStatus(null), 3500);
    } finally {
      setIsExtractingLogoColors(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setBrandKit((prev) => prev ? { ...prev, logoUrl: dataUrl } : prev);
          await handleExtractColorsFromLogo(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleExtractBrandKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractUrl.trim() && !extractInstagram.trim() && !extractDescription.trim()) {
      setExtractError('Veuillez renseigner au moins une URL, un compte Instagram ou une description.');
      return;
    }
    setIsExtracting(true);
    setExtractSuccess(null);
    setExtractError(null);
    try {
      const res = await fetch('/api/brand-kit/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: extractUrl.trim() || undefined,
          instagram: extractInstagram.trim() || undefined,
          description: extractDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'extraction IA.');
      }
      setBrandKit(data.data);
      setExtractSuccess('✓ Brand Kit extrait et configuré avec succès ! Votre charte graphique et vos prompts sont synchronisés.');
      setTimeout(() => setActiveTab('identity'), 2200);
    } catch (err: any) {
      setExtractError(err.message || 'Une erreur est survenue lors de l\'extraction.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Presets de couleurs pour le e-commerce tunisien
  const colorPresets = [
    { name: 'Néon Cyber (Tech/Fitness)', primary: '#00E5FF', secondary: '#FF5722', accent: '#10B981' },
    { name: 'Luxe Médina (Mode/Bijoux)', primary: '#E11D48', secondary: '#F59E0B', accent: '#8B5CF6' },
    { name: 'Bio & Naturel (Cosmétique)', primary: '#10B981', secondary: '#065F46', accent: '#F59E0B' },
    { name: 'Minimaliste Noir & Or', primary: '#F59E0B', secondary: '#1E293B', accent: '#00E5FF' },
  ];

  // Accroches Darija pré-rédigées prêtes à l'emploi
  const darijaPresets = [
    'Aqwé les compléments fi tounes b a7sen aswem !',
    'El livraison fisaa l beb eddar fi 24 gouvernorats.',
    'Zéro sokor, 100% original w el khlass waqt el livri !',
    'Weslet el commande fi boutique mteena, stock limité !',
    'Abathna message sur WhatsApp bech treservi el pack mteeek !',
  ];

  useEffect(() => {
    loadBrandKit();
    loadProducts();
  }, [workspace?.id]);

  const loadBrandKit = async () => {
    setIsLoadingKit(true);
    try {
      const res = await fetch('/api/brand-kit');
      const data = await res.json();
      if (data.success && data.data) {
        setBrandKit(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement Brand Kit:', err);
    } finally {
      setIsLoadingKit(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSaveBrandKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandKit) return;
    setIsSavingKit(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandKit),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus({ text: '✓ Charte graphique & Brand Kit enregistrés avec succès !' });
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus({ text: data.error || 'Erreur de sauvegarde', error: true });
      }
    } catch (err: any) {
      setSaveStatus({ text: err.message || 'Erreur réseau', error: true });
    } finally {
      setIsSavingKit(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      setProductError('Le nom du produit est requis.');
      return;
    }
    setIsSubmittingProduct(true);
    setProductError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName.trim(),
          brand: newProductBrand.trim() || brandKit?.shopName || 'Boutique',
          priceTND: newProductPrice,
          category: newProductCategory,
          originalImageUrl: newProductImage,
          cutoutImageUrl: newProductImage,
          descriptionDarija: newProductDarija,
          badgeId: 'livraison',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => [data.data, ...prev]);
        setShowAddProductModal(false);
        setNewProductName('');
        setNewProductBrand('');
        setNewProductDarija('');
      } else {
        setProductError(data.error || 'Erreur ajout produit');
      }
    } catch (err: any) {
      setProductError(err.message || 'Erreur serveur');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce produit du catalogue ?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error('Erreur suppression produit:', err);
    }
  };

  if (!user) {
    return <AuthRedirectScreen />;
  }

  return (
    <AppShell
      activeNav={activeTab === 'catalog' ? 'catalog' : 'brand-kit'}
      pageTitle={activeTab === 'catalog' ? 'Catalogue Produits E-commerce' : 'Brand Kit & Identité Visuelle'}
      pageBadge={
        activeTab === 'catalog' ? (
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7C3AED', background: '#EDE9FE', padding: '2px 8px', borderRadius: '12px' }}>
            Catalogue Actif
          </span>
        ) : undefined
      }
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

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
                color: '#4F46E5',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: '#EEF2FF',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #E0E7FF',
              }}>
                Identité Visuelle E-commerce
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Boutique active : <strong style={{ color: '#0F172A' }}>{brandKit?.shopName || workspace?.name}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Gestionnaire de Marque & Produits
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Configurez vos couleurs officielles, accroches commerciales et votre catalogue de produits à mettre en scène.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddProductModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <Plus size={16} color="#4F46E5" /> Ajouter un Produit
            </button>
            <Link
              href="/studio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#4F46E5',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
              }}
            >
              <Sparkles size={16} /> Lancer une Génération Studio
            </Link>
          </div>
        </div>

        {/* Barre d'onglets de navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#FFFFFF',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '28px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {[
            { id: 'identity', label: 'Charte Graphique & Couleurs', icon: <Palette size={16} /> },
            { id: 'catalog', label: `Catalogue Produits (${products.length})`, icon: <Package size={16} /> },
            { id: 'ai-extract', label: '🪄 Extraction IA de Marque', icon: <Sparkles size={16} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: '1 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#64748B',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback alert message */}
        {saveStatus && (
          <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 700,
            background: saveStatus.error ? 'rgba(225, 29, 72, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${saveStatus.error ? '#E11D48' : '#10B981'}`,
            color: saveStatus.error ? '#FF6B8B' : '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{saveStatus.text}</span>
            <button
              onClick={() => setSaveStatus(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Contenu principal plein écran */}
        <div style={{ width: '100%' }}>
          {/* ONGLET 1 : IDENTITÉ & CHARTE GRAPHIQUE */}
          {activeTab === 'identity' && brandKit && (
            <form onSubmit={handleSaveBrandKit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Carte 1 : Informations générales & Logo */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                  Identité Officielle de la Boutique
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '8px', fontWeight: 600 }}>
                      Nom de la Marque / Shop
                    </label>
                    <input
                      type="text"
                      value={brandKit.shopName}
                      onChange={(e) => setBrandKit({ ...brandKit, shopName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '8px', fontWeight: 600 }}>
                      Typographie Principale
                    </label>
                    <select
                      value={brandKit.fontFamily}
                      onChange={(e) => setBrandKit({ ...brandKit, fontFamily: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '14px',
                      }}
                    >
                      <option value="Outfit, sans-serif">Outfit (Moderne & Bold)</option>
                      <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Corporate Tech)</option>
                      <option value="Inter, sans-serif">Inter (Minimaliste)</option>
                      <option value="Playfair Display, serif">Playfair Display (Haute Couture & Luxe)</option>
                    </select>
                  </div>
                </div>

                {/* Hidden file input pour téléversement de logo */}
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />

                {/* Bloc Téléversement de Logo & Extraction (MarkMosaiq-62) */}
                <div style={{
                  marginTop: '20px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>
                      Logo Officiel de Marque (PNG / SVG / JPG)
                    </label>
                    {isColorsFromLogo && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#065F46',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        padding: '3px 10px',
                        borderRadius: '12px',
                      }}>
                        ✨ Couleurs synchronisées avec le logo
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Aperçu du logo sur fond sombre contrasté */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                      {brandKit.logoUrl ? (
                        <img
                          src={brandKit.logoUrl}
                          alt="Logo Preview"
                          style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain' }}
                        />
                      ) : (
                        <Camera size={20} color="#94A3B8" />
                      )}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            color: '#1E293B',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          <Upload size={14} color="#4F46E5" />
                          Importer mon Logo (PNG / SVG)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExtractColorsFromLogo()}
                          disabled={isExtractingLogoColors}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: isExtractingLogoColors ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 10px rgba(0, 229, 255, 0.28)',
                            transition: 'all 0.2s ease',
                            opacity: isExtractingLogoColors ? 0.7 : 1,
                          }}
                        >
                          <Wand2 size={14} className={isExtractingLogoColors ? 'animate-spin' : ''} />
                          {isExtractingLogoColors ? 'Extraction en cours...' : '🪄 Extraire les couleurs du logo'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={brandKit.logoUrl}
                          onChange={(e) => setBrandKit({ ...brandKit, logoUrl: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleExtractColorsFromLogo();
                            }
                          }}
                          placeholder="Chemin ou URL du logo (ex: /images/logo.png)"
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            color: '#1E293B',
                            fontSize: '12px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleExtractColorsFromLogo()}
                          disabled={isExtractingLogoColors}
                          title="Extraire depuis cette URL"
                          style={{
                            padding: '8px 12px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Extraire
                        </button>
                      </div>

                      {/* Badges en temps réel des couleurs actives du logo */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Palette active :</span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          border: `1px solid ${brandKit.primaryColor}`,
                          color: '#0F172A',
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: brandKit.primaryColor }} />
                          Primaire {brandKit.primaryColor}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          border: `1px solid ${brandKit.secondaryColor}`,
                          color: '#0F172A',
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: brandKit.secondaryColor }} />
                          Secondaire {brandKit.secondaryColor}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          border: `1px solid ${brandKit.accentColor}`,
                          color: '#0F172A',
                        }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: brandKit.accentColor }} />
                          Accent {brandKit.accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte 2 : Palette de Couleurs Officielles */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={18} color="#4F46E5" />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Palette de Couleurs Officielles
                    </h3>
                  </div>
                  {brandKit.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleExtractColorsFromLogo()}
                      disabled={isExtractingLogoColors}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(0, 229, 255, 0.08)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        borderRadius: '6px',
                        color: '#0284C7',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isExtractingLogoColors ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Wand2 size={13} className={isExtractingLogoColors ? 'animate-spin' : ''} />
                      {isExtractingLogoColors ? 'Extraction...' : '🪄 Ré-extraire du logo'}
                    </button>
                  )}
                </div>

                {/* Barre de prévisualisation du dégradé extrait du logo */}
                <div
                  style={{
                    height: '28px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${brandKit.primaryColor}, ${brandKit.secondaryColor})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    marginBottom: '16px',
                    boxShadow: `0 2px 8px ${brandKit.primaryColor}33`,
                  }}
                >
                  Harmonie Visuelle : Dégradé du Logo ➔ Boutons CTA, Badges & Accents Studio
                </div>

                {/* Boutons de presets rapides */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
                    Thèmes Recommandés pour la Tunisie
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {colorPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBrandKit({
                          ...brandKit,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          accentColor: preset.accent,
                        })}
                        style={{
                          padding: '10px 12px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 600 }}>{preset.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.primary }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.secondary }} />
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pickers manuels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { key: 'primaryColor', label: 'Couleur Primaire (Call-to-Action)' },
                    { key: 'secondaryColor', label: 'Couleur Secondaire (Badges & Tags)' },
                    { key: 'accentColor', label: 'Couleur Accent (Réassurance)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '8px', fontWeight: 600 }}>
                        {label}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                        <input
                          type="color"
                          value={(brandKit as any)[key]}
                          onChange={(e) => setBrandKit({ ...brandKit, [key]: e.target.value })}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: 'transparent',
                          }}
                        />
                        <input
                          type="text"
                          value={(brandKit as any)[key]}
                          onChange={(e) => setBrandKit({ ...brandKit, [key]: e.target.value })}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#0F172A',
                            fontSize: '13px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton de sauvegarde global */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isSavingKit}
                  style={{
                    padding: '14px 28px',
                    background: '#4F46E5',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: isSavingKit ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {isSavingKit ? 'Sauvegarde en cours...' : 'Enregistrer la Charte Graphique'}
                </button>
              </div>
            </form>
          )}



          {/* ONGLET 3 : CATALOGUE PRODUITS */}
          {activeTab === 'catalog' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', margin: '0 0 4px 0' }}>
                    Bibliothèque des Produits du Marchand
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
                    Vos articles détourés en haute définition prêts pour les séances photo virtuelles instantanées.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  style={{
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #00E5FF, #00B4D8)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#07090E',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + Nouveau Produit
                </button>
              </div>

              {isLoadingProducts ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                  Chargement du catalogue marchand...
                </div>
              ) : products.length === 0 ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  background: '#0B0E14',
                  borderRadius: '14px',
                  border: '1px dashed #1E293B',
                }}>
                  <p style={{ color: '#94A3B8', fontSize: '16px', marginBottom: '16px' }}>
                    Aucun produit dans le catalogue pour le moment.
                  </p>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    style={{
                      padding: '10px 20px',
                      background: '#00E5FF',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#07090E',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Ajouter votre premier produit
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px',
                }}>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, border-color 0.2s',
                      }}
                    >
                      <div style={{
                        height: '180px',
                        background: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        padding: '16px',
                      }}>
                        <img
                          src={p.cutoutImageUrl || p.originalImageUrl}
                          alt={p.name}
                          style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#059669',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}>
                          Détouré 4K
                        </span>
                      </div>

                      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700 }}>
                            {p.brand}
                          </span>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: '#4F46E5' }}>
                            {p.priceTND} DT
                          </span>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                          {p.name}
                        </h4>

                        {p.descriptionDarija && (
                          <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0', fontStyle: 'italic', flex: 1 }}>
                            "{p.descriptionDarija}"
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                          <Link
                            href={`/studio?productId=${p.id}`}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '9px 12px',
                              background: '#4F46E5',
                              borderRadius: '6px',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <Sparkles size={14} />
                            <span>Générer Visuel</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{
                              padding: '9px 12px',
                              background: '#FFF1F2',
                              border: '1px solid #FECDD3',
                              borderRadius: '6px',
                              color: '#E11D48',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ONGLET 4 : EXTRACTION AUTOMATIQUE IA DU BRAND KIT (MarkMosaiq-41) */}
          {activeTab === 'ai-extract' && (
            <form onSubmit={handleExtractBrandKit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '28px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🪄</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Extraction Automatique IA de Votre Marque
                  </h3>
                </div>
                <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Indiquez le lien de votre boutique en ligne, votre compte Instagram ou décrivez votre activité. Notre IA analyse votre univers pour extraire vos couleurs officielles, polices, slogans Darija et règles visuelles.
                </p>

                {extractSuccess && (
                  <div style={{
                    padding: '14px 18px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    color: '#15803D',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '20px',
                  }}>
                    {extractSuccess}
                  </div>
                )}

                {extractError && (
                  <div style={{
                    padding: '14px 18px',
                    background: '#FEF2F2',
                    border: '1px solid #FECDD3',
                    borderRadius: '10px',
                    color: '#B91C1C',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '20px',
                  }}>
                    {extractError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#1E293B', marginBottom: '6px', fontWeight: 700 }}>
                      🌐 URL de Votre Site E-commerce (Optionnel)
                    </label>
                    <input
                      type="url"
                      value={extractUrl}
                      onChange={(e) => setExtractUrl(e.target.value)}
                      placeholder="https://maboutique.tn"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#1E293B', marginBottom: '6px', fontWeight: 700 }}>
                      📸 Compte Instagram Professionnel (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={extractInstagram}
                      onChange={(e) => setExtractInstagram(e.target.value)}
                      placeholder="@maboutique.tn"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#1E293B', marginBottom: '6px', fontWeight: 700 }}>
                      📝 Description de Votre Marque & Produits
                    </label>
                    <textarea
                      rows={4}
                      value={extractDescription}
                      onChange={(e) => setExtractDescription(e.target.value)}
                      placeholder="Ex: Nous sommes une marque tunisienne de parfums de luxe et huiles essentielles artisanales. Nos clients recherchent l'élégance, des flacons raffinés et une livraison rapide à domicile..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '14px',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isExtracting}
                    style={{
                      padding: '14px 24px',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: isExtracting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)',
                      marginTop: '8px',
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{isExtracting ? 'Analyse de votre marque par GPT-4o...' : 'Extraire Mon Brand Kit avec l\'IA ➔'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* MODAL AJOUT PRODUIT */}
        {showAddProductModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Ajouter un Produit au Catalogue
                </h3>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '22px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              {productError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(225, 29, 72, 0.1)',
                  border: '1px solid #FECDD3',
                  color: '#E11D48',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}>
                  {productError}
                </div>
              )}

              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: Nutrex Lipo 6 Black Ultra Concentrate"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#F8FAFC',
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
                      Marque / Fabricant
                    </label>
                    <input
                      type="text"
                      value={newProductBrand}
                      onChange={(e) => setNewProductBrand(e.target.value)}
                      placeholder="Ex: Nutrex Research"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Prix de Vente (DT) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Catégorie E-commerce
                    </label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    >
                      <option value="nutrition">Nutrition Sportive</option>
                      <option value="mode">Mode & Prêt-à-porter</option>
                      <option value="cosmetique">Cosmétique & Soins</option>
                      <option value="bijoux">Montres & Bijoux</option>
                      <option value="artisanat">Artisanat Tunisien</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Image détourée
                    </label>
                    <select
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    >
                      <option value="/images/bottle_nutrex.png">Bouteille Nutrex IsoFit</option>
                      <option value="/images/creatine_story.jpg">Boîte Créatine Optimum</option>
                      <option value="/images/gnc_pro_whey_tub_1791150838901.jpg">Pot GNC Pro Whey</option>
                      <option value="/images/hero_lifestyle.jpg">Robe Élégante Tunis</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Argumentaire de vente en Darija
                  </label>
                  <textarea
                    rows={2}
                    value={newProductDarija}
                    onChange={(e) => setNewProductDarija(e.target.value)}
                    placeholder="Ex: A9wa formule brûleur de graisse fi tounes, résultat fisaa !"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
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
                    disabled={isSubmittingProduct}
                    style={{
                      flex: 2,
                      padding: '11px',
                      background: '#4F46E5',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isSubmittingProduct ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                    }}
                  >
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
