'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
const DEMO_USERS = [
  {
    id: 'user_mohamed',
    email: 'mohamed@nutristore.tn',
    name: 'Mohamed Ben Salah',
    roleLabel: 'Owner (NutriStore)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'user_syrine',
    email: 'syrine@nutristore.tn',
    name: 'Syrine Trabelsi',
    roleLabel: 'Manager E-commerce',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'user_agence',
    email: 'contact@hypergrowth.tn',
    name: 'Karim Gharbi (HyperGrowth Agency)',
    roleLabel: 'CEO Agence B2B',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
  },
  {
    id: 'user_yassine',
    email: 'yassine@crea.tn',
    name: 'Yassine Jaziri',
    roleLabel: 'Designer Studio',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('mohamed@nutristore.tn');
  const [password, setPassword] = useState('••••••••••••');
  const [phone, setPhone] = useState('+216 98 123 456');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (targetUserId?: string, targetEmail?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          email: targetEmail || (authMode === 'email' ? email : undefined),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Bienvenue ${data.data.user.name} ! Redirection en cours...`);
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Identifiants incorrects');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(undefined, email);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      fontFamily: 'Outfit, sans-serif',
      color: '#0F172A',
    }}>
      
      {/* Logo & En-tête */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/images/Adora_logo.png"
            alt="Adora Logo"
            style={{ height: '40px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Adora <span style={{ color: '#4F46E5' }}>Studio</span>
          </span>
        </Link>
        <div style={{
          marginTop: '10px',
          display: 'inline-block',
          background: '#EEF2FF',
          border: '1px solid #C7D2FE',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#4F46E5',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Accès Marchand E-commerce Tunisie 🇹🇳
        </div>
      </div>

      {/* Carte de Connexion Principale */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '36px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
      }}>
        
        <h1 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 8px 0', textAlign: 'center', color: '#0F172A' }}>
          Connectez-vous à votre Espace
        </h1>
        <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', margin: '0 0 24px 0' }}>
          Accédez à vos générations 4K, votre catalogue et votre tableau de bord.
        </p>

        {/* Messages d'alerte */}
        {errorMessage && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background: '#FEF2F2',
            border: '1px solid #FECDD3',
            color: '#991B1B',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '12px 14px',
            borderRadius: '8px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#166534',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {successMessage}
          </div>
        )}

        {/* Bascule Email / Téléphone WhatsApp */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #E2E8F0',
        }}>
          <button
            type="button"
            onClick={() => setAuthMode('email')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: authMode === 'email' ? '#FFFFFF' : 'transparent',
              color: authMode === 'email' ? '#4F46E5' : '#64748B',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Email Professionnel
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('phone')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: authMode === 'phone' ? '#FFFFFF' : 'transparent',
              color: authMode === 'phone' ? '#4F46E5' : '#64748B',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: authMode === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            WhatsApp / SMS (+216)
          </button>
        </div>

        {/* Formulaire standard */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {authMode === 'email' ? (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                Adresse Email Marchand
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@maboutique.tn"
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
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                Numéro WhatsApp Tunisien
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 98 000 000"
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
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                Mot de Passe
              </label>
              <a href="#" style={{ fontSize: '11px', color: '#4F46E5', textDecoration: 'none', fontWeight: 700 }}>
                Mot de passe oublié ?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '13px',
              background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 900,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
            }}
          >
            {isLoading ? 'Connexion en cours...' : 'Accéder au Studio ➔'}
          </button>
        </form>

        {/* Séparateur pour accès direct démo */}
        <div style={{
          position: 'relative',
          margin: '28px 0 20px 0',
          textAlign: 'center',
        }}>
          <div style={{ height: '1px', background: '#E2E8F0' }} />
          <span style={{
            position: 'absolute',
            top: '-9px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FFFFFF',
            padding: '0 10px',
            fontSize: '11px',
            color: '#64748B',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Connexion Démo en 1 Clic
          </span>
        </div>

        {/* Profils pré-configurés pour tester immédiatement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DEMO_USERS.map((usr) => (
            <button
              key={usr.id}
              type="button"
              onClick={() => handleLogin(usr.id, usr.email)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={usr.avatarUrl}
                  alt={usr.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    {usr.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {usr.email}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: usr.id === 'user_agence' ? '#7E22CE' : '#4F46E5',
                background: usr.id === 'user_agence' ? '#FAF5FF' : '#EEF2FF',
                padding: '3px 8px',
                borderRadius: '4px',
              }}>
                {usr.roleLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Footer carte */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
          Pas encore de compte ?{' '}
          <Link href="/pricing" style={{ color: '#4F46E5', fontWeight: 700, textDecoration: 'none' }}>
            Choisir un Pack à partir de 29 DT ➔
          </Link>
        </div>

      </div>

      {/* Liens retour & Footer */}
      <footer style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            ← Retour à l'accueil
          </Link>
          <Link href="/pricing" style={{ color: '#64748B', textDecoration: 'none' }}>
            Tarifs en Dinars (DT)
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '12px' }}>
          <img
            src="/images/Adora_logo.png"
            alt="Adora Logo"
            style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'contain' }}
          />
          <span>© 2026 Adora AI — Studio E-commerce Haute Définition en Tunisie 🇹🇳</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
        Chargement du studio...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
