'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  BrandIndustryId,
  RegionClusterId,
  SocialPlatformId,
  TimeBlockId,
  HeatmapSlotCell,
  CalendarRecommendationResult,
  AudienceTimezoneShare,
} from '@/lib/postingCalendarEngine';
import {
  Store,
  ShoppingBag,
  Globe,
  MapPin,
  Calendar,
  Download,
  Clock,
  Sunrise,
  Car,
  Utensils,
  Dumbbell,
  Star,
  Moon,
  Check,
  Smartphone,
  Zap,
  Lightbulb,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';

const COMMON_IANA_TIMEZONES = [
  { value: 'Europe/Paris', label: 'Europe/Paris', sub: 'CET / CEST' },
  { value: 'Europe/London', label: 'Europe/London', sub: 'GMT / BST' },
  { value: 'UTC', label: 'UTC', sub: 'Universal' },
  { value: 'Africa/Tunis', label: 'Africa/Tunis', sub: 'CET (UTC+1)' },
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca', sub: 'Morocco' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo', sub: 'EET / EEST' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh', sub: 'Saudi AST' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai', sub: 'UAE GST' },
  { value: 'America/New_York', label: 'America/New_York', sub: 'US Eastern' },
  { value: 'America/Chicago', label: 'America/Chicago', sub: 'US Central' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles', sub: 'US Pacific' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo', sub: 'Brazil BRT' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata', sub: 'India IST' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore', sub: 'SGT' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo', sub: 'Japan JST' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos', sub: 'WAT' },
];

interface DropdownOption {
  value: string;
  label: string;
  sub?: string;
}

interface CustomPillDropdownProps {
  id: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  icon: React.ReactNode;
  value: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  maxWidth?: string;
  menuMinWidth?: string;
  ariaLabel?: string;
}

