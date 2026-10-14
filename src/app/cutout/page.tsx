'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useWorkspace } from '@/lib/WorkspaceContext';

export default function CutoutStudioPage() {
  const { workspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputImage, setInputImage] = useState<string>('/images/bottle_nutrex.png');
  const [outputTransparent, setOutputTransparent] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(238);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bgPreview, setBgPreview] = useState<'checker' | 'dark' | 'white' | 'studio'>('checker');
  const [viewMode, setViewMode] = useState<'compare' | 'result'>('compare');
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Exemples de démonstration
  const sampleImages = [
    { label: 'Bouteille Nutrex IsoFit', url: '/images/bottle_nutrex.png' },
    { label: 'Boîte Créatine Story', url: '/images/creatine_story.jpg' },
    { label: 'Pot GNC Pro Whey', url: '/images/gnc_pro_whey_tub_1791150838901.jpg' },
    { label: 'Robe Élégante Tunis', url: '/images/hero_lifestyle.jpg' },
  ];

  useEffect(() => {
    runCutout(inputImage, threshold);
  }, []);

  const runCutout = async (imgSource: string, thresh: number) => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const isBase64 = imgSource.startsWith('data:');
      const payload = isBase64
        ? { imageBase64: imgSource, threshold: thresh }
        : { sampleFile: imgSource, threshold: thresh };

      const res = await fetch('/api/cutout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.transparentBase64) {
        setOutputTransparent(data.transparentBase64);
        setStatusMessage({ text: `✓ Détourage 4K réussi (${data.width}x${data.height}px)` });
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        setStatusMessage({ text: data.error || 'Erreur lors du détourage', error: true });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Erreur serveur', error: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setInputImage(b64);
      runCutout(b64, threshold);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!outputTransparent) return;
    const a = document.createElement('a');
    a.href = outputTransparent;
    a.download = `produit_detoure_adora_${Date.now()}.png`;
    a.click();
  };

  const handleAddToCatalog = async () => {
    if (!outputTransparent) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Produit Détouré Studio (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`,
          brand: workspace?.name || 'Ma Boutique',
          priceTND: 49,
          originalImageUrl: inputImage,
          cutoutImageUrl: outputTransparent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ text: '✓ Produit ajouté au catalogue avec succès !' });
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell activeNav="cutout" pageTitle="Studio Détourage IA & Prise de Vue">
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
                letterSpacing: '0.1em',
                background: '#EEF2FF',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #C7D2FE',
              }}>
                Moteur Sharp Chromatique Haute Définition
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Extraction d'objets sans perte pour le e-commerce
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Studio Détourage IA & Prise de Vue Smartphone
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Photographiez vos produits au téléphone sur fond blanc ou clair, et transformez-les en PNG transparents ultra-nets prêts pour vos mises en scène 4K.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
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
              Importer une Photo Smartphone
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 700,
            background: statusMessage.error ? '#FEF2F2' : '#ECFDF5',
            border: `1px solid ${statusMessage.error ? '#FECACA' : '#A7F3D0'}`,
            color: statusMessage.error ? '#DC2626' : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Grille principale : Paramètres & Visualiseur */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Panneau Latéral : Réglages du Détourage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Boîte 1 : Exemples prêts à l'emploi */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                Exemples de Démonstration
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputImage(s.url);
                      runCutout(s.url, threshold);
                    }}
                    style={{
                      background: '#F8FAFC',
                      border: inputImage === s.url ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={s.url}
                      alt={s.label}
                      style={{ height: '50px', width: '100%', objectFit: 'contain', marginBottom: '6px' }}
                    />
                    <span style={{ fontSize: '11px', color: '#0F172A', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Boîte 2 : Réglages de Tolérance IA */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Sensibilité & Seuil de Blanc
                </h3>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#4F46E5' }}>
                  {threshold} / 255
                </span>
              </div>
              <p style={{ color: '#64748B', fontSize: '12px', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Ajustez pour supprimer les ombres résiduelles ou préserver les reflets doux sur les bords.
              </p>

              <input
                type="range"
                min={200}
                max={250}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4F46E5', cursor: 'pointer' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '6px' }}>
                <span>Bords Doux (200)</span>
                <span>Standard (238)</span>
                <span>Coupe Nette (250)</span>
              </div>

              <button
                onClick={() => runCutout(inputImage, threshold)}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '8px',
                  color: '#4F46E5',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
              >
                {isProcessing ? 'Calcul en cours...' : 'Réappliquer le Détourage'}
              </button>
            </div>

            {/* Boîte 3 : Fond de Prévisualisation */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                Fond d'Aperçu
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'checker', label: 'Damier Transparent' },
                  { id: 'dark', label: 'Contraste Sombre' },
                  { id: 'white', label: 'Blanc Pur' },
                  { id: 'studio', label: 'Teinte Douce' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBgPreview(b.id as any)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: bgPreview === b.id ? '#EEF2FF' : '#F8FAFC',
                      border: bgPreview === b.id ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                      color: bgPreview === b.id ? '#4F46E5' : '#64748B',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Espace Central : Visualiseur Interactif */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            
            {/* Barre de contrôle du visualiseur */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('compare')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    background: viewMode === 'compare' ? '#4F46E5' : '#F8FAFC',
                    color: viewMode === 'compare' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Comparaison Côte à Côte
                </button>
                <button
                  onClick={() => setViewMode('result')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    background: viewMode === 'result' ? '#4F46E5' : '#F8FAFC',
                    color: viewMode === 'result' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Rendu Détouré Seul
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Algorithme : <strong style={{ color: '#059669' }}>Sharp Edge Antialiasing</strong>
              </div>
            </div>

            {/* Zone Visuelle avec Fond Sélectionné */}
            <div style={{
              minHeight: '440px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: viewMode === 'compare' ? '1fr 1fr' : '1fr',
              gap: viewMode === 'compare' ? '16px' : '0',
              padding: '24px',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgPreview === 'white' ? '#FFFFFF' : bgPreview === 'dark' ? '#1E293B' : bgPreview === 'studio' ? '#F1F5F9' : '#FFFFFF',
              backgroundImage: bgPreview === 'checker'
                ? 'linear-gradient(45deg, #E2E8F0 25%, transparent 25%), linear-gradient(-45deg, #E2E8F0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E2E8F0 75%), linear-gradient(-45deg, transparent 75%, #E2E8F0 75%)'
                : 'none',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}>
              
              {/* Photo originale (si mode compare) */}
              {viewMode === 'compare' && (
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#FFF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    Photo Originale
                  </span>
                  <img
                    src={inputImage}
                    alt="Original"
                    style={{
                      maxHeight: '340px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      marginTop: '24px',
                    }}
                  />
                </div>
              )}

              {/* Rendu détouré transparent */}
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  color: '#4F46E5',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}>
                  Détouré HD Transparent
                </span>

                {isProcessing ? (
                  <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontSize: '14px', fontWeight: 700 }}>
                    Suppression du fond en cours...
                  </div>
                ) : outputTransparent ? (
                  <img
                    src={outputTransparent}
                    alt="Cutout Transparent"
                    style={{
                      maxHeight: '340px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      marginTop: '24px',
                      filter: bgPreview === 'white' ? 'none' : 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))',
                    }}
                  />
                ) : (
                  <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                    Aucun rendu disponible
                  </div>
                )}
              </div>

            </div>

            {/* Barre d'Actions d'Exportation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #E2E8F0',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <button
                onClick={handleDownload}
                disabled={!outputTransparent}
                style={{
                  padding: '11px 20px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: !outputTransparent ? 'not-allowed' : 'pointer',
                }}
              >
                Télécharger le PNG HD
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleAddToCatalog}
                  disabled={!outputTransparent}
                  style={{
                    padding: '11px 18px',
                    background: '#F5F3FF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '8px',
                    color: '#7C3AED',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: !outputTransparent ? 'not-allowed' : 'pointer',
                  }}
                >
                  Ajouter au Catalogue
                </button>
                <Link
                  href="/studio"
                  style={{
                    padding: '11px 22px',
                    background: '#4F46E5',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 900,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  Mettre en Scène dans le Studio ➔
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
