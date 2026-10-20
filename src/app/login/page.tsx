'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSafeInternalRedirect } from '@/lib/security/redirect';
import { useLanguage } from '@/lib/LanguageContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = getSafeInternalRedirect(searchParams.get('redirect'), '/studio');
  const { t } = useLanguage();
  const { setSessionDirect } = useWorkspace();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (targetEmail?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: (targetEmail || email).trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.data?.user && data.data?.workspace) {
          setSessionDirect({
            user: data.data.user,
            workspace: data.data.workspace,
            workspaces: data.data.workspaces || [data.data.workspace],
            role: data.data.role || 'owner',
          });
        }
        setSuccessMessage(t.auth.login.welcomeSuccess);
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 150);
      } else {
        setErrorMessage(data.error || t.auth.login.errorInvalid);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.auth.login.errorServer);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 16px',
      fontFamily: 'Outfit, sans-serif',
      color: '#0F172A',
      position: 'relative',
    }}>
      {/* Top Right Language Switcher */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <LanguageSwitcher variant="light" />
      </div>

      {/* Background Soft Glow matching Signup */}
      <div style={{
        position: 'absolute',
        top: '6%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '650px',
        height: '420px',
        background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.08) 45%, transparent 70%)',
        pointerEvents: 'none',
        filter: 'blur(80px)',
      }} />

      {/* Header Logo matching Signup */}
      <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/images/logo.png"
            alt="MarkMosaiq"
            style={{
              height: '40px',
              width: '40px',
              objectFit: 'contain',
              background: '#FFFFFF',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.2)',
            }}
          />
          <span style={{ fontSize: '27px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
            Mark<span style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 60%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Mosaiq</span>
          </span>
        </Link>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '13px', fontWeight: 600 }}>
          {t.auth.tagline}
        </p>
      </div>

      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '36px 30px',
        boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.08)',
        zIndex: 1,
      }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#EEF2FF',
            border: '1px solid #C7D2FE',
            padding: '4px 14px',
            borderRadius: '20px',
            color: '#4F46E5',
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: '10px',
          }}>
            <Sparkles size={14} color="#6366F1" />
            {t.auth.login.badge}
          </div>
          <h1 style={{ fontSize: '23px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            {t.auth.login.title}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
            {t.auth.login.subtitle}
          </p>
        </div>

        {/* Messages d'alerte */}
        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#DC2626',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#166534',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 700,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <CheckCircle2 size={16} color="#166534" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulaire standard Email + Password */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                {t.auth.login.emailLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  required
                  placeholder={t.auth.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  {t.auth.login.passwordLabel}
                </label>
                <a href="#" style={{ fontSize: '11px', color: '#4F46E5', textDecoration: 'none', fontWeight: 700 }}>
                  {t.auth.login.forgotPassword}
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={t.auth.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 36px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                marginTop: '8px',
                padding: '14px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 900,
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.auth.login.loadingBtn}</span>
                </>
              ) : (
                <span>{t.auth.login.submitBtn}</span>
              )}
            </button>
          </div>
        </form>

        {/* Card Footer Link to Signup */}
        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
          {t.auth.login.noAccount}{' '}
          <Link
            href={searchParams.get('redirect') ? `/signup?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : '/signup'}
            style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 700 }}
          >
            {t.auth.login.signupLink}
          </Link>
        </div>
      </div>

      {/* Global Trust Footer matching Signup */}
      <div style={{
        marginTop: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '13px',
        color: '#64748B',
        zIndex: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <Link href="/" style={{ color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> {t.auth.backToHome}
        </Link>
        <div>•</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="#10B981" />
          <span>{t.auth.trustProtected}</span>
        </div>
        <div>•</div>
        <div>{t.auth.trustStaging}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
        <Loader2 size={24} className="animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
