'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Locale } from '@/locales';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'footer' | 'compact' | 'light';
}

const LANGUAGES: { code: Locale; label: string; flag: string; nativeName: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'FR' },
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'EN' },
];

export default function LanguageSwitcher({ variant = 'navbar' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  const isFooter = variant === 'footer';
  const isLight = variant === 'light';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Changer de langue / Change language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isLight
            ? '#FFFFFF'
            : isFooter
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isLight
            ? '1px solid #CBD5E1'
            : isFooter
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          padding: isFooter ? '5px 10px' : '6px 12px',
          color: isLight ? '#0F172A' : '#E2E8F0',
          fontSize: isFooter ? '0.74rem' : '0.8rem',
          fontWeight: 800,
          cursor: 'pointer',
          backdropFilter: isLight ? 'none' : 'blur(10px)',
          boxShadow: isLight ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (isLight) {
            e.currentTarget.style.borderColor = '#6366F1';
            e.currentTarget.style.background = '#EEF2FF';
          } else {
            e.currentTarget.style.borderColor = '#00E5FF';
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (isLight) {
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.background = '#FFFFFF';
          } else {
            e.currentTarget.style.borderColor = isFooter
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.background = isFooter
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(255, 255, 255, 0.05)';
          }
        }}
      >
        <span style={{ fontSize: '0.9rem' }}>{currentLang.flag}</span>
        <span>{currentLang.nativeName}</span>
        <ChevronDown
          size={12}
          color={isLight ? '#64748B' : '#94A3B8'}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: isFooter ? 'auto' : 'calc(100% + 8px)',
            bottom: isFooter ? 'calc(100% + 8px)' : 'auto',
            right: 0,
            background: isLight ? '#FFFFFF' : '#0B0E14',
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            boxShadow: isLight
              ? '0 12px 30px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05)'
              : '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.15)',
            padding: '6px',
            minWidth: '136px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  background: isSelected
                    ? isLight ? '#EEF2FF' : 'rgba(0, 229, 255, 0.1)'
                    : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  color: isSelected
                    ? isLight ? '#4F46E5' : '#00E5FF'
                    : isLight ? '#1E293B' : '#E2E8F0',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.95rem' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && <Check size={14} color={isLight ? '#4F46E5' : '#00E5FF'} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
