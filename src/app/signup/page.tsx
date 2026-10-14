'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, Store, Mail, Phone, User as UserIcon } from 'lucide-react';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'free-trial';
  const redirectUrl = searchParams.get('redirect');

  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPaidPlan = plan === 'starter' || plan === 'pro' || plan === 'advanced';
  const planName = plan === 'starter' ? 'Starter ($19)' : plan === 'pro' ? 'Pro ($49)' : plan === 'advanced' ? 'Advanced ($100)' : 'Essai Gratuit';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || email.split('@')[0],
          shopName: shopName.trim() || `${name || 'Ma'} Boutique`,
          email: email.trim(),
          phone: phone.trim() || undefined,
          plan: isPaidPlan ? plan : 'trial',
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (isPaidPlan) {
          setSuccessMessage(`Compte créé avec succès ! Redirection vers la souscription ${planName}...`);
          setTimeout(() => {
            const target = redirectUrl || `/pricing?plan=${plan}&prefill=${encodeURIComponent(email)}`;
            router.push(target);
          }, 800);
        } else {
          setSuccessMessage('🎉 Bienvenue ! Vos 3 visuels gratuits sont activés. Ouverture du studio...');
          setTimeout(() => {
            router.push('/studio?trial=active');
          }, 800);
        }
      } else {
        setErrorMessage(data.error || 'Erreur lors de la création du compte');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07090E',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      fontFamily: 'Outfit, sans-serif',
      color: '#F8FAFC',
      position: 'relative',
    }}>
      {/* Halo lumineux d'arrière plan */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.12) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(60px)',
      }} />

      {/* Header Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '14px' }}>
          <img
            src="/images/Adora_logo.png"
            alt="Adora"
            style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#0B0E14', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFF', letterSpacing: '-0.03em' }}>
            Adora
          </span>
        </Link>

        {isPaidPlan ? (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '9999px',
              color: '#00E5FF',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '10px',
            }}>
              <Sparkles size={14} /> Pack Sélectionné : {planName}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#FFF' }}>
              Finalisez votre compte pour continuer
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '6px' }}>
              Étape 1/2 : Créez votre accès avant le paiement sécurisé Paddle.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '9999px',
              color: '#34D399',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '10px',
            }}>
              <CheckCircle2 size={14} /> Offre Spéciale : 3 Visuels Publicitaires Offerts
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: 0, color: '#FFF' }}>
              Activez votre Essai Gratuit
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '6px' }}>
              1 photo produit = 3 visuels studio (Feed, Story, Ad) prêts à booster vos ventes. Aucune carte bancaire requise.
            </p>
          </div>
        )}
      </div>

      {/* Card Form */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#0B0E14',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '32px 28px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 1,
      }}>
        {errorMessage && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#F87171',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 600,
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            color: '#34D399',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 700,
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Nom & Prénom
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Ex : Mohamed Ben Salah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  background: '#131823',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Nom de votre marque ou boutique
            </label>
            <div style={{ position: 'relative' }}>
              <Store size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Ex : Eau de Rose / NutriStore"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  background: '#131823',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Adresse E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="contact@votre-boutique.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  background: '#131823',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Numéro de téléphone WhatsApp (optionnel)
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="tel"
                placeholder="+216 98 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  background: '#131823',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px',
                  background: '#131823',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '8px',
              padding: '14px',
              background: 'linear-gradient(135deg, #00E5FF 0%, #7C3AED 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#07090E',
              fontSize: '15px',
              fontWeight: 900,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading ? 'Création en cours...' : isPaidPlan ? `Continuer vers ${planName}` : 'Créer mon compte & Obtenir 3 visuels'}
            {!isLoading && <ArrowRight size={17} />}
          </button>
        </form>

        <div style={{
          marginTop: '22px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '13px',
          color: '#94A3B8',
          textAlign: 'center',
        }}>
          <div>
            Déjà inscrit sur Adora ?{' '}
            <Link href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} style={{ color: '#00E5FF', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}>
            <ShieldCheck size={14} color="#10B981" />
            <span>Données sécurisées • Conforme Paddle Merchant of Record</span>
          </div>

          <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/terms" target="_blank" style={{ color: '#94A3B8', textDecoration: 'underline' }}>
              Conditions Générales
            </Link>
            , notre{' '}
            <Link href="/privacy" target="_blank" style={{ color: '#94A3B8', textDecoration: 'underline' }}>
              Politique de Confidentialité
            </Link>{' '}
            et notre{' '}
            <Link href="/refunds" target="_blank" style={{ color: '#94A3B8', textDecoration: 'underline' }}>
              Politique de Remboursement
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07090E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
