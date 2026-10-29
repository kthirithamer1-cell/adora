'use client';

import React, { useState, useEffect, useRef } from 'react';
import s from './TrialAuthModal.module.css';
import { X, ArrowRight, Check, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { validateEmailFormat, analyzePassword } from '@/lib/validation';
import { useWorkspace } from '@/lib/WorkspaceContext';

export interface TrialClientPost {
  id: string;
  guestId: string;
  brandName: string;
  category: 'Skincare' | 'Cosmetics' | 'Perfume';
  style: 'Premium & minimal' | 'Natural & organic' | 'Bold & modern';
  goal: 'educate' | 'care' | 'promote';
  socialHandle?: string;
  headline: string;
  subheadline: string;
  caption: string;
  hashtags: string[];
  imageUrl: string;
  isWatermarked: boolean;
  isClaimed: boolean;
  storyCards: {
    title: string;
    subtitle: string;
    image: string;
  }[];
  createdAt?: string;
}

interface TrialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerAction?: 'save' | 'download' | 'create_more' | 'first_design';
  trialPost?: TrialClientPost | null;
  previewImageUrl?: string;
  previewTitle?: string;
  brandName: string;
  onClaimSuccess: (claimedPost: TrialClientPost | null, creditsRemaining: number, action: string) => void;
}

