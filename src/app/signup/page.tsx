'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Check,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  analyzePassword,
  validateEmailFormat,
} from '@/lib/validation';
import { PACKS, PackId, formatPrice } from '@/config/packs';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

function SignupWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession, setSessionDirect } = useWorkspace();
  const { locale, t } = useLanguage();

  const redirectParam = searchParams.get('redirect');
  let rawPack = searchParams.get('pack') || searchParams.get('plan');
  if (!rawPack && redirectParam) {
    try {
      const redirectUrl = new URL(redirectParam, 'http://internal.invalid');
      rawPack = redirectUrl.searchParams.get('pack') || redirectUrl.searchParams.get('plan') || undefined;
    } catch {
      // ignore
    }
  }
  const resolved = (rawPack || 'free').trim().toLowerCase();
  const packParam: PackId = (
    resolved === 'starter' ? 'flash' :
    resolved === 'advanced' || resolved === 'agency' ? 'agency_299' :
    resolved === 'flash' ? 'flash' :
    resolved === 'pro' ? 'pro' :
    resolved === 'agency_299' ? 'agency_299' :
    'free'
  );
  const cycleParam = searchParams.get('cycle') || 'monthly';
  const currencyParam = searchParams.get('currency') || 'USD';
  const selectedPack = PACKS[packParam] || PACKS['free'];

  // Slim 2-Step Funnel (MM-106):
  // 1: Compte (Email professionnel & Mot de passe sécurisé)
  // 2: Vérification OTP (Code de validation à 6 chiffres)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password Security & Visibility
  const [showPassword, setShowPassword] = useState(false);
  const passAnalysis = analyzePassword(password);

  // Step 2: Verification OTP
  const [verificationCode, setVerificationCode] = useState('');
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailAlreadyExists, setIsEmailAlreadyExists] = useState(false);

  // Step 1 Submit: Validate credentials and send OTP (Slim 2-Step MM-106)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsEmailAlreadyExists(false);

    const formatCheck = validateEmailFormat(email);
    if (!formatCheck.valid) {
      setErrorMessage(formatCheck.error || t.auth.signup.errEmailInvalid);
      return;
    }

    const pass = analyzePassword(password);
    if (!pass.isSecure) {
      setErrorMessage(t.auth.signup.errPasswordCriteria);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || email.split('@')[0],
          plan: packParam,
          redirect: redirectParam,
        }),
      });
      const data = await res.json();
      if (data.status === 'OTP_SENT' || data.success) {
        await refreshSession().catch((e) => console.warn('Session refresh warning:', e));
        if (data.devCode) {
          setDevCodeHint(data.devCode);
        }
        setCurrentStep(2); // Directly to Step 2: OTP Verification
      } else {
        if (data.code === 'EMAIL_ALREADY_EXISTS' || res.status === 409) {
          setIsEmailAlreadyExists(true);
        }
        setErrorMessage(data.error || t.auth.signup.errOtpSend);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.auth.signup.errServer);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 Submit: Verify OTP code and transition to destination (MM-106)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setErrorMessage(t.auth.signup.errOtpRequired);
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
          redirect: redirectParam,
          pack: packParam,
          cycle: cycleParam,
          currency: currencyParam,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setSessionDirect(data.data);
        }
        await refreshSession().catch((e) => console.warn('Session refresh warning:', e));
        if (packParam === 'free') {
          // Free plan -> go directly to /studio
          window.location.href = redirectParam || '/studio';
        } else {
          // Paid plan -> redirect to checkout to complete Whop payment
          const fallbackCheckout = `/checkout?pack=${packParam}&cycle=${cycleParam}&currency=${currencyParam}`;
          const destination = data.nextUrl || redirectParam || fallbackCheckout;
          window.location.href = destination;
        }
      } else {
        setErrorMessage(data.error || t.auth.signup.errOtpInvalid);
      }
    } catch (err: any) {
      setErrorMessage(err.message || t.auth.signup.errOtpFailed);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (data.devCode) {
        setDevCodeHint(data.devCode);
      }
    } catch (e) {
      console.error('Resend error:', e);
    }
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

      {/* Background Soft Glow */}
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

      {/* Header Logo */}
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

      {/* Stepper Indicator (Slim 2-Step Funnel MM-106) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '22px',
        width: '100%',
        maxWidth: '480px',
        zIndex: 1,
      }}>
        {[
          { num: 1, label: t.auth.signup.stepperStep1 },
          { num: 2, label: t.auth.signup.stepperStep2 },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                background: currentStep >= s.num ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#FFFFFF',
                color: currentStep >= s.num ? '#FFFFFF' : '#94A3B8',
                border: `1.5px solid ${currentStep >= s.num ? '#6366F1' : '#E2E8F0'}`,
                boxShadow: currentStep >= s.num ? '0 2px 8px rgba(99, 102, 241, 0.25)' : 'none',
              }}>
                {currentStep > s.num ? <Check size={14} /> : s.num}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: currentStep === s.num ? '#0F172A' : '#94A3B8',
              }}>
                {s.label}
              </span>
            </div>
            {idx === 0 && (
              <div style={{
                width: '40px',
                height: '2px',
                background: currentStep > 1 ? '#6366F1' : '#E2E8F0',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Container Card (White with Logo Accent Border) */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '34px 30px',
        boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.08)',
        zIndex: 1,
        transition: 'max-width 0.25s ease',
      }}>

        {/* Pinned Plan Chip (MM-106) */}
        {selectedPack && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(0, 229, 255, 0.06))',
            border: '1.5px solid #6366F1',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.auth.signup.packSelected}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                {selectedPack.id === 'free' ? (
                  <span>{t.auth.signup.freePlanLabel}</span>
                ) : (
                  <span>{selectedPack.name} ({formatPrice(selectedPack.priceMinor.monthly.USD, 'USD')}{locale === 'fr' ? '/mois' : '/mo'})</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#10B981' }}>
                {selectedPack.id === 'free' ? t.auth.signup.freeTrialCredits : t.auth.signup.trialCredits}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {selectedPack.id === 'free' ? t.auth.signup.freeNoCard : t.auth.signup.whopAfter}
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#DC2626',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            fontWeight: 600,
            display: 'flex',
            flexDirection: isEmailAlreadyExists ? 'column' : 'row',
            alignItems: isEmailAlreadyExists ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}>
            <span>{errorMessage}</span>
            {isEmailAlreadyExists && (
              <Link
                href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Se connecter &rarr;
              </Link>
            )}
          </div>
        )}

        {/* STEP 1: ACCOUNT CREDENTIALS */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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
                {t.auth.signup.step1Badge}
              </div>
              <h1 style={{ fontSize: '23px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {t.auth.signup.step1Title}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                {t.auth.signup.step1Subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {t.auth.signup.fullNameLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder={t.auth.signup.fullNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {t.auth.signup.emailLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder={t.auth.signup.emailPlaceholder}
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

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    {t.auth.signup.passwordLabel}
                  </label>
                  {password.length > 0 && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: passAnalysis.strengthColor,
                      background: `${passAnalysis.strengthColor}18`,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: `1px solid ${passAnalysis.strengthColor}40`,
                    }}>
                      {passAnalysis.strengthLabel === 'Strong' ? t.auth.signup.strengthStrong :
                       passAnalysis.strengthLabel === 'Good' ? t.auth.signup.strengthGood :
                       passAnalysis.strengthLabel === 'Fair' ? t.auth.signup.strengthFair :
                       t.auth.signup.strengthWeak} ({passAnalysis.score}%)
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={t.auth.signup.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 36px',
                      background: '#F8FAFC',
                      border: `1px solid ${password.length === 0 ? '#CBD5E1' : passAnalysis.isSecure ? '#10B981' : '#F59E0B'}`,
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#94A3B8',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter & 5-Point Security Checklist */}
                {password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      height: '4px',
                      width: '100%',
                      background: '#E2E8F0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${passAnalysis.score}%`,
                        background: passAnalysis.strengthColor,
                        transition: 'width 0.25s ease, background-color 0.25s ease',
                      }} />
                    </div>

                    <div style={{
                      marginTop: '10px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px 12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passAnalysis.hasMinLength ? '#10B981' : '#64748B', fontWeight: passAnalysis.hasMinLength ? 700 : 500 }}>
                        {passAnalysis.hasMinLength ? <CheckCircle2 size={13} color="#10B981" /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />}
                        <span>{t.auth.signup.criteriaLength}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passAnalysis.hasUpper ? '#10B981' : '#64748B', fontWeight: passAnalysis.hasUpper ? 700 : 500 }}>
                        {passAnalysis.hasUpper ? <CheckCircle2 size={13} color="#10B981" /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />}
                        <span>{t.auth.signup.criteriaUpper}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passAnalysis.hasLower ? '#10B981' : '#64748B', fontWeight: passAnalysis.hasLower ? 700 : 500 }}>
                        {passAnalysis.hasLower ? <CheckCircle2 size={13} color="#10B981" /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />}
                        <span>{t.auth.signup.criteriaLower}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passAnalysis.hasNumber ? '#10B981' : '#64748B', fontWeight: passAnalysis.hasNumber ? 700 : 500 }}>
                        {passAnalysis.hasNumber ? <CheckCircle2 size={13} color="#10B981" /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />}
                        <span>{t.auth.signup.criteriaNumber}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: passAnalysis.hasSpecial ? '#10B981' : '#64748B', fontWeight: passAnalysis.hasSpecial ? 700 : 500, gridColumn: 'span 2' }}>
                        {passAnalysis.hasSpecial ? <CheckCircle2 size={13} color="#10B981" /> : <div style={{ width: '13px', height: '13px', borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />}
                        <span>{t.auth.signup.criteriaSpecial}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  marginTop: '10px',
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
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t.auth.signup.loadingBtn}</span>
                  </>
                ) : (
                  <span>{t.auth.signup.submitBtn}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SECURE OTP VERIFICATION (MM-106) */}
        {currentStep === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: '#6366F1',
              }}>
                <KeyRound size={26} />
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FAF5FF',
                border: '1px solid #E9D5FF',
                padding: '4px 12px',
                borderRadius: '20px',
                color: '#7C3AED',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '8px',
              }}>
                <Shield size={13} />
                {t.auth.signup.step2Badge}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                {t.auth.signup.step2Title}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
                {t.auth.signup.step2Subtitle} <strong style={{ color: '#0F172A' }}>{email}</strong>.
              </p>
            </div>

            {devCodeHint && (
              <div style={{
                background: '#FAF5FF',
                border: '1px dashed #A855F7',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                color: '#7C3AED',
                textAlign: 'center',
                marginBottom: '16px',
                fontWeight: 700,
              }}>
                ⚡ Dev Mode Code: <strong>{devCodeHint}</strong> ({t.auth.signup.devModeOr} <strong>123456</strong>)
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
                  {t.auth.signup.otpLabel}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder={t.auth.signup.otpPlaceholder}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '26px',
                    letterSpacing: '8px',
                    fontWeight: 900,
                    background: '#F8FAFC',
                    border: '2px solid #6366F1',
                    borderRadius: '10px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← {t.auth.signup.editEmail}
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#94A3B8' : '#6366F1',
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {resendCooldown > 0 ? `${t.auth.signup.resendWait} (${resendCooldown}s)` : t.auth.signup.resendCode}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 18px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={15} />
                  <span>{t.auth.signup.backBtn}</span>
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: isVerifying ? 'default' : 'pointer',
                    opacity: isVerifying ? 0.8 : 1,
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t.auth.signup.verifyingBtn}</span>
                    </>
                  ) : (
                    <span>{t.auth.signup.verifyBtn}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer login link */}
        {currentStep === 1 && (
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
            {t.auth.signup.haveAccount}{' '}
            <Link href="/login" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 700 }}>
              {t.auth.signup.loginLink}
            </Link>
          </div>
        )}
      </div>

      {/* Global Trust Footer */}
      <div style={{
        marginTop: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        fontSize: '13px',
        color: '#64748B',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="#10B981" />
          <span>{t.auth.trustProtected}</span>
        </div>
        <div>•</div>
        <div>{t.auth.trustNoCard}</div>
        <div>•</div>
        <div>{t.auth.trustStaging}</div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F8FAFC' }} />}>
      <SignupWizardContent />
    </Suspense>
  );
}