function CustomPillDropdown({
  id,
  openId,
  setOpenId,
  icon,
  value,
  options,
  onChange,
  maxWidth = '210px',
  menuMinWidth = '240px',
  ariaLabel,
}: CustomPillDropdownProps) {
  const isOpen = openId === id;
  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setOpenId(isOpen ? null : id);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 13px',
          borderRadius: '999px',
          background: isOpen
            ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
            : '#FFFFFF',
          border: isOpen ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(124, 58, 237, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06)'
            : '0 1px 3px rgba(15, 23, 42, 0.04)',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          maxWidth,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: isOpen ? '#4C1D95' : '#0F172A',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}
        >
          {selectedOption?.label || value}
        </span>
        <ChevronDown
          size={14}
          color={isOpen ? '#7C3AED' : '#64748B'}
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: menuMinWidth,
            maxHeight: '290px',
            overflowY: 'auto',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow:
              '0 20px 40px -12px rgba(15, 23, 42, 0.18), 0 4px 16px rgba(124, 58, 237, 0.08)',
            padding: '6px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpenId(null);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected
                    ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
                    : 'transparent',
                  color: isSelected ? '#5B21B6' : '#1E293B',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {opt.label}
                  </span>
                  {opt.sub && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: isSelected ? '#7C3AED' : '#64748B',
                        marginTop: '1px',
                      }}
                    >
                      {opt.sub}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SocialHubPage() {
  const { workspace } = useWorkspace();
  const { t, locale } = useLanguage();
  const sh = t.studio.socialHub;

  const [calendarData, setCalendarData] = useState<CalendarRecommendationResult | null>(null);
  const [brandShopName, setBrandShopName] = useState<string>('Ma Boutique E-commerce');
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [industry, setIndustry] = useState<BrandIndustryId>('general');
  const [regionCluster, setRegionCluster] = useState<RegionClusterId>('western_europe');
  const [merchantTimezone, setMerchantTimezone] = useState<string>('Europe/Paris');
  const [primaryAudienceTimezone, setPrimaryAudienceTimezone] = useState<string>('Europe/Paris');
  const [targetPlatform, setTargetPlatform] = useState<SocialPlatformId>('both');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selected slot on the heatmap for the right-hand strategy inspector
  const [selectedSlot, setSelectedSlot] = useState<HeatmapSlotCell | null>(null);

  // Close custom dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchRecommendations = useCallback(
    async (overrides?: {
      ind?: BrandIndustryId;
      reg?: RegionClusterId;
      mTz?: string;
      audTz?: string;
      plat?: SocialPlatformId;
      tf?: '12h' | '24h';
    }) => {
      const ind = overrides?.ind ?? industry;
      const reg = overrides?.reg ?? regionCluster;
      const mTz = overrides?.mTz ?? merchantTimezone;
      const audTz = overrides?.audTz ?? primaryAudienceTimezone;
      const plat = overrides?.plat ?? targetPlatform;
      const tf = overrides?.tf ?? timeFormat;

      const audArray: AudienceTimezoneShare[] = [{ timezone: audTz, weight: 100 }];
      const params = new URLSearchParams({
        industry: ind,
        regionCluster: reg,
        merchantTimezone: mTz,
        audienceTimezones: JSON.stringify(audArray),
        platform: plat,
        timeFormat: tf,
        locale,
      });

      const res = await fetch(`/api/social/recommendations?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data?.calendar) {
        const cal: CalendarRecommendationResult = data.data.calendar;
        setCalendarData(cal);
        const shop = data.data.brandKit?.shopName || brandShopName;
        setBrandShopName(shop);

        const defaultPrimeSlot = cal.days[0]?.blocks[4] || cal.topSlots[0] || null;
        if (defaultPrimeSlot) {
          setSelectedSlot(defaultPrimeSlot);
        }
      }
    },
    [
      industry,
      regionCluster,
      merchantTimezone,
      primaryAudienceTimezone,
      targetPlatform,
      timeFormat,
      locale,
      brandShopName,
    ]
  );

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/social/recommendations?locale=${locale}`);
      const data = await res.json();
      if (data.success && data.data?.calendar) {
        const cal: CalendarRecommendationResult = data.data.calendar;
        setCalendarData(cal);
        setIndustry(cal.industry);
        setRegionCluster(cal.regionCluster);
        setMerchantTimezone(cal.merchantTimezone);
        if (cal.audienceTimezones?.length > 0) {
          setPrimaryAudienceTimezone(cal.audienceTimezones[0].timezone);
        }
        setTimeFormat(cal.timeFormat);

        const shop = data.data.brandKit?.shopName || 'Ma Boutique E-commerce';
        setBrandShopName(shop);

        const firstDayPrimeSlot = cal.days[0]?.blocks[4] || cal.topSlots[0] || null;
        if (firstDayPrimeSlot) {
          setSelectedSlot(firstDayPrimeSlot);
        }
      }
    } catch (err) {
      console.error('Failed to load best time heatmap:', err);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadInitialData();
  }, [workspace?.id, loadInitialData]);

  const handleSelectSlot = (slot: HeatmapSlotCell) => {
    setSelectedSlot(slot);
  };

  const formatWeekdayHeader = (dateIso: string, dayOfWeek: number) => {
    try {
      const [y, m, d] = dateIso.split('-').map(Number);
      const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(utcNoon);
      const monthDay = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(utcNoon);
      return { dayName, monthDay };
    } catch {
      return { dayName: `D${dayOfWeek}`, monthDay: dateIso };
    }
  };

  // Determine the Peak Day column index (0..6) to highlight with the golden column frame & "👑 Peak Day" badge
  const peakDayColIndex = useMemo(() => {
    if (!calendarData || calendarData.days.length === 0) return 2;
    let bestIdx = 0;
    let bestSum = -1;
    calendarData.days.forEach((d, idx) => {
      const sum = d.blocks.reduce((acc, b) => acc + b.score, 0) + (d.dayOfWeek === 6 ? 5 : 0);
      if (sum > bestSum) {
        bestSum = sum;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }, [calendarData]);

  const industryOptions: DropdownOption[] = useMemo(
    () =>
      (Object.keys(sh.industries) as BrandIndustryId[]).map((indKey) => ({
        value: indKey,
        label: sh.industries[indKey],
      })),
    [sh.industries]
  );

  const regionOptions: DropdownOption[] = useMemo(
    () =>
      (Object.keys(sh.regions) as RegionClusterId[]).map((regKey) => {
        const full = sh.regions[regKey];
        const match = full.match(/^([^(]+)\(([^)]+)\)/);
        return {
          value: regKey,
          label: match ? match[1].trim() : full,
          sub: match ? match[2].trim() : undefined,
        };
      }),
    [sh.regions]
  );

  const platformOptions: DropdownOption[] = useMemo(
    () => [
      { value: 'both', label: 'IG + FB', sub: 'Instagram & Facebook' },
      { value: 'instagram', label: 'Instagram', sub: 'Feed, Stories & Reels' },
      { value: 'facebook', label: 'Facebook', sub: 'Pages & Feed Ads' },
      { value: 'tiktok', label: 'TikTok', sub: 'Short-Form Video 9:16' },
    ],
    []
  );

  const timeFormatOptions: DropdownOption[] = useMemo(
    () => [
      { value: '24h', label: '24h', sub: '20:30' },
      { value: '12h', label: '12h', sub: '08:30 PM' },
    ],
    []
  );

  const blockOrder: TimeBlockId[] = [
    'early_morning',
    'morning_commute',
    'midday_lunch',
    'afterwork',
    'prime_evening',
    'late_scroll',
  ];

  const renderBlockIcon = (blockId: TimeBlockId) => {
    switch (blockId) {
      case 'early_morning':
        return <Sunrise size={16} color="#F59E0B" />;
      case 'morning_commute':
        return <Car size={16} color="#475569" />;
      case 'midday_lunch':
        return <Utensils size={16} color="#475569" />;
      case 'afterwork':
        return <Dumbbell size={16} color="#475569" />;
      case 'prime_evening':
        return <Star size={16} color="#7C3AED" />;
      case 'late_scroll':
      default:
        return <Moon size={16} color="#475569" />;
    }
  };

  const exportIcsUrl = `/api/social/export-ics?industry=${industry}&platform=${targetPlatform}&regionCluster=${regionCluster}&includeGolden=true`;

  return (
    <AppShell activeNav="social" pageTitle={sh.tabHeatmap}>
      <div
        ref={containerRef}
        style={{
          maxWidth: '1340px',
          margin: '0 auto',
          fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
        }}
      >
        {/* =========================================================================
            TOP ROW: FILTER CARD (LEFT) + ENGAGEMENT TIP CARD (RIGHT)
            ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '16px',
            marginBottom: '16px',
            alignItems: 'stretch',
          }}
        >
          {/* Left Filter & Brand Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E8ECF4',
              padding: '14px 20px',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Sub-row 1: Active Tab Header + Store Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                borderBottom: '1px solid #F1F5F9',
                paddingBottom: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#1E1B4B',
                  position: 'relative',
                  paddingBottom: '10px',
                  marginBottom: '-11px',
                  borderBottom: '3px solid #5B21B6',
                }}
              >
                <span>🔥</span>
                <span>{sh.tabHeatmap}</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1E293B',
                }}
              >
                <Store size={14} color="#7C3AED" />
                <span>{brandShopName}</span>
              </div>
            </div>

            {/* Sub-row 2: Custom Styled Pill Dropdowns + .ICS Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {/* 1. Industry Custom Pill Dropdown */}
              <CustomPillDropdown
                id="industry"
                openId={openDropdownId}
                setOpenId={setOpenDropdownId}
                ariaLabel={sh.industryLabel}
                icon={<ShoppingBag size={14} color="#4F46E5" />}
                value={industry}
                options={industryOptions}
                maxWidth="215px"
                menuMinWidth="240px"
                onChange={(val) => {
                  const nextInd = val as BrandIndustryId;
                  setIndustry(nextInd);
                  fetchRecommendations({ ind: nextInd });
                }}
              />

              {/* 2. Region Cluster Custom Pill Dropdown */}
              <CustomPillDropdown
                id="region"
                openId={openDropdownId}
                setOpenId={setOpenDropdownId}
                ariaLabel={sh.regionClusterLabel}
                icon={<Globe size={14} color="#4F46E5" />}
                value={regionCluster}
                options={regionOptions}
                maxWidth="235px"
                menuMinWidth="290px"
                onChange={(val) => {
                  const nextReg = val as RegionClusterId;
                  setRegionCluster(nextReg);
                  fetchRecommendations({ reg: nextReg });
                }}
              />

              {/* 3. Timezone Custom Pill Dropdown */}
              <CustomPillDropdown
                id="timezone"
                openId={openDropdownId}
                setOpenId={setOpenDropdownId}
                ariaLabel={sh.audienceTzLabel}
                icon={<MapPin size={14} color="#E11D48" />}
                value={primaryAudienceTimezone}
                options={COMMON_IANA_TIMEZONES}
                maxWidth="185px"
                menuMinWidth="230px"
                onChange={(val) => {
                  setPrimaryAudienceTimezone(val);
                  setMerchantTimezone(val);
                  fetchRecommendations({ audTz: val, mTz: val });
                }}
              />

              {/* 4. Platform Custom Pill Dropdown */}
              <CustomPillDropdown
                id="platform"
                openId={openDropdownId}
                setOpenId={setOpenDropdownId}
                ariaLabel={sh.platformLabel}
                icon={
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '4px',
                      background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
                      display: 'inline-block',
                    }}
                  />
                }
                value={targetPlatform}
                options={platformOptions}
                maxWidth="140px"
                menuMinWidth="210px"
                onChange={(val) => {
                  const nextPlat = val as SocialPlatformId;
                  setTargetPlatform(nextPlat);
                  fetchRecommendations({ plat: nextPlat });
                }}
              />

              {/* 5. Clock Format Custom Pill Dropdown */}
              <CustomPillDropdown
                id="timeformat"
                openId={openDropdownId}
                setOpenId={setOpenDropdownId}
                ariaLabel={sh.timeFormatLabel}
                icon={<Calendar size={13} color="#4F46E5" />}
                value={timeFormat}
                options={timeFormatOptions}
                maxWidth="105px"
                menuMinWidth="150px"
                onChange={(val) => {
                  const nextTf = val as '12h' | '24h';
                  setTimeFormat(nextTf);
                  fetchRecommendations({ tf: nextTf });
                }}
              />

              {/* 6. Dark Navy .ICS Button */}
              <a
                href={exportIcsUrl}
                download="markmosaiq-best-times.ics"
                title={sh.icsStaticNotice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(30, 27, 75, 0.25)',
                }}
              >
                <Calendar size={13} />
                <span>.ICS</span>
                <Download size={13} />
              </a>
            </div>
          </div>

          {/* Right Engagement Tip Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 60%, #E0E7FF 100%)',
              borderRadius: '18px',
              border: '1px solid #DDD6FE',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.06)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid #DDD6FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.12)',
              }}
            >
              <Lightbulb size={20} color="#7C3AED" />
            </div>

            <div style={{ flex: 1, fontSize: '12.5px', fontWeight: 700, color: '#1E1B4B', lineHeight: 1.4 }}>
              {locale === 'fr'
                ? 'Trouvez les meilleurs jours et heures pour publier avec un engagement maximal !'
                : 'Find the best days & times to post for maximum engagement!'}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '3px',
                flexShrink: 0,
                paddingTop: '10px',
              }}
            >
              <TrendingUp size={28} color="#7C3AED" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN CONTENT ROW: 7-DAY HEATMAP CARD (LEFT) + INSPECTOR COLUMN (RIGHT)
            ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {/* LEFT: HEATMAP MATRIX CARD */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E8ECF4',
              padding: '20px 22px',
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
              overflowX: 'auto',
            }}
          >
            {/* Header Row: Bullseye Prompt + Legend */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    boxShadow: '0 3px 10px rgba(124, 58, 237, 0.25)',
                  }}
                >
                  🎯
                </span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  {locale === 'fr'
                    ? 'Cliquez sur un créneau pour inspecter le format et la stratégie recommandés :'
                    : 'Click any time slot to inspect the recommended format & strategy:'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#334155',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FBBF24 0%, #EA580C 100%)',
                      boxShadow: '0 0 6px rgba(245, 158, 11, 0.55)',
                    }}
                  />
                  {sh.legendGolden}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)',
                      boxShadow: '0 0 6px rgba(124, 58, 237, 0.45)',
                    }}
                  />
                  {sh.legendHigh}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#CBD5E1',
                    }}
                  />
                  {sh.legendModerate}
                </span>
              </div>
            </div>

            {/* 7-Day CSS Grid with Peak Day Column Highlight */}
            {isLoading || !calendarData ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                Loading heatmap...
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '156px repeat(7, minmax(86px, 1fr))',
                  gap: '8px',
                  position: 'relative',
                  paddingTop: '10px',
                }}
              >
                {/* Continuous Golden Frame around the Peak Day Column */}
                <div
                  style={{
                    gridColumn: peakDayColIndex + 2,
                    gridRow: '1 / span 7',
                    borderRadius: '16px',
                    border: '2px solid #F59E0B',
                    background:
                      'linear-gradient(180deg, rgba(254, 243, 199, 0.55) 0%, rgba(255, 247, 237, 0.3) 100%)',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.14)',
                    pointerEvents: 'none',
                    position: 'relative',
                    zIndex: 1,
                    margin: '-5px -4px',
                  }}
                >
                  {/* Floating Crown "Peak Day" Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-13px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 900,
                      padding: '2px 10px',
                      borderRadius: '999px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>👑</span>
                    <span>{locale === 'fr' ? 'Jour Pic' : 'Peak Day'}</span>
                  </div>
                </div>

                {/* ROW 0, COL 0: Timezone Box */}
                <div
                  style={{
                    gridColumn: 1,
                    gridRow: 1,
                    zIndex: 2,
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                  }}
                >
                  <Clock size={15} color="#64748B" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {calendarData.merchantTimezone}
                  </span>
                </div>

                {/* ROW 0, COLS 1..7: Day Headers */}
                {calendarData.days.map((dayCol, dIdx) => {
                  const { dayName, monthDay } = formatWeekdayHeader(dayCol.dateIso, dayCol.dayOfWeek);
                  const isPeakCol = dIdx === peakDayColIndex;
                  return (
                    <div
                      key={dayCol.dateIso}
                      style={{
                        gridColumn: dIdx + 2,
                        gridRow: 1,
                        zIndex: 2,
                        padding: '8px 6px',
                        borderRadius: '12px',
                        background: isPeakCol
                          ? 'linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)'
                          : '#F8FAFC',
                        border: `1px solid ${isPeakCol ? '#FCD34D' : '#E2E8F0'}`,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>{dayName}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '1px' }}>
                        {monthDay}
                      </div>
                    </div>
                  );
                })}

                {/* ROWS 1..6: Time Block Header + 7 Day Slot Cells */}
                {blockOrder.map((blockId, bIdx) => {
                  const sampleCell = calendarData.days[0]?.blocks[bIdx];
                  const rowNum = bIdx + 2;

                  return (
                    <React.Fragment key={blockId}>
                      {/* Left Row Header */}
                      <div
                        style={{
                          gridColumn: 1,
                          gridRow: rowNum,
                          zIndex: 2,
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>{renderBlockIcon(blockId)}</div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 800,
                              color: '#0F172A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {sh.blocks[blockId]}
                          </div>
                          {sampleCell && (
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '1px' }}>
                              {sampleCell.merchantTimeLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 7 Slot Buttons */}
                      {calendarData.days.map((dayCol, dIdx) => {
                        const cell = dayCol.blocks[bIdx];
                        if (!cell) return null;
                        const isSelected =
                          selectedSlot?.dateIso === cell.dateIso && selectedSlot?.hour === cell.hour;

                        let bg = '#F8FAFC';
                        let border = '1px solid #E2E8F0';
                        let timeColor = '#0F172A';
                        let subColor = '#475569';
                        let shadow = 'none';

                        if (isSelected) {
                          bg = 'linear-gradient(135deg, #312E81 0%, #5B21B6 45%, #7C3AED 100%)';
                          border = '1.5px solid #4C1D95';
                          timeColor = '#FFFFFF';
                          subColor = '#E0E7FF';
                          shadow = '0 8px 18px rgba(109, 40, 217, 0.42)';
                        } else if (cell.intensity === 'golden') {
                          bg = 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 55%, #FDE68A 100%)';
                          border = '1px solid #FDBA74';
                          timeColor = '#7C2D12';
                          subColor = '#9A3412';
                          shadow = '0 2px 6px rgba(249, 115, 22, 0.1)';
                        } else if (cell.intensity === 'high') {
                          bg = 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 60%, #E0E7FF 100%)';
                          border = '1px solid #C4B5FD';
                          timeColor = '#1E1B4B';
                          subColor = '#4338CA';
                        }

                        return (
                          <button
                            key={`${dayCol.dateIso}-${blockId}`}
                            type="button"
                            onClick={() => handleSelectSlot(cell)}
                            style={{
                              gridColumn: dIdx + 2,
                              gridRow: rowNum,
                              zIndex: isSelected ? 3 : 2,
                              padding: '8px 6px',
                              borderRadius: '12px',
                              background: bg,
                              border,
                              boxShadow: shadow,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 900,
                                color: timeColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                              }}
                            >
                              {isSelected ? (
                                <span style={{ fontSize: '12px' }}>⭐</span>
                              ) : cell.intensity === 'golden' ? (
                                <span style={{ fontSize: '12px' }}>🔥</span>
                              ) : null}
                              <span>{cell.merchantTimeLabel}</span>
                            </div>
                            <div
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 800,
                                color: subColor,
                                textTransform: 'uppercase',
                                marginTop: '2px',
                                letterSpacing: '0.01em',
                              }}
                            >
                              {cell.recommendedFormat} • {cell.score}%
                            </div>
                          </button>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Bottom Strip: 🏆 Top Weekly Peaks */}
            {calendarData && calendarData.topSlots.length > 0 && (
              <div
                style={{
                  marginTop: '18px',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: '#FAFAFA',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#B45309',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🏆</span>
                  <span>{locale === 'fr' ? 'Meilleurs Pics de la Semaine :' : 'Top Weekly Peaks:'}</span>
                </span>

                {calendarData.topSlots.slice(0, 4).map((slot, i) => {
                  const { dayName } = formatWeekdayHeader(slot.dateIso, slot.dayIndex);
                  const isSel = selectedSlot?.dateIso === slot.dateIso && selectedSlot?.hour === slot.hour;
                  return (
                    <button
                      key={`${slot.dateIso}-${slot.hour}-${i}`}
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: `1px solid ${isSel ? '#A78BFA' : '#FDBA74'}`,
                        background: isSel
                          ? 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
                          : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                        color: isSel ? '#1E1B4B' : '#7C2D12',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: isSel ? '0 3px 10px rgba(124, 58, 237, 0.15)' : 'none',
                      }}
                    >
                      <span>🔥</span>
                      <span>
                        {dayName} {slot.merchantTimeLabel} ({slot.recommendedFormat.toUpperCase()})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: COSMIC ROCKET STRATEGY CARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedSlot && (
              <div
                style={{
                  borderRadius: '20px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 55%, #3B0764 100%)',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 12px 28px rgba(30, 27, 75, 0.25)',
                }}
              >
                {/* Decorative Rocket SVG in bottom-right */}
                <svg
                  width="84"
                  height="84"
                  viewBox="0 0 64 64"
                  fill="none"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    bottom: '6px',
                    opacity: 0.92,
                    pointerEvents: 'none',
                    transform: 'rotate(12deg)',
                  }}
                >
                  <path
                    d="M36 8C46 8 52 14 52 24C52 34 40 46 28 50L18 40C22 28 34 8 36 8Z"
                    fill="url(#rocketGrad)"
                  />
                  <circle cx="38" cy="24" r="5" fill="#E0E7FF" />
                  <path d="M18 40L10 44L14 52L22 48L18 40Z" fill="#F97316" />
                  <defs>
                    <linearGradient id="rocketGrad" x1="18" y1="8" x2="52" y2="50" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#A855F7" />
                      <stop offset="1" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Top Row: Block Pill + Score Badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(139, 92, 246, 0.28)',
                      border: '1px solid rgba(167, 139, 250, 0.45)',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#EDE9FE',
                    }}
                  >
                    <span>💡</span>
                    <span>{sh.blocks[selectedSlot.blockId]}</span>
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                      fontSize: '11.5px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      boxShadow: '0 0 14px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    <span>🔥</span>
                    <span>{selectedSlot.score}/100</span>
                  </span>
                </div>

                {/* Middle Row: Day, Date & Glowing Time */}
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 900,
                    marginTop: '14px',
                    marginBottom: '16px',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {formatWeekdayHeader(selectedSlot.dateIso, selectedSlot.dayIndex).dayName},{' '}
                  {formatWeekdayHeader(selectedSlot.dateIso, selectedSlot.dayIndex).monthDay} •{' '}
                  <span style={{ color: '#FB923C' }}>{selectedSlot.merchantTimeLabel}</span>
                </div>

                {/* Bottom Row: Format + Angle Glass Pills */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#F8FAFC',
                    }}
                  >
                    <Smartphone size={12} color="#C4B5FD" />
                    <span>{selectedSlot.recommendedFormat.toUpperCase()}</span>
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#F8FAFC',
                    }}
                  >
                    <Zap size={12} color="#FBBF24" />
                    <span>{sh.angles[selectedSlot.recommendedAngle]}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
