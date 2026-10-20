'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/lib/WorkspaceContext';
import {
  Store,
  Palette,
  Share2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Globe,
  Tag,
  Loader2,
} from 'lucide-react';

const NICHES = [
  { id: 'beauty', label: 'Beauté & Soins', icon: '🧴', desc: 'Cosmétiques, Crèmes, Sérums' },
  { id: 'fitness', label: 'Fitness & Nutrition', icon: '⚡', desc: 'Whey, Protéines, Énergie' },
  { id: 'fashion', label: 'Mode & Habillement', icon: '👗', desc: 'Vêtements, Chaussures, Sacs' },
  { id: 'jewelry', label: 'Bijoux & Montres', icon: '⌚', desc: 'Bagues, Montres de Luxe, Colliers' },
  { id: 'tech', label: 'Tech & Gadgets', icon: '🎧', desc: 'Accessoires, Audio, Électronique' },
  { id: 'food', label: 'Alimentation & Boissons', icon: '🍵', desc: 'Café, Gourmandises, Compléments' },
  { id: 'home', label: 'Maison & Décoration', icon: '🏠', desc: 'Bougies, Objets Design, Literie' },
  { id: 'general', label: 'E-commerce Généraliste', icon: '📦', desc: 'Catalogue multi-catégories' },
];

const PRESET_COLORS = [
  { name: 'Royal Indigo', hex: '#6366F1' },
  { name: 'Vibrant Coral', hex: '#F97316' },
  { name: 'Emerald Luxe', hex: '#10B981' },
  { name: 'Electric Cyan', hex: '#00E5FF' },
  { name: 'Hot Magenta', hex: '#EC4899' },
  { name: 'Gold Champagne', hex: '#F59E0B' },
  { name: 'Midnight Slate', hex: '#0F172A' },
  { name: 'Crimson Rose', hex: '#E11D48' },
];

