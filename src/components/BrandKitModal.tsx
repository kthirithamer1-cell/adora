'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { BrandKit } from '@/lib/brandkit';
import { Upload, Wand2, RefreshCw } from 'lucide-react';
import { extractPaletteFromLogo } from '@/lib/colorExtractor';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (kit: BrandKit) => void;
}

export default function BrandKitModal({ isOpen, onClose, onSaved }: BrandKitModalProps) {
  const { workspace, role } = useWorkspace();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [isColorsFromLogo, setIsColorsFromLogo] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBrandKit();
    }
  }, [isOpen, workspace?.id]);

  const loadBrandKit = async () => {
    setIsLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/brand-kit');
      const data = await res.json();
      if (data.success && data.data) {
        setBrandKit(data.data);
      }
    } catch (err: any) {
      setMsg({ text: 'Erreur chargement Brand Kit', error: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractColors = async (targetLogoUrl?: string) => {
    let url = targetLogoUrl || brandKit?.logoUrl;
    if (!url) return;
    if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith('/')) {
      url = '/' + url;
    }
    setIsExtractingColors(true);
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
      setMsg({ text: `✨ Couleurs extraites du logo : Primaire ${palette.primary}, Secondaire ${palette.secondary}, Accent ${palette.accent}` });
    } catch (e: any) {
      console.error('Erreur extraction couleurs:', e);
      setMsg({ text: 'Erreur lors de l\'extraction des couleurs du logo', error: true });
    } finally {
      setIsExtractingColors(false);
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
          await handleExtractColors(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandKit) return;

    setIsSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandKit),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: '✓ Brand Kit sauvegardé avec succès !' });
        if (onSaved) onSaved(data.data);
      } else {
        setMsg({ text: data.error || 'Erreur lors de la sauvegarde', error: true });
      }
    } catch (err: any) {
      setMsg({ text: err.message, error: true });
    } finally {
      setIsSaving(false);
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
        maxWidth: '640px',
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
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Identité Visuelle Marchande
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 2px', color: '#0F172A' }}>
              Brand Kit — {workspace?.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Personnalisez votre charte graphique et vos coordonnées tunisiennes
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: '1.4rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
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

        {isLoading || !brandKit ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Chargement du Brand Kit…</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Hidden file input pour téléversement de logo */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />

            {/* Nom & Logo avec importation et extraction de couleurs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Nom de l'Enseigne / Boutique
                </label>
                <input
                  type="text"
                  required
                  value={brandKit.shopName}
                  onChange={(e) => setBrandKit({ ...brandKit, shopName: e.target.value })}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>

              {/* Bloc Téléversement de Logo & Extraction (ADORA-62) */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                    Logo Officiel de Marque
                  </label>
                  {isColorsFromLogo && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#065F46',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}>
                      ✨ Couleurs liées au logo
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Miniature Logo avec fond sombre contrasté */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#0F172A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {brandKit.logoUrl ? (
                      <img
                        src={brandKit.logoUrl}
                        alt="Logo Preview"
                        style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>Aucun</span>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Upload size={13} color="#4F46E5" />
                      Importer un logo (PNG / SVG)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExtractColors()}
                      disabled={isExtractingColors}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #00E5FF15, #7C3AED15)',
                        border: '1px solid #7C3AED55',
                        color: '#6D28D9',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      <Wand2 size={13} className={isExtractingColors ? 'animate-spin' : ''} />
                      {isExtractingColors ? 'Extraction...' : 'Extraire les couleurs du logo'}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    value={brandKit.logoUrl}
                    onChange={(e) => setBrandKit({ ...brandKit, logoUrl: e.target.value })}
                    placeholder="URL ou chemin du logo (ex: /images/Adora_logo.png)"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#64748B',
                      fontSize: '0.74rem',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Couleurs de la charte */}
            <div style={{ marginBottom: '18px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Palette de Couleurs Officielle :
                </label>
                {brandKit.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleExtractColors()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7C3AED',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    🪄 Synchroniser avec le logo
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Primaire (Boutons/Accents)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={brandKit.primaryColor}
                      onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                      style={{ width: '38px', height: '36px', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={brandKit.primaryColor}
                      onChange={(e) => setBrandKit({ ...brandKit, primaryColor: e.target.value })}
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 8px', color: '#0F172A', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Secondaire (Promos/Urgence)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={brandKit.secondaryColor}
                      onChange={(e) => setBrandKit({ ...brandKit, secondaryColor: e.target.value })}
                      style={{ width: '38px', height: '36px', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={brandKit.secondaryColor}
                      onChange={(e) => setBrandKit({ ...brandKit, secondaryColor: e.target.value })}
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 8px', color: '#0F172A', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>Accent (Validation/Badge)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={brandKit.accentColor}
                      onChange={(e) => setBrandKit({ ...brandKit, accentColor: e.target.value })}
                      style={{ width: '38px', height: '36px', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={brandKit.accentColor}
                      onChange={(e) => setBrandKit({ ...brandKit, accentColor: e.target.value })}
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 8px', color: '#0F172A', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Barre de prévisualisation du dégradé extrait */}
              <div
                style={{
                  height: '24px',
                  borderRadius: '6px',
                  background: `linear-gradient(135deg, ${brandKit.primaryColor}, ${brandKit.secondaryColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  marginTop: '10px',
                  boxShadow: `0 2px 6px ${brandKit.primaryColor}33`,
                }}
              >
                Harmonie Dégradé Logo ➔ Boutons CTA & Badges
              </div>
            </div>

            {/* Typographie & Slogan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Police Typographique</label>
                <select
                  value={brandKit.fontFamily}
                  onChange={(e) => setBrandKit({ ...brandKit, fontFamily: e.target.value })}
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                >
                  <option value="Outfit, sans-serif">Outfit (Moderne & Sportif)</option>
                  <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Élégant Tech)</option>
                  <option value="Inter, sans-serif">Inter (Neutre & Lisible)</option>
                  <option value="Playfair Display, serif">Playfair Display (Luxe & Mode)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Compte Instagram Pro</label>
                <input
                  type="text"
                  value={brandKit.instagramHandle}
                  onChange={(e) => setBrandKit({ ...brandKit, instagramHandle: e.target.value })}
                  placeholder="@maboutique.tn"
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Accroches & Coordonnées Tunisiennes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>WhatsApp Ventes (Tunisie)</label>
                <input
                  type="text"
                  value={brandKit.whatsappNumber}
                  onChange={(e) => setBrandKit({ ...brandKit, whatsappNumber: e.target.value })}
                  placeholder="+216 98 123 456"
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Mention Livraison Locale</label>
                <input
                  type="text"
                  value={brandKit.deliveryMention}
                  onChange={(e) => setBrandKit({ ...brandKit, deliveryMention: e.target.value })}
                  placeholder="Livraison 24-48h sur 24 gouvernorats"
                  style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Slogan Darija */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#4F46E5', fontWeight: 700, marginBottom: '4px' }}>
                Slogan Commercial en Darija Authentique :
              </label>
              <input
                type="text"
                value={brandKit.sloganDarija}
                onChange={(e) => setBrandKit({ ...brandKit, sloganDarija: e.target.value })}
                placeholder="Ex: Aqwé les compléments fi tounes b a7sen aswem !"
                style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
              />
            </div>

            {/* Watermark toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '22px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Appliquer le Filigrane / Logo sur les Visuels</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Incruste discrètement votre logo sur tous les visuels exportés</div>
              </div>
              <input
                type="checkbox"
                checked={brandKit.watermarkEnabled}
                onChange={(e) => setBrandKit({ ...brandKit, watermarkEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '10px', padding: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving || role === 'designer'}
                style={{ flex: 2, background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: '#FFFFFF', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)' }}
              >
                {isSaving ? 'Sauvegarde…' : '💾 Enregistrer le Brand Kit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
