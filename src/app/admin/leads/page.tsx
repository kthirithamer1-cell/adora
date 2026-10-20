'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Flame,
  Zap,
  Mail,
  ExternalLink,
  Shield,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Search,
} from 'lucide-react';

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeUrl: string;
  niche: string;
  adChannels: string[];
  monthlyVolumeTier: string;
  monthlyAdSpendTier: string;
  leadScore: 'HOT' | 'WARM' | 'STANDARD';
  creditsRemaining: number;
  plan: string;
  createdAt: string;
  emailsSentCount: number;
  lastEmailSent: string | null;
}

interface LeadsResponse {
  success: boolean;
  totalLeads: number;
  hotLeadsCount: number;
  warmLeadsCount: number;
  data: LeadItem[];
  recentEmailLogs: any[];
}

export default function FounderLeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<string>('all');

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = (data?.data || []).filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.niche.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterScore === 'all' || l.leadScore === filterScore;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Outfit, sans-serif',
      padding: '36px 24px',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div>
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
              marginBottom: '8px',
            }}>
              <Shield size={14} color="#6366F1" />
              Founder Vision & Lead Analytics (Worldwide)
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Trial Registrations & Email Marketing CRM
            </h1>
            <p style={{ color: '#64748B', fontSize: '15px', margin: '4px 0 0' }}>
              Real-time intelligence on registered global merchants, qualification data, and Whop conversion status.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={fetchLeads}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#334155',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/signup"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 900,
                fontSize: '13px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}
            >
              <span>Test Signup Funnel</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Stats KPI Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '13px', fontWeight: 700 }}>
              <span>Total Registrations</span>
              <Users size={18} color="#6366F1" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginTop: '8px' }}>
              {data?.totalLeads || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 700 }}>
              ✓ 100% Leads Captured with Email
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #FEE2E2',
            borderLeft: '4px solid #EF4444',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626', fontSize: '13px', fontWeight: 800 }}>
              <span>🔥 HOT Leads (High Ad Spend)</span>
              <Flame size={18} color="#EF4444" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#EF4444', marginTop: '8px' }}>
              {data?.hotLeadsCount || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              Whop Agency ($99/mo) Target
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #FEF3C7',
            borderLeft: '4px solid #F59E0B',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706', fontSize: '13px', fontWeight: 800 }}>
              <span>⚡ WARM Leads (Scaling DTC)</span>
              <Zap size={18} color="#F59E0B" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#D97706', marginTop: '8px' }}>
              {data?.warmLeadsCount || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              Whop Pro ($49/mo) Target
            </div>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E0E7FF',
            borderLeft: '4px solid #6366F1',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4F46E5', fontSize: '13px', fontWeight: 800 }}>
              <span>Emails Dispatched</span>
              <Mail size={18} color="#6366F1" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#4F46E5', marginTop: '8px' }}>
              {data?.recentEmailLogs?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              Automated Lifecycle Triggers
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}>
          <div style={{ position: 'relative', width: '340px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, store, or niche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 12px 11px 36px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#0F172A',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'HOT', 'WARM', 'STANDARD'].map((score) => (
              <button
                key={score}
                onClick={() => setFilterScore(score)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: filterScore === score ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#FFFFFF',
                  color: filterScore === score ? '#FFFFFF' : '#64748B',
                  border: `1px solid ${filterScore === score ? '#6366F1' : '#CBD5E1'}`,
                  boxShadow: filterScore === score ? '0 2px 8px rgba(99, 102, 241, 0.25)' : 'none',
                }}
              >
                {score === 'all' ? 'All Leads' : score}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '16px' }}>Merchant / Store</th>
                  <th style={{ padding: '16px' }}>Email & Phone</th>
                  <th style={{ padding: '16px' }}>Niche & Channels</th>
                  <th style={{ padding: '16px' }}>Volume & Ad Spend</th>
                  <th style={{ padding: '16px' }}>Lead Score</th>
                  <th style={{ padding: '16px' }}>Credits Left</th>
                  <th style={{ padding: '16px' }}>Email Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                      No leads match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isHot = lead.leadScore === 'HOT';
                    const isWarm = lead.leadScore === 'WARM';

                    return (
                      <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{lead.storeName}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>By {lead.name}</div>
                          {lead.storeUrl && lead.storeUrl !== 'Non renseigné' && (
                            <a
                              href={lead.storeUrl.startsWith('http') ? lead.storeUrl : `https://${lead.storeUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6366F1', fontSize: '12px', textDecoration: 'none', fontWeight: 600, marginTop: '2px' }}
                            >
                              <span>{lead.storeUrl}</span>
                              <ArrowUpRight size={11} />
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 700 }}>{lead.email}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{lead.phone}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#EEF2FF',
                            color: '#4F46E5',
                            border: '1px solid #C7D2FE',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 800,
                            marginBottom: '4px',
                          }}>
                            {lead.niche.toUpperCase()}
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {lead.adChannels.join(', ')}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 700 }}>{lead.monthlyVolumeTier} visuals/mo</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Spend: {lead.monthlyAdSpendTier}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 900,
                            background: isHot ? '#FEF2F2' : isWarm ? '#FFFBEB' : '#F1F5F9',
                            color: isHot ? '#DC2626' : isWarm ? '#D97706' : '#64748B',
                            border: `1px solid ${isHot ? '#FECACA' : isWarm ? '#FDE68A' : '#CBD5E1'}`,
                          }}>
                            {isHot ? '🔥 HOT' : isWarm ? '⚡ WARM' : '🌱 STANDARD'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: 900,
                            color: lead.creditsRemaining > 0 ? '#059669' : '#DC2626',
                          }}>
                            {lead.creditsRemaining} / 3
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {lead.creditsRemaining === 0 ? 'Exhausted (Ready for Whop)' : 'Trial Active'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#059669', fontWeight: 700, fontSize: '12px' }}>
                            ✓ {lead.emailsSentCount} email(s) sent
                          </div>
                          {lead.lastEmailSent && (
                            <div style={{ fontSize: '11px', color: '#64748B', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.lastEmailSent}>
                              Last: {lead.lastEmailSent}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Marketing Email Dispatch Stream */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px', color: '#0F172A' }}>
            Recent Automated Email Activity (Whop & Onboarding Lifecycle)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(!data?.recentEmailLogs || data.recentEmailLogs.length === 0) ? (
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                No emails dispatched yet. Test the signup funnel to trigger your first automated email.
              </p>
            ) : (
              data.recentEmailLogs.map((log: any) => (
                <div key={log.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '13px',
                }}>
                  <div>
                    <span style={{ color: '#4F46E5', fontWeight: 800 }}>[{log.trigger}]</span>{' '}
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>"{log.subject}"</span>
                    <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                      To: {log.recipientName} ({log.recipientEmail}) • Niche: {log.niche || 'General'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#059669', fontWeight: 800, fontSize: '11px' }}>DELIVERED</span>
                    <div style={{ color: '#94A3B8', fontSize: '11px' }}>
                      {new Date(log.sentAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