const AD_CHANNELS = [
  { id: 'meta', label: 'Meta Ads (Instagram & FB)', icon: '📸' },
  { id: 'tiktok', label: 'TikTok Ads & Shop (9:16)', icon: '🎵' },
  { id: 'google', label: 'Google Shopping & PMax', icon: '🔍' },
  { id: 'amazon', label: 'Amazon Listings / A+', icon: '🛒' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const destination = (workspace as any)?.pending_checkout ? '/checkout' : '/studio';

  // Step 1: Store Profile
  const [shopName, setShopName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [niche, setNiche] = useState('beauty');

  // Step 2: Brand Kit
  const [logoPreview, setLogoPreview] = useState<string>('/images/logo.png');
  const [primaryColor, setPrimaryColor] = useState<string>('#6366F1');
  const [slogan, setSlogan] = useState<string>('');

  // Step 3: Advertising Channels
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['meta', 'tiktok']);

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: shopName.trim() || 'Ma Boutique',
          logoUrl: logoPreview,
          primaryColor,
          sloganFr: slogan.trim(),
          industry: niche,
          socialHandles: {
            channels: selectedChannels,
            storeUrl: storeUrl.trim(),
          },
        }),
      });
      router.push(destination);
    } catch {
      router.push(destination);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: 'Outfit, sans-serif',
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 16px',
    }}>
      {/* Top Header */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/images/logo.png"
            alt="MarkMosaiq"
            style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }}
          />
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
            Mark<span style={{ color: '#6366F1' }}>Mosaiq</span>
          </span>
        </div>

        <Link
          href={destination}
          style={{
            fontSize: '13px',
            color: destination === '/checkout' ? '#6366F1' : '#64748B',
            textDecoration: 'none',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '20px',
            border: `1px solid ${destination === '/checkout' ? '#C7D2FE' : '#E2E8F0'}`,
            background: destination === '/checkout' ? '#EEF2FF' : '#FFFFFF',
          }}
        >
          {destination === '/checkout' ? 'Finaliser ma commande ➔' : 'Passer cette étape (configurer plus tard) ➔'}
        </Link>
      </div>

      {/* Stepper Indicator */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {[
          { num: 1, label: 'Boutique' },
          { num: 2, label: 'Brand Kit' },
          { num: 3, label: 'Canaux Publicitaires' },
        ].map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isActive ? '#6366F1' : isDone ? '#10B981' : '#E2E8F0',
                color: isActive || isDone ? '#FFFFFF' : '#64748B',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isDone ? <Check size={14} /> : s.num}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#0F172A' : '#64748B',
              }}>
                {s.label}
              </span>
              {s.num < 3 && <span style={{ color: '#CBD5E1', margin: '0 4px' }}>—</span>}
            </div>
          );
        })}
      </div>

      {/* Card Content */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '36px 32px',
        boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.06)',
      }}>
        {/* STEP 1: STORE PROFILE */}
        {currentStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EEF2FF',
                color: '#4F46E5',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '8px',
              }}>
                <Store size={14} /> Étape 1 sur 3
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', color: '#0F172A' }}>
                Profil de Votre Boutique E-commerce
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Ces données calibrent nos générateurs de fonds IA selon votre univers produit.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nom de Marque / Boutique *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aura Skincare"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Site Web / Lien Shopify (Optionnel)
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="https://auraskincare.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                  Secteur / Niche Produit :
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '10px',
                }}>
                  {NICHES.map((n) => {
                    const isSelected = niche === n.id;
                    return (
                      <div
                        key={n.id}
                        onClick={() => setNiche(n.id)}
                        style={{
                          padding: '12px 10px',
                          background: isSelected ? '#EEF2FF' : '#F8FAFC',
                          border: `1.5px solid ${isSelected ? '#6366F1' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{n.icon}</div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#4F46E5' : '#1E293B' }}>
                          {n.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>Continuer vers le Brand Kit</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BRAND KIT */}
        {currentStep === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EEF2FF',
                color: '#4F46E5',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '8px',
              }}>
                <Palette size={14} /> Étape 2 sur 3
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', color: '#0F172A' }}>
                Votre Identité Visuelle (Brand Kit)
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Votre logo et couleur maîtresse seront incrustés automatiquement sur vos visuels exportés.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Logo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Logo Officiel (PNG transparent recommandé)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      objectFit: 'contain',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      padding: '4px',
                    }}
                  />
                  <div>
                    <label style={{
                      padding: '8px 16px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <Upload size={14} />
                      <span>Changer le logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Palette */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Couleur Principale de la Marque :
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map((c) => (
                    <div
                      key={c.hex}
                      onClick={() => setPrimaryColor(c.hex)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: c.hex,
                        cursor: 'pointer',
                        border: primaryColor === c.hex ? '3px solid #0F172A' : '2px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Slogan ou Accroche Commerciale (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: La beauté naturelle sans compromis"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    padding: '12px 18px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Continuer vers les Canaux Pubs</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CHANNELS & COMPLETE */}
        {currentStep === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EEF2FF',
                color: '#4F46E5',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '8px',
              }}>
                <Share2 size={14} /> Étape 3 sur 3
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', color: '#0F172A' }}>
                Vos Canaux Publicitaires Prioritaires
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Nous pré-calibrons les ratios de rendu (1:1 Feed vs 9:16 Stories) dans votre Studio.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {AD_CHANNELS.map((ch) => {
                  const isChecked = selectedChannels.includes(ch.id);
                  return (
                    <div
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isChecked ? '#6366F1' : '#E2E8F0'}`,
                        background: isChecked ? '#EEF2FF' : '#F8FAFC',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{ch.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: isChecked ? '#4F46E5' : '#1E293B' }}>
                        {ch.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{
                    padding: '12px 18px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Retour
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Enregistrement…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Enregistrer et Ouvrir le Studio IA ➔</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
