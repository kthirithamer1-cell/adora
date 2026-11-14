'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthRedirectScreen from '@/components/AuthRedirectScreen';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { CatalogProduct } from '@/lib/brandkit';
import {
  ShoppingBag,
  Package,
  Plus,
  Download,
  Sparkles,
  Search,
  Trash2,
  Check,
  AlertCircle,
  Globe,
  Layers,
  Store,
  ArrowRight,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import s from './products.module.css';

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'cosmetics', label: 'Cosmétique & Beauté' },
  { id: 'nutrition', label: 'Nutrition & Sport' },
  { id: 'fashion', label: 'Mode & Vêtements' },
  { id: 'jewelry', label: 'Bijoux & Accessoires' },
  { id: 'general', label: 'Général' },
];

const PRESET_DARIJA_HOOKS = [
  'Weslet el commande fi boutique mteena, stock limité !',
  'Aqwé les produits fi tounes b a7sen aswem w el livraison fisaa !',
  'Original 100% w el khlass and el livraison l beb eddar.',
  'Offre exclusive : abathna message WhatsApp bech tcommander !',
];

export default function ProductsPage() {
  const router = useRouter();
  const { workspace, user, isLoading: isAuthLoading } = useWorkspace();

  // Onglet actif : 'catalog' | 'import' | 'add'
  const [activeTab, setActiveTab] = useState<'catalog' | 'import' | 'add'>('catalog');

  // Mode d'affichage : 'columns' (Grille) ou 'lines' (Lignes)
  const [viewMode, setViewMode] = useState<'columns' | 'lines'>('columns');

  // Produits du catalogue
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Notifications
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // ================= MODULE IMPORT SHOPIFY / WEB =================
  const [importUrl, setImportUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState<any[]>([]);
  const [selectedDetectedIndices, setSelectedDetectedIndices] = useState<number[]>([]);
  const [isSavingImports, setIsSavingImports] = useState(false);
  const [detectedSource, setDetectedSource] = useState<'shopify' | 'website' | null>(null);

  // ================= MODULE AJOUT MANUEL =================
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [priceTND, setPriceTND] = useState(49);
  const [category, setCategory] = useState('cosmetics');
  const [imageUrl, setImageUrl] = useState('/images/bottle_nutrex.png');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionDarija, setDescriptionDarija] = useState(PRESET_DARIJA_HOOKS[0]);
  const [badgeId, setBadgeId] = useState('livraison');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const manualFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProducts();
  }, [workspace?.id]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage et recherche de produits
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Statistiques rapides
  const stats = useMemo(() => {
    const total = products.length;
    const avgPrice = total > 0 ? Math.round(products.reduce((acc, p) => acc + (p.priceTND || 0), 0) / total) : 0;
    const categoriesCount = new Set(products.map((p) => p.category)).size;
    return { total, avgPrice, categoriesCount };
  }, [products]);

  // Détection & Importation Shopify / Site Web
  const handleDetectProducts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!importUrl.trim()) {
      setStatusMsg({ text: 'Veuillez renseigner une URL de boutique Shopify ou de produit.', error: true });
      return;
    }

    setIsDetecting(true);
    setStatusMsg(null);
    setDetectedProducts([]);
    setSelectedDetectedIndices([]);
    setDetectedSource(null);

    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Aucun produit détecté sur cette adresse.');
      }

      setDetectedProducts(data.products || []);
      setDetectedSource(data.source || 'website');
      // Sélectionner tous les produits par défaut
      setSelectedDetectedIndices((data.products || []).map((_: any, idx: number) => idx));
      setStatusMsg({
        text: `✓ ${data.products.length} produit(s) détecté(s) avec succès depuis ${data.source === 'shopify' ? 'Shopify' : 'le site web'} !`,
      });
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Erreur lors de la détection des produits.', error: true });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleToggleSelectProduct = (index: number) => {
    setSelectedDetectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllDetected = () => {
    if (selectedDetectedIndices.length === detectedProducts.length) {
      setSelectedDetectedIndices([]);
    } else {
      setSelectedDetectedIndices(detectedProducts.map((_, i) => i));
    }
  };

  const handleConfirmImport = async () => {
    if (selectedDetectedIndices.length === 0) return;
    setIsSavingImports(true);
    setStatusMsg(null);

    const toImport = selectedDetectedIndices.map((idx) => detectedProducts[idx]);
    let successCount = 0;

    for (const prod of toImport) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: prod.name,
            brand: prod.brand || workspace?.name || 'Boutique',
            category: prod.category || 'general',
            priceTND: prod.priceTND || 49,
            originalImageUrl: prod.originalImageUrl,
            cutoutImageUrl: prod.cutoutImageUrl || prod.originalImageUrl,
            descriptionFr: prod.descriptionFr || '',
            descriptionDarija: prod.descriptionDarija || '',
            badgeId: prod.badgeId || 'livraison',
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          successCount++;
        }
      } catch (err) {
        console.error('Erreur import unitaire:', err);
      }
    }

    setIsSavingImports(false);
    await loadProducts();
    setStatusMsg({
      text: `✓ ${successCount} produit(s) importé(s) dans votre catalogue MarkMosaiq !`,
    });
    setDetectedProducts([]);
    setSelectedDetectedIndices([]);
    setImportUrl('');
    setActiveTab('catalog');
  };

  // Ajout Manuel
  const handleManualImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) setImageUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateManualProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMsg({ text: 'Le nom du produit est obligatoire.', error: true });
      return;
    }

    setIsSubmittingManual(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || workspace?.name || 'Boutique',
          category,
          priceTND: Number(priceTND) || 49,
          originalImageUrl: imageUrl,
          cutoutImageUrl: imageUrl,
          descriptionFr,
          descriptionDarija,
          badgeId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'ajout du produit.");
      }

      await loadProducts();
      setStatusMsg({ text: `✓ Produit "${name}" ajouté au catalogue avec succès !` });
      setName('');
      setDescriptionFr('');
      setActiveTab('catalog');
    } catch (err: any) {
      setStatusMsg({ text: err.message, error: true });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Suppression produit
  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Supprimer le produit "${prodName}" du catalogue ?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setStatusMsg({ text: `✓ Produit "${prodName}" retiré.` });
        setTimeout(() => setStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Sparkles size={32} color="#6366F1" className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthRedirectScreen />;
  }

  return (
    <AppShell activeNav="catalog" pageTitle="Catalogue Produits E-commerce">
      <div className={s.container}>
        {/* En-tête de la page */}
        <div className={s.pageHeader}>
          <div className={s.headerLeft}>
            <div className={s.headerIconWrap}>
              <Package size={26} />
            </div>
            <div>
              <h1 className={s.pageTitle}>Catalogue Produits</h1>
              <p className={s.pageSubtitle}>
                Importez vos articles depuis Shopify, votre site web ou ajoutez-les manuellement pour vos visuels IA.
              </p>
            </div>
          </div>

          <div className={s.headerActions}>
            <button
              type="button"
              className={s.secondaryBtn}
              onClick={() => setActiveTab('import')}
            >
              <Download size={16} />
              <span>Importer Boutique (Shopify, WooCommerce, Converty...)</span>
            </button>

            <button
              type="button"
              className={s.primaryBtn}
              onClick={() => setActiveTab('add')}
            >
              <Plus size={16} />
              <span>Nouveau Produit</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {statusMsg && (
          <div className={`${s.toastNotification} ${statusMsg.error ? s.toastError : s.toastSuccess}`}>
            {statusMsg.error ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Navigation des onglets */}
        <div className={s.tabNav}>
          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'catalog' ? s.tabBtnActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Layers size={16} />
            <span>Tous les produits</span>
            <span className={s.tabBadge}>{products.length}</span>
          </button>

          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'import' ? s.tabBtnActive : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Download size={16} />
            <span>Importer Boutique (Shopify, WooCommerce, Converty...)</span>
          </button>

          <button
            type="button"
            className={`${s.tabBtn} ${activeTab === 'add' ? s.tabBtnActive : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={16} />
            <span>Ajout Manuel</span>
          </button>
        </div>

        {/* ================= VUE 1 : CATALOGUE ACTIF ================= */}
        {activeTab === 'catalog' && (
          <div>
            {/* Bannière de statistiques */}
            <div className={s.statsBanner}>
              <div className={s.statsItems}>
                <div className={s.statItem}>
                  <span className={s.statValue}>{stats.total}</span>
                  <span className={s.statLabel}>Produits Actifs</span>
                </div>
                
                
              </div>

              <Link
                href="/studio"
                className={s.primaryBtn}
                style={{ padding: '8px 16px', fontSize: '0.84rem' }}
              >
                <Sparkles size={15} />
                <span>Créer une pub Studio IA</span>
              </Link>
            </div>

            {/* Barre de Recherche, Filtres de Catégories et Sélecteur Colonnes / Lignes */}
            <div className={s.filterBar}>
              <div className={s.searchWrap}>
                <Search size={16} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={s.searchInput}
                />
              </div>

              <div className={s.categoryPills}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${s.categoryPill} ${selectedCategory === cat.id ? s.categoryPillActive : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Choix d'affichage : Colonnes (Grille) ou Lignes (Liste) */}
              <div className={s.viewToggleWrap}>
                <button
                  type="button"
                  className={`${s.viewToggleBtn} ${viewMode === 'columns' ? s.viewToggleBtnActive : ''}`}
                  onClick={() => setViewMode('columns')}
                  title="Affichage par colonnes (Grille)"
                >
                  <LayoutGrid size={15} />
                  <span>Colonnes</span>
                </button>
                <button
                  type="button"
                  className={`${s.viewToggleBtn} ${viewMode === 'lines' ? s.viewToggleBtnActive : ''}`}
                  onClick={() => setViewMode('lines')}
                  title="Affichage par lignes (Liste)"
                >
                  <List size={15} />
                  <span>Lignes</span>
                </button>
              </div>
            </div>

            {/* Affichage des produits : Par Colonnes ou Par Lignes */}
            {filteredProducts.length === 0 ? (
              <div className={s.emptyState}>
                <div className={s.emptyIconWrap}>
                  <Package size={28} />
                </div>
                <div className={s.emptyTitle}>Aucun produit dans cette sélection</div>
                <p className={s.emptyDesc}>
                  Importez vos collections depuis Shopify, WooCommerce, Converty ou ajoutez vos articles pour générer des shootings studio 4K instantanés.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className={s.secondaryBtn}
                    onClick={() => setActiveTab('import')}
                  >
                    <Download size={15} />
                    <span>Importer Boutique</span>
                  </button>
                  <button
                    type="button"
                    className={s.primaryBtn}
                    onClick={() => setActiveTab('add')}
                  >
                    <Plus size={15} />
                    <span>Ajouter un produit</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'columns' ? (
              <div className={s.productGrid}>
                {filteredProducts.map((p) => (
                  <div key={p.id} className={s.productCard}>
                    {/* Badge commercial local */}
                    <div className={s.productTopBadge}>
                      <span style={{ color: '#16A34A' }}>●</span>
                      <span>Livraison 24-48h</span>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      className={s.deleteBtn}
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      title="Supprimer du catalogue"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Image produit */}
                    <div className={s.productImageArea}>
                      <img
                        src={p.cutoutImageUrl || p.originalImageUrl || '/images/bottle_nutrex.png'}
                        alt={p.name}
                        className={s.productImg}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/bottle_nutrex.png';
                        }}
                      />
                    </div>

                    {/* Corps de la carte */}
                    <div className={s.productBody}>
                      <span className={s.productCategoryLabel}>
                        {CATEGORIES.find((c) => c.id === p.category)?.label || p.category || 'Général'}
                      </span>
                      <h3 className={s.productName}>{p.name}</h3>

                      <div className={s.productPrice}>
                        {p.priceTND} <span className={s.priceCurrency}>DT</span>
                      </div>

                      {p.descriptionDarija && (
                        <div className={s.darijaHookBox}>
                          "{p.descriptionDarija}"
                        </div>
                      )}

                      <div className={s.cardFooter}>
                        <Link
                          href={`/studio?productId=${p.id}&image=${encodeURIComponent(p.originalImageUrl)}`}
                          className={s.stageActionBtn}
                        >
                          <Sparkles size={14} />
                          <span>Mettre en scène IA</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Vue en Lignes (Liste horizontale) */
              <div className={s.productList}>
                {filteredProducts.map((p) => (
                  <div key={p.id} className={s.productLineCard}>
                    <div className={s.lineCardLeft}>
                      <div className={s.lineThumbWrap}>
                        <img
                          src={p.cutoutImageUrl || p.originalImageUrl || '/images/bottle_nutrex.png'}
                          alt={p.name}
                          className={s.lineThumbImg}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/bottle_nutrex.png';
                          }}
                        />
                      </div>
                      <div className={s.lineInfo}>
                        <span className={s.lineCategory}>
                          {CATEGORIES.find((c) => c.id === p.category)?.label || p.category || 'Général'}
                        </span>
                        <div className={s.lineTitle}>{p.name}</div>
                        {p.descriptionDarija && (
                          <div className={s.lineDarija}>"{p.descriptionDarija}"</div>
                        )}
                      </div>
                    </div>

                    <div className={s.lineCardRight}>
                      <div className={s.lineBadge}>
                        <span style={{ color: '#16A34A' }}>●</span>
                        <span>Livraison 24-48h</span>
                      </div>

                      <div className={s.linePrice}>
                        {p.priceTND} <span className={s.priceCurrency}>DT</span>
                      </div>

                      <div className={s.lineActions}>
                        <Link
                          href={`/studio?productId=${p.id}&image=${encodeURIComponent(p.originalImageUrl)}`}
                          className={s.stageActionBtn}
                          style={{ minWidth: '135px' }}
                        >
                          <Sparkles size={14} />
                          <span>Mettre en scène</span>
                        </Link>

                        <button
                          type="button"
                          className={s.lineDeleteBtn}
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          title="Supprimer du catalogue"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VUE 2 : IMPORT SHOPIFY, WOOCOMMERCE, CONVERTY, BIGCOMMERCE ================= */}
        {activeTab === 'import' && (
          <div className={s.importerCard}>
            <div className={s.importerHeader}>
              <div className={s.importerTitle}>
                <Store size={22} color="#059669" />
                <span>Importation Universelle de Produits</span>
                <span className={`${s.platformPill} ${s.badgeNoAi}`}>⚡ 100% Déterministe • Sans IA</span>
              </div>
              <p className={s.importerSubtitle}>
                Collez l'URL de votre boutique ou d'un produit (Shopify, WooCommerce, Converty.shop, BigCommerce, PrestaShop ou site web). MarkMosaiq extrait les visuels HD, les prix en DT et les descriptions sans consommer vos crédits IA.
              </p>

              <div className={s.platformBadgesList}>
                <span className={`${s.platformPill} ${s.badgeShopify}`}>✓ Shopify</span>
                <span className={`${s.platformPill} ${s.badgeWoo}`}>✓ WooCommerce</span>
                <span className={`${s.platformPill} ${s.badgeConverty}`}>✓ Converty (.shop)</span>
                <span className={`${s.platformPill} ${s.badgeBigCommerce}`}>✓ BigCommerce</span>
                <span className={`${s.platformPill} ${s.badgeBigCommerce}`}>✓ PrestaShop & Web</span>
              </div>
            </div>

            <form onSubmit={handleDetectProducts}>
              <div className={s.importerInputWrap}>
                <div className={s.urlInputMain}>
                  <Globe size={18} color="#6366F1" />
                  <input
                    type="text"
                    placeholder="https://maboutique.converty.shop ou https://site.com/products/nom-produit"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={s.primaryBtn}
                  disabled={isDetecting}
                >
                  <Download size={16} />
                  <span>{isDetecting ? 'Extraction en cours...' : 'Extraire les produits (Sans IA)'}</span>
                </button>
              </div>

              {/* Suggestions rapides de test multi-plateformes */}
              <div className={s.quickPresetsRow}>
                <span className={s.presetHint}>Tester une plateforme :</span>
                <button
                  type="button"
                  className={s.presetBtn}
                  onClick={() => setImportUrl('https://nutristore.myshopify.com')}
                >
                  🟢 Shopify
                </button>
                <button
                  type="button"
                  className={s.presetBtn}
                  onClick={() => setImportUrl('https://demo.woothemes.com/woocommerce')}
                >
                  🟣 WooCommerce
                </button>
                <button
                  type="button"
                  className={s.presetBtn}
                  onClick={() => setImportUrl('https://boutique-tunisie.converty.shop')}
                >
                  🔵 Converty.shop
                </button>
                <button
                  type="button"
                  className={s.presetBtn}
                  onClick={() => setImportUrl('https://cornerstone-light-demo.mybigcommerce.com')}
                >
                  ⚫ BigCommerce
                </button>
                <button
                  type="button"
                  className={s.presetBtn}
                  onClick={() => setImportUrl('https://biocare-cosmetics.com/products/serum')}
                >
                  🌐 Site Web Général
                </button>
              </div>
            </form>

            {/* Résultats de la détection */}
            {detectedProducts.length > 0 && (
              <div className={s.resultsSection}>
                <div className={s.resultsHeader}>
                  <span className={s.resultsCount}>
                    {detectedProducts.length} produit(s) détecté(s) ({selectedDetectedIndices.length} sélectionné(s))
                  </span>
                  <div className={s.resultsActions}>
                    <button
                      type="button"
                      className={s.linkBtn}
                      onClick={handleSelectAllDetected}
                    >
                      {selectedDetectedIndices.length === detectedProducts.length
                        ? 'Tout désélectionner'
                        : 'Tout sélectionner'}
                    </button>
                    <button
                      type="button"
                      className={s.primaryBtn}
                      onClick={handleConfirmImport}
                      disabled={isSavingImports || selectedDetectedIndices.length === 0}
                    >
                      <Download size={15} />
                      <span>
                        {isSavingImports
                          ? 'Importation...'
                          : `Importer ${selectedDetectedIndices.length} produit(s)`}
                      </span>
                    </button>
                  </div>
                </div>

                <div className={s.detectedGrid}>
                  {detectedProducts.map((prod, idx) => {
                    const isSelected = selectedDetectedIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`${s.detectedCard} ${isSelected ? s.detectedCardSelected : ''}`}
                        onClick={() => handleToggleSelectProduct(idx)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                        <img
                          src={prod.originalImageUrl}
                          alt={prod.name}
                          className={s.detectedThumb}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/bottle_nutrex.png';
                          }}
                        />
                        <div className={s.detectedInfo}>
                          <div className={s.detectedTitle}>{prod.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span className={s.detectedPrice}>{prod.priceTND} DT</span>
                            <span
                              className={`${s.platformPill} ${
                                prod.platform === 'shopify'
                                  ? s.badgeShopify
                                  : prod.platform === 'woocommerce'
                                  ? s.badgeWoo
                                  : prod.platform === 'converty'
                                  ? s.badgeConverty
                                  : s.badgeBigCommerce
                              }`}
                            >
                              {prod.platform === 'shopify'
                                ? 'Shopify'
                                : prod.platform === 'woocommerce'
                                ? 'WooCommerce'
                                : prod.platform === 'converty'
                                ? 'Converty'
                                : prod.platform === 'bigcommerce'
                                ? 'BigCommerce'
                                : 'Web'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= VUE 3 : AJOUT MANUEL ================= */}
        {activeTab === 'add' && (
          <div className={s.formCard}>
            <form onSubmit={handleCreateManualProduct}>
              <div className={s.formGrid}>
                {/* Colonne Gauche : Upload & Image */}
                <div className={s.imageUploadCol}>
                  <label className={s.formLabel}>Visuel du produit (PNG/JPG)</label>
                  <div
                    className={s.uploadDropzone}
                    onClick={() => manualFileInputRef.current?.click()}
                    title="Cliquez pour importer la photo du produit"
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="Aperçu" className={s.previewImg} />
                    ) : (
                      <>
                        <Package size={32} color="#6366F1" />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', marginTop: '10px' }}>
                          Cliquez pour charger l'image
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Fond blanc ou transparent recommandé
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={manualFileInputRef}
                      onChange={handleManualImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Échantillons d'images de test */}
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                      Ou utiliser un échantillon de test :
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        className={s.presetBtn}
                        onClick={() => setImageUrl('/images/bottle_nutrex.png')}
                      >
                        🧴 Bouteille Sport
                      </button>
                      <button
                        type="button"
                        className={s.presetBtn}
                        onClick={() => setImageUrl('/images/bottle_creatine.png')}
                      >
                        ⚡ Créatine
                      </button>
                    </div>
                  </div>
                </div>

                {/* Colonne Droite : Champs formulaire */}
                <div className={s.fieldsCol}>
                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Nom du produit *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sérum Éclat Niacinamide 30ml"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={s.formInput}
                      />
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Marque / Boutique</label>
                      <input
                        type="text"
                        placeholder="Ex: BioStore Tunisie"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className={s.formInput}
                      />
                    </div>
                  </div>

                  <div className={s.formRow}>
                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Catégorie</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={s.formSelect}
                      >
                        {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={s.formGroup}>
                      <label className={s.formLabel}>Prix en Dinars Tunisiens (DT) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={priceTND}
                        onChange={(e) => setPriceTND(Number(e.target.value))}
                        className={s.formInput}
                      />
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Accroche commerciale en Darija</label>
                    <input
                      type="text"
                      value={descriptionDarija}
                      onChange={(e) => setDescriptionDarija(e.target.value)}
                      placeholder="Ex: Weslet el commande fi boutique mteena !"
                      className={s.formInput}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {PRESET_DARIJA_HOOKS.map((hook, i) => (
                        <button
                          key={i}
                          type="button"
                          className={s.presetBtn}
                          onClick={() => setDescriptionDarija(hook)}
                        >
                          Preset {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel}>Description en français</label>
                    <textarea
                      value={descriptionFr}
                      onChange={(e) => setDescriptionFr(e.target.value)}
                      placeholder="Description des bénéfices produit..."
                      className={s.formTextarea}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="submit"
                      className={s.primaryBtn}
                      disabled={isSubmittingManual}
                    >
                      <Check size={16} />
                      <span>{isSubmittingManual ? 'Enregistrement...' : 'Ajouter au catalogue'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppShell>
  );
}

