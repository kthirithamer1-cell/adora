'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Sparkles, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useWorkspace } from '@/lib/WorkspaceContext';

interface OnboardingChecklistProps {
  hasGeneratedFirstVisual: boolean;
  hasExportedVisual: boolean;
  onOpenCheckout: () => void;
  onScrollToStaging: () => void;
}

export default function OnboardingChecklist({
  hasGeneratedFirstVisual,
  hasExportedVisual,
  onOpenCheckout,
  onScrollToStaging,
}: OnboardingChecklistProps) {
  const { workspace, user } = useWorkspace();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Check storage for minimized/dismissed state
  useEffect(() => {
    try {
      const savedDismissed = localStorage.getItem('markmosaiq_onboarding_checklist_dismissed');
      if (savedDismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('markmosaiq_onboarding_checklist_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const steps = [
    {
      id: 'account_store',
      title: 'Store Profile Connected',
      desc: `${workspace?.name || 'Your store'} configured`,
      done: true,
      time: 'Done',
    },
    {
      id: 'brand_kit',
      title: 'Brand Kit Initialized',
      desc: 'Logo, primary color & visual style saved',
      done: true,
      time: 'Done',
    },
    {
      id: 'first_staging',
      title: 'Stage 1st Product in 4K',
      desc: 'Drop product photo and let AI render backdrop',
      done: hasGeneratedFirstVisual,
      time: '1 min',
      action: onScrollToStaging,
      actionLabel: 'Stage Now ➔',
    },
    {
      id: 'export_pack',
      title: 'Download Social Media Pack',
      desc: 'Get 1:1 Feed + 9:16 Story formats',
      done: hasExportedVisual,
      time: '30s',
    },
    {
      id: 'upgrade_whop',
      title: 'Upgrade via Whop (Starter/Pro)',
      desc: 'Unlock unlimited 4K credits and bulk staging',
      done: (workspace?.plan as string) !== 'trial',
      time: '2 min',
      action: onOpenCheckout,
      actionLabel: 'View Plans ➔',
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (isDismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsDismissed(false);
          setIsCollapsed(false);
          localStorage.removeItem('markmosaiq_onboarding_checklist_dismissed');
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9000,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '8px 14px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 700,
          color: '#0F172A',
          transition: 'all 0.2s ease',
        }}
      >
        <Sparkles size={14} color="#6366F1" />
        <span>Guide de démarrage ({completedCount}/{steps.length})</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9000,
        width: isCollapsed ? 'auto' : '320px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        fontFamily: 'Outfit, sans-serif',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: isCollapsed ? '#FFFFFF' : '#F8FAFC',
          borderBottom: isCollapsed ? 'none' : '1px solid #F1F5F9',
          cursor: 'pointer',
          gap: '12px',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0F172A, #334155)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            {completedCount}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
              Guide d'Onboarding
            </div>
            {!isCollapsed && (
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {completedCount} sur {steps.length} complétés ({progressPercent}%)
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            title={isCollapsed ? "Agrandir" : "Réduire"}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            title="Masquer le guide"
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div style={{ padding: '16px' }}>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '5px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366F1 0%, #0F172A 100%)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* List of Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((step) => {
              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: step.done ? '#F8FAFC' : '#FFFFFF',
                    border: `1px solid ${step.done ? '#F1F5F9' : '#E2E8F0'}`,
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {step.done ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : (
                      <Circle size={16} color="#CBD5E1" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: step.done ? '#64748B' : '#0F172A',
                          textDecoration: step.done ? 'line-through' : 'none',
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: step.done ? '#10B981' : '#94A3B8',
                        }}
                      >
                        {step.time}
                      </span>
                    </div>

                    <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0', lineHeight: 1.3 }}>
                      {step.desc}
                    </p>

                    {!step.done && step.action && (
                      <button
                        type="button"
                        onClick={step.action}
                        style={{
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#4F46E5',
                          background: '#EEF2FF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{step.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#94A3B8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} color="#10B981" />
              <span>10 crédits offerts</span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
            >
              Masquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