export default function TrialAuthModal({
  isOpen,
  onClose,
  triggerAction = 'first_design',
  trialPost = null,
  previewImageUrl,
  previewTitle,
  brandName,
  onClaimSuccess,
}: TrialAuthModalProps) {
  const { refreshSession, setSessionDirect } = useWorkspace();
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [signupStep, setSignupStep] = useState<'credentials' | 'otp'>('credentials');

  const [name, setName] = useState<string>(brandName || '');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [otpCode, setOtpCode] = useState<string>('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (brandName && !name) {
      setName(brandName);
    }
  }, [brandName, name]);

  // Escape key & focus trap
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href]'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actionCopy = {
    first_design: {
      title: 'Your 1st design is ready! Claim 5 Free Credits',
      subtitle: 'Create your free account or log in to save this design, export in HD, and unlock 5 complimentary studio credits.',
    },
    save: {
      title: 'Save your branded design & get 5 Free Credits',
      subtitle: 'Create your free account in seconds to save this post to your Brand Kit and unlock 5 full-resolution credits.',
    },
    download: {
      title: 'Download your HD visual & get 5 Free Credits',
      subtitle: 'Sign up or log in for free to download your high-resolution master files and receive 5 free studio credits.',
    },
    create_more: {
      title: 'Unlock 5 Free Credits to keep designing',
      subtitle: 'Save your first creation and unlock 5 complimentary credits to generate more posts, Stories, and carousels.',
    },
  }[triggerAction] || {
    title: 'Your 1st design is ready! Claim 5 Free Credits',
    subtitle: 'Create your free account or log in to save this design and unlock 5 complimentary studio credits.',
  };

  const displayImage = trialPost?.imageUrl || previewImageUrl;
  const displayHeadline = trialPost?.headline || previewTitle || `${brandName || 'Brand'} Studio Creation`;

  const executeClaimAndFinish = async (userId?: string, workspaceId?: string, defaultCredits = 5) => {
    try {
      if (trialPost?.guestId) {
        const claimRes = await fetch('/api/trial/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: trialPost.guestId,
            userId,
            workspaceId,
          }),
        });
        const claimData = await claimRes.json();
        await refreshSession().catch(() => {});

        if (claimData.success && claimData.data) {
          onClaimSuccess(claimData.data, claimData.creditsRemaining || 5, triggerAction);
          return;
        }
      }

      await refreshSession().catch(() => {});
      onClaimSuccess(
        trialPost ? { ...trialPost, isWatermarked: false, isClaimed: true } : null,
        defaultCredits,
        triggerAction
      );
    } catch {
      onClaimSuccess(
        trialPost ? { ...trialPost, isWatermarked: false, isClaimed: true } : null,
        defaultCredits,
        triggerAction
      );
    }
  };

  // Handle Signup Step 1: Send OTP
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailCheck = validateEmailFormat(email);
    if (!emailCheck.valid) {
      setErrorMessage('Please enter a valid work or brand email address.');
      return;
    }

    const passCheck = analyzePassword(password);
    if (!passCheck.isSecure) {
      setErrorMessage(
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special symbol (e.g. Beauty2026!).'
      );
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
          name: name.trim() || brandName || email.split('@')[0],
          shopName: brandName || 'Beauty Brand',
          niche: 'beauty',
          plan: 'free',
        }),
      });

      const data = await res.json();
      if (data.status === 'OTP_SENT' || data.success) {
        setOtpCode('');
        setResendMessage(null);
        setSignupStep('otp');
      } else if (data.code === 'EMAIL_ALREADY_EXISTS' || res.status === 409) {
        setActiveTab('login');
        setErrorMessage('An account already exists with this email. Click "Log In & Claim 5 Credits" below.');
      } else {
        setErrorMessage(data.error || 'Could not start signup. Please check your details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup Step 2: Verify OTP & Claim 5 Free Credits
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otpCode.trim(),
          pack: 'free',
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setSessionDirect(data.data);
        }
        const credits = data.data?.workspace?.creditsRemaining ?? 5;
        await executeClaimAndFinish(
          data.data?.user?.id,
          data.data?.activeWorkspaceId || data.data?.workspace?.id,
          credits
        );
      } else {
        setErrorMessage(data.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Existing User Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setSessionDirect(data.data);
        }
        const credits = data.data?.workspace?.creditsRemaining ?? 5;
        await executeClaimAndFinish(
          data.data?.user?.id,
          data.data?.activeWorkspaceId || data.data?.workspace?.id,
          credits
        );
      } else {
        setErrorMessage(data.error || 'No account found with this email. Switch to "Create Account" above.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={s.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-modal-title"
    >
      <div className={s.modalCard} ref={modalRef}>
        <button
          type="button"
          onClick={onClose}
          className={s.closeButton}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Mini Preview of Their Generated Design */}
        {displayImage && (
          <div className={s.postMiniPreview}>
            <img
              src={displayImage}
              alt={displayHeadline}
              className={s.postMiniThumb}
            />
            <div className={s.postMiniMeta}>
              <span className={s.postMiniStatus}>✓ 1st Design Generated — Ready to Save</span>
              <span className={s.postMiniTitle}>{displayHeadline}</span>
            </div>
          </div>
        )}

        <h3 id="trial-modal-title" className={s.modalTitle}>
          {actionCopy.title}
        </h3>
        <p className={s.modalSubtitle}>{actionCopy.subtitle}</p>

        {/* Tab Switcher: Signup vs Login */}
        <div className={s.tabRow}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage(null);
            }}
            className={`${s.tabBtn} ${activeTab === 'signup' ? s.tabBtnActive : ''}`}
          >
            Create Account (5 Free Credits)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`${s.tabBtn} ${activeTab === 'login' ? s.tabBtnActive : ''}`}
          >
            Log In
          </button>
        </div>

        {errorMessage && <div className={s.errorBox}>{errorMessage}</div>}

        {/* SIGNUP TAB */}
        {activeTab === 'signup' && signupStep === 'credentials' && (
          <form onSubmit={handleSignupSubmit} className={s.form}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Brand or Founder Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bloom Skin"
                className={s.input}
              />
            </div>

            <div className={s.fieldGroup}>
              <label className={s.label}>Work Email</label>
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@yourbeautybrand.com"
                className={s.input}
              />
            </div>

            <div className={s.fieldGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={s.label}>Create Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setPassword('BeautyStudio#2026');
                    setShowPassword(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11.5px',
                    color: '#2F6F53',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Suggest strong password
                </button>
              </div>
              <div className={s.inputWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number & symbol"
                  className={s.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={s.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className={s.passwordHint}>
                Must include 8+ chars, uppercase, lowercase, number & symbol (e.g. !@#).
              </span>
            </div>

            <button type="submit" disabled={isLoading} className={s.submitBtn}>
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Sending verification code...</span>
                </>
              ) : (
                <>
                  <span>Continue & Claim 5 Free Credits</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        {/* SIGNUP STEP 2: OTP VERIFICATION (FROM EMAIL ONLY) */}
        {activeTab === 'signup' && signupStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className={s.form}>
            {resendMessage && (
              <div className={s.devHintBox}>
                <span>{resendMessage}</span>
              </div>
            )}

            <div className={s.fieldGroup}>
              <label className={s.label}>
                We sent a 6-digit verification code to <strong>{email}</strong>. Please check your inbox (and spam folder):
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit code"
                className={s.input}
                style={{ fontSize: '18px', letterSpacing: '0.25em', textAlign: 'center', fontWeight: 700 }}
              />
            </div>

            <button type="submit" disabled={isLoading} className={s.submitBtn}>
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Verifying & unlocking 5 credits...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Verify & Claim 5 Free Credits</span>
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setSignupStep('credentials');
                  setErrorMessage(null);
                  setResendMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12.5px',
                  color: '#6E6A64',
                  cursor: 'pointer',
                }}
              >
                ← Change email address
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setErrorMessage(null);
                  setResendMessage(null);
                  try {
                    const res = await fetch('/api/auth/signup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        password,
                        name: name.trim() || brandName || email.split('@')[0],
                        shopName: brandName || 'Beauty Brand',
                        niche: 'beauty',
                        plan: 'free',
                      }),
                    });
                    const d = await res.json();
                    if (d.status === 'OTP_SENT' || d.success) {
                      setResendMessage('✓ A fresh 6-digit verification code was sent to your email.');
                    }
                  } catch {
                    // ignore
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12.5px',
                  color: '#2F6F53',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Resend code to email
              </button>
            </div>
          </form>
        )}

        {/* LOGIN TAB */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className={s.form}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Account Email Address</label>
              <input
                ref={emailInputRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@yourbeautybrand.com"
                className={s.input}
              />
            </div>

            <button type="submit" disabled={isLoading} className={s.submitBtn}>
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Logging in & saving design...</span>
                </>
              ) : (
                <>
                  <span>Log In & Save My Design</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        <div className={s.perksRow}>
          <span className={s.perkItem}>
            <Check size={13} color="#2F6F53" strokeWidth={3} /> 5 Free Credits
          </span>
          <span className={s.perkItem}>
            <Check size={13} color="#2F6F53" strokeWidth={3} /> No Credit Card
          </span>
          <span className={s.perkItem}>
            <Check size={13} color="#2F6F53" strokeWidth={3} /> Instant HD Export
          </span>
        </div>
      </div>
    </div>
  );
}
