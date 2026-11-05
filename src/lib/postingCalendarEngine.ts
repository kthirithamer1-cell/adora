import { CreativeAngleType } from './strategyEngine';

export type RegionClusterId =
  | 'mena_sun_thu'
  | 'maghreb_med'
  | 'western_europe'
  | 'north_america'
  | 'latam'
  | 'south_asia'
  | 'east_se_asia'
  | 'sub_saharan_africa';

export type BrandIndustryId =
  | 'nutrition'
  | 'cosmetics'
  | 'fashion'
  | 'jewelry'
  | 'tech'
  | 'food'
  | 'home'
  | 'general';

export type SocialPlatformId = 'instagram' | 'facebook' | 'tiktok' | 'both';

export type TimeBlockId =
  | 'early_morning'
  | 'morning_commute'
  | 'midday_lunch'
  | 'afterwork'
  | 'prime_evening'
  | 'late_scroll';

export interface AudienceTimezoneShare {
  timezone: string; // Valid IANA timezone (e.g. 'Europe/Paris', 'Asia/Riyadh', 'America/New_York')
  weight: number;   // 0..100 or 0..1 (normalized automatically)
  country?: string; // ISO-3166 alpha-2 code (e.g. 'FR', 'SA', 'US', 'TN')
  label?: string;
}

export interface WorkspaceCalendarSettings {
  workspaceId: string;
  merchantTimezone: string;
  audienceTimezones: AudienceTimezoneShare[];
  regionCluster: RegionClusterId;
  country?: string;
  regions?: string[];
  weekStartsOn: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
  weekendDays: number[];   // 0..6 (e.g. [5, 6] for Fri-Sat, [0, 6] for Sat-Sun)
  timeFormat: '12h' | '24h';
}

export interface HeatmapSlotCell {
  dayIndex: number;              // 0..6 (0 = Sunday .. 6 = Saturday)
  dateIso: string;               // YYYY-MM-DD in merchant timezone
  hour: number;                  // 0..23 in merchant timezone
  blockId: TimeBlockId;
  utcIso: string;                // Canonical UTC ISO-8601 instant
  merchantDateTimeLocal: string; // YYYY-MM-DDTHH:mm in merchant timezone (for datetime-local input)
  merchantTimeLabel: string;
  audienceTimeLabel: string;
  audienceTimezone: string;
  timezoneDiffers: boolean;
  isWeekend: boolean;
  score: number;                 // 0..100 baseline heuristic score
  intensity: 'low' | 'moderate' | 'high' | 'golden';
  recommendedFormat: 'feed' | 'story' | 'reel';
  recommendedAngle: CreativeAngleType;
}

export interface HeatmapDayColumn {
  dayOfWeek: number; // 0..6
  dateIso: string;   // YYYY-MM-DD in merchant timezone
  isWeekend: boolean;
  blocks: HeatmapSlotCell[]; // 6 key daily time blocks
  hourly: HeatmapSlotCell[]; // Full 24 hours
}

export interface CalendarRecommendationResult {
  source: 'heuristic_v1';
  industry: BrandIndustryId;
  platform: SocialPlatformId;
  regionCluster: RegionClusterId;
  merchantTimezone: string;
  audienceTimezones: AudienceTimezoneShare[];
  weekStartsOn: 0 | 1 | 6;
  weekendDays: number[];
  timeFormat: '12h' | '24h';
  days: HeatmapDayColumn[];
  topSlots: HeatmapSlotCell[];
}

export interface RegionClusterConfig {
  id: RegionClusterId;
  defaultTimezone: string;
  defaultCountry: string;
  weekStartsOn: 0 | 1 | 6;
  weekendDays: number[];
  /**
   * 24-hour baseline mobile & social activity rhythm (0..23 in audience local time)
   */
  hourlyBaseline: number[];
  /**
   * Key representative hours for the 6 daily time blocks (in merchant view)
   */
  blockHours: Record<TimeBlockId, number>;
}

export const REGION_CLUSTERS: Record<RegionClusterId, RegionClusterConfig> = {
  mena_sun_thu: {
    id: 'mena_sun_thu',
    defaultTimezone: 'Asia/Riyadh',
    defaultCountry: 'SA',
    weekStartsOn: 0, // Sunday
    weekendDays: [5, 6], // Friday, Saturday
    hourlyBaseline: [
      42, 30, 18, 12, 10, 14, 28, 45, 58, 62, 56, 54,
      68, 76, 65, 58, 64, 74, 82, 88, 94, 98, 92, 68,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 9,
      midday_lunch: 13,
      afterwork: 17,
      prime_evening: 21,
      late_scroll: 23,
    },
  },
  maghreb_med: {
    id: 'maghreb_med',
    defaultTimezone: 'Africa/Tunis',
    defaultCountry: 'TN',
    weekStartsOn: 1, // Monday
    weekendDays: [0, 6], // Saturday, Sunday
    hourlyBaseline: [
      35, 22, 14, 10, 10, 15, 32, 52, 66, 60, 52, 55,
      74, 82, 68, 56, 62, 76, 86, 92, 97, 95, 86, 58,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 9,
      midday_lunch: 13,
      afterwork: 18,
      prime_evening: 20,
      late_scroll: 22,
    },
  },
  western_europe: {
    id: 'western_europe',
    defaultTimezone: 'Europe/Paris',
    defaultCountry: 'FR',
    weekStartsOn: 1, // Monday
    weekendDays: [0, 6], // Saturday, Sunday
    hourlyBaseline: [
      22, 14, 10, 8, 10, 18, 42, 68, 74, 62, 54, 58,
      78, 76, 60, 54, 62, 78, 88, 95, 92, 82, 62, 38,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 8,
      midday_lunch: 12,
      afterwork: 18,
      prime_evening: 20,
      late_scroll: 22,
    },
  },
  north_america: {
    id: 'north_america',
    defaultTimezone: 'America/New_York',
    defaultCountry: 'US',
    weekStartsOn: 0, // Sunday
    weekendDays: [0, 6], // Saturday, Sunday
    hourlyBaseline: [
      24, 15, 10, 8, 12, 24, 48, 70, 76, 68, 60, 66,
      80, 74, 62, 58, 66, 80, 90, 96, 92, 80, 58, 36,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 8,
      midday_lunch: 12,
      afterwork: 17,
      prime_evening: 19,
      late_scroll: 21,
    },
  },
  latam: {
    id: 'latam',
    defaultTimezone: 'America/Sao_Paulo',
    defaultCountry: 'BR',
    weekStartsOn: 0,
    weekendDays: [0, 6],
    hourlyBaseline: [
      30, 18, 12, 10, 12, 22, 46, 66, 72, 64, 58, 64,
      82, 80, 66, 60, 68, 78, 88, 95, 96, 88, 72, 48,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 8,
      midday_lunch: 12,
      afterwork: 18,
      prime_evening: 20,
      late_scroll: 22,
    },
  },
  south_asia: {
    id: 'south_asia',
    defaultTimezone: 'Asia/Kolkata',
    defaultCountry: 'IN',
    weekStartsOn: 1,
    weekendDays: [0, 6],
    hourlyBaseline: [
      28, 16, 10, 8, 12, 24, 46, 64, 72, 66, 58, 56,
      68, 76, 66, 58, 64, 76, 86, 92, 97, 94, 80, 52,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 9,
      midday_lunch: 13,
      afterwork: 18,
      prime_evening: 20,
      late_scroll: 22,
    },
  },
  east_se_asia: {
    id: 'east_se_asia',
    defaultTimezone: 'Asia/Singapore',
    defaultCountry: 'SG',
    weekStartsOn: 1,
    weekendDays: [0, 6],
    hourlyBaseline: [
      32, 20, 12, 8, 10, 20, 44, 72, 82, 66, 56, 62,
      84, 78, 62, 58, 64, 78, 88, 94, 98, 94, 84, 56,
    ],
    blockHours: {
      early_morning: 7,
      morning_commute: 8,
      midday_lunch: 12,
      afterwork: 18,
      prime_evening: 20,
      late_scroll: 22,
    },
  },
  sub_saharan_africa: {
    id: 'sub_saharan_africa',
    defaultTimezone: 'Africa/Lagos',
    defaultCountry: 'NG',
    weekStartsOn: 1,
    weekendDays: [0, 6],
    hourlyBaseline: [
      26, 16, 10, 8, 12, 26, 50, 68, 72, 64, 58, 60,
      76, 78, 64, 58, 66, 78, 88, 95, 92, 82, 60, 38,
    ],
    blockHours: {
      early_morning: 6,
      morning_commute: 8,
      midday_lunch: 13,
      afterwork: 18,
      prime_evening: 20,
      late_scroll: 21,
    },
  },
};

interface IndustryHourModifier {
  boostHours: Record<number, number>; // hour -> additive modifier
  preferredFormatByBlock: Record<TimeBlockId, 'feed' | 'story' | 'reel'>;
  preferredAngleByBlock: Record<TimeBlockId, CreativeAngleType>;
}

const INDUSTRY_MODIFIERS: Record<BrandIndustryId, IndustryHourModifier> = {
  nutrition: {
    boostHours: { 6: 12, 7: 16, 8: 10, 17: 14, 18: 16, 19: 12, 20: 10, 21: 8 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'story',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'benefit_ingredient',
      midday_lunch: 'problem_solution',
      afterwork: 'social_proof',
      prime_evening: 'offer_urgency',
      late_scroll: 'social_proof',
    },
  },
  cosmetics: {
    boostHours: { 9: 8, 12: 10, 13: 12, 19: 10, 20: 14, 21: 16, 22: 16, 23: 12 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'story',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'benefit_ingredient',
      midday_lunch: 'problem_solution',
      afterwork: 'social_proof',
      prime_evening: 'lifestyle_aspiration',
      late_scroll: 'offer_urgency',
    },
  },
  fashion: {
    boostHours: { 12: 10, 13: 14, 18: 12, 19: 14, 20: 16, 21: 14, 22: 10 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'story',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'lifestyle_aspiration',
      midday_lunch: 'social_proof',
      afterwork: 'lifestyle_aspiration',
      prime_evening: 'offer_urgency',
      late_scroll: 'social_proof',
    },
  },
  jewelry: {
    boostHours: { 13: 10, 19: 12, 20: 16, 21: 18, 22: 14 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'feed',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'benefit_ingredient',
      midday_lunch: 'social_proof',
      afterwork: 'lifestyle_aspiration',
      prime_evening: 'offer_urgency',
      late_scroll: 'lifestyle_aspiration',
    },
  },
  tech: {
    boostHours: { 8: 12, 9: 10, 12: 12, 13: 10, 18: 10, 20: 14, 21: 14, 22: 12 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'feed',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'problem_solution',
      morning_commute: 'benefit_ingredient',
      midday_lunch: 'problem_solution',
      afterwork: 'social_proof',
      prime_evening: 'offer_urgency',
      late_scroll: 'benefit_ingredient',
    },
  },
  food: {
    boostHours: { 11: 18, 12: 20, 13: 14, 17: 14, 18: 18, 19: 16, 20: 10 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'story',
      midday_lunch: 'reel',
      afterwork: 'story',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'offer_urgency',
      midday_lunch: 'offer_urgency',
      afterwork: 'social_proof',
      prime_evening: 'lifestyle_aspiration',
      late_scroll: 'offer_urgency',
    },
  },
  home: {
    boostHours: { 9: 10, 10: 12, 13: 10, 19: 14, 20: 16, 21: 14 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'feed',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'problem_solution',
      midday_lunch: 'benefit_ingredient',
      afterwork: 'social_proof',
      prime_evening: 'offer_urgency',
      late_scroll: 'lifestyle_aspiration',
    },
  },
  general: {
    boostHours: { 8: 8, 12: 10, 13: 12, 18: 10, 20: 14, 21: 14 },
    preferredFormatByBlock: {
      early_morning: 'story',
      morning_commute: 'story',
      midday_lunch: 'feed',
      afterwork: 'reel',
      prime_evening: 'feed',
      late_scroll: 'story',
    },
    preferredAngleByBlock: {
      early_morning: 'lifestyle_aspiration',
      morning_commute: 'problem_solution',
      midday_lunch: 'social_proof',
      afterwork: 'benefit_ingredient',
      prime_evening: 'offer_urgency',
      late_scroll: 'social_proof',
    },
  },
};

export function isValidIanaTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz.trim()) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
    return true;
  } catch {
    return false;
  }
}

export function classifyHourToBlock(hour: number): TimeBlockId {
  if (hour < 8) return 'early_morning';
  if (hour < 11) return 'morning_commute';
  if (hour < 15) return 'midday_lunch';
  if (hour < 19) return 'afterwork';
  if (hour < 22) return 'prime_evening';
  return 'late_scroll';
}

/**
 * Extracts local date/time components in a specific IANA timezone for a given UTC Date.
 */
export function getLocalPartsInTimezone(utcDate: Date, timeZone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekdayIndex: number; // 0 = Sun .. 6 = Sat
  dateIso: string;      // YYYY-MM-DD
  dateTimeLocal: string; // YYYY-MM-DDTHH:mm
} {
  const safeTz = isValidIanaTimezone(timeZone) ? timeZone : 'UTC';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(utcDate);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  const year = parseInt(map.year || '2026', 10);
  const month = parseInt(map.month || '1', 10);
  const day = parseInt(map.day || '1', 10);
  const rawHour = parseInt(map.hour || '0', 10);
  const hour = rawHour === 24 ? 0 : rawHour;
  const minute = parseInt(map.minute || '0', 10);

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekdayIndex = weekdayMap[map.weekday] ?? utcDate.getUTCDay();

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const hh = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');

  return {
    year,
    month,
    day,
    hour,
    minute,
    weekdayIndex,
    dateIso: `${year}-${mm}-${dd}`,
    dateTimeLocal: `${year}-${mm}-${dd}T${hh}:${min}`,
  };
}

/**
 * Converts a local wall-clock time (year, month, day, hour, minute) in `timeZone`
 * into its exact UTC Date instant (DST-aware two-pass offset resolution).
 */
export function wallClockToUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const safeTz = isValidIanaTimezone(timeZone) ? timeZone : 'UTC';
  const approxUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  const getOffsetMs = (utcMs: number): number => {
    const parts = getLocalPartsInTimezone(new Date(utcMs), safeTz);
    const asUtcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
    return asUtcMs - utcMs;
  };

  const firstOffset = getOffsetMs(approxUtcMs);
  const firstGuess = approxUtcMs - firstOffset;
  const secondOffset = getOffsetMs(firstGuess);
  return new Date(approxUtcMs - secondOffset);
}

export function formatHourInLocale(
  utcDate: Date,
  timeZone: string,
  locale: string,
  timeFormat: '12h' | '24h'
): string {
  const safeTz = isValidIanaTimezone(timeZone) ? timeZone : 'UTC';
  try {
    return new Intl.DateTimeFormat(locale || 'en', {
      timeZone: safeTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    }).format(utcDate);
  } catch {
    return utcDate.toISOString().slice(11, 16);
  }
}

function computeSingleTimezoneScore(
  localWeekday: number,
  localHour: number,
  industry: BrandIndustryId,
  platform: SocialPlatformId,
  regionConfig: RegionClusterConfig,
  weekendDays: number[]
): number {
  const base = regionConfig.hourlyBaseline[localHour] ?? 50;
  const indMod = INDUSTRY_MODIFIERS[industry]?.boostHours[localHour] ?? 0;

  let platformMod = 0;
  if (platform === 'tiktok') {
    if (localHour >= 20 || localHour === 0) platformMod += 6;
  } else if (platform === 'facebook') {
    if (localHour >= 11 && localHour <= 15) platformMod += 5;
  } else {
    if (localHour === 8 || localHour === 13 || localHour === 20 || localHour === 21) platformMod += 4;
  }

  const isWeekend = weekendDays.includes(localWeekday);
  const dayBeforeWeekend = weekendDays.includes((localWeekday + 1) % 7);

  let dayMod = 0;
  if (isWeekend) {
    if (localHour >= 6 && localHour <= 9) dayMod -= 10; // Later wake-up on weekends
    if (localHour >= 11 && localHour <= 16) dayMod += 6;
    if (localHour >= 20 && localHour <= 23) dayMod += 5;
  } else if (dayBeforeWeekend && localHour >= 18 && localHour <= 23) {
    dayMod += 6; // Pre-weekend evening browsing
  }

  const raw = base + indMod + platformMod + dayMod;
  return Math.max(8, Math.min(99, Math.round(raw)));
}

export interface GenerateCalendarInput {
  industry?: BrandIndustryId;
  platform?: SocialPlatformId;
  regionCluster?: RegionClusterId;
  merchantTimezone?: string;
  audienceTimezones?: AudienceTimezoneShare[];
  weekStartsOn?: 0 | 1 | 6;
  weekendDays?: number[];
  timeFormat?: '12h' | '24h';
  locale?: string;
  referenceDate?: Date;
}

export function generateGlobalPostingCalendar(
  input: GenerateCalendarInput
): CalendarRecommendationResult {
  const regionCluster: RegionClusterId =
    input.regionCluster && REGION_CLUSTERS[input.regionCluster]
      ? input.regionCluster
      : 'western_europe';

  const regionConfig = REGION_CLUSTERS[regionCluster];
  const industry: BrandIndustryId =
    input.industry && INDUSTRY_MODIFIERS[input.industry] ? input.industry : 'general';
  const platform: SocialPlatformId = input.platform || 'both';

  const merchantTimezone = isValidIanaTimezone(input.merchantTimezone)
    ? input.merchantTimezone
    : regionConfig.defaultTimezone;

  const rawAudience = Array.isArray(input.audienceTimezones) && input.audienceTimezones.length > 0
    ? input.audienceTimezones.filter((a) => isValidIanaTimezone(a.timezone) && a.weight > 0)
    : [{ timezone: merchantTimezone, weight: 100, country: regionConfig.defaultCountry }];

  const totalWeight = rawAudience.reduce((acc, a) => acc + a.weight, 0) || 1;
  const normalizedAudience: AudienceTimezoneShare[] = rawAudience.map((a) => ({
    ...a,
    weight: Number((a.weight / totalWeight).toFixed(4)),
  }));

  const primaryAudienceTz = normalizedAudience.reduce(
    (best, cur) => (cur.weight > best.weight ? cur : best),
    normalizedAudience[0]
  ).timezone;

  const weekStartsOn: 0 | 1 | 6 =
    input.weekStartsOn === 0 || input.weekStartsOn === 1 || input.weekStartsOn === 6
      ? input.weekStartsOn
      : regionConfig.weekStartsOn;

  const weekendDays =
    Array.isArray(input.weekendDays) && input.weekendDays.length > 0
      ? input.weekendDays
      : regionConfig.weekendDays;

  const timeFormat: '12h' | '24h' = input.timeFormat || '24h';
  const locale = input.locale || 'en';

  const now = input.referenceDate || new Date();
  const merchantNow = getLocalPartsInTimezone(now, merchantTimezone);

  // Align the 7-day calendar to start today or on weekStartsOn (we generate 7 consecutive days starting from today in merchant TZ)
  const days: HeatmapDayColumn[] = [];
  const allCells: HeatmapSlotCell[] = [];

  for (let dOffset = 0; dOffset < 7; dOffset++) {
    const baseDayUtc = new Date(
      Date.UTC(merchantNow.year, merchantNow.month - 1, merchantNow.day + dOffset, 12, 0, 0)
    );
    const dayParts = getLocalPartsInTimezone(baseDayUtc, merchantTimezone);
    const isWeekend = weekendDays.includes(dayParts.weekdayIndex);

    const hourlyCells: HeatmapSlotCell[] = [];

    for (let hour = 0; hour < 24; hour++) {
      // Use :30 for prime evening or :00 otherwise for realistic scheduling
      const minute = hour === 13 || hour === 20 ? 30 : 0;
      const slotUtc = wallClockToUtcDate(
        dayParts.year,
        dayParts.month,
        dayParts.day,
        hour,
        minute,
        merchantTimezone
      );

      let weightedScore = 0;
      for (const aud of normalizedAudience) {
        const audParts = getLocalPartsInTimezone(slotUtc, aud.timezone);
        const s = computeSingleTimezoneScore(
          audParts.weekdayIndex,
          audParts.hour,
          industry,
          platform,
          regionConfig,
          weekendDays
        );
        weightedScore += s * aud.weight;
      }

      const finalScore = Math.round(weightedScore);
      const intensity: HeatmapSlotCell['intensity'] =
        finalScore >= 88
          ? 'golden'
          : finalScore >= 74
          ? 'high'
          : finalScore >= 52
          ? 'moderate'
          : 'low';

      const blockId = classifyHourToBlock(hour);
      const indModifier = INDUSTRY_MODIFIERS[industry];
      const recommendedFormat = indModifier.preferredFormatByBlock[blockId];
      const recommendedAngle = indModifier.preferredAngleByBlock[blockId];

      const merchantPartsExact = getLocalPartsInTimezone(slotUtc, merchantTimezone);
      const merchantTimeLabel = formatHourInLocale(slotUtc, merchantTimezone, locale, timeFormat);
      const audienceTimeLabel = formatHourInLocale(slotUtc, primaryAudienceTz, locale, timeFormat);

      const cell: HeatmapSlotCell = {
        dayIndex: dayParts.weekdayIndex,
        dateIso: dayParts.dateIso,
        hour,
        blockId,
        utcIso: slotUtc.toISOString(),
        merchantDateTimeLocal: merchantPartsExact.dateTimeLocal,
        merchantTimeLabel,
        audienceTimeLabel,
        audienceTimezone: primaryAudienceTz,
        timezoneDiffers: merchantTimezone !== primaryAudienceTz && merchantTimeLabel !== audienceTimeLabel,
        isWeekend,
        score: finalScore,
        intensity,
        recommendedFormat,
        recommendedAngle,
      };

      hourlyCells.push(cell);
      allCells.push(cell);
    }

    const blockIds: TimeBlockId[] = [
      'early_morning',
      'morning_commute',
      'midday_lunch',
      'afterwork',
      'prime_evening',
      'late_scroll',
    ];

    const blocks: HeatmapSlotCell[] = blockIds.map((bId) => {
      const targetHour = regionConfig.blockHours[bId];
      return hourlyCells[targetHour] || hourlyCells[0];
    });

    days.push({
      dayOfWeek: dayParts.weekdayIndex,
      dateIso: dayParts.dateIso,
      isWeekend,
      blocks,
      hourly: hourlyCells,
    });
  }

  // Pick top 6 distinct-day/block high-scoring future slots
  const nowMs = now.getTime();
  const futureBlockCells = days
    .flatMap((d) => d.blocks)
    .filter((c) => new Date(c.utcIso).getTime() > nowMs - 3600000)
    .sort((a, b) => b.score - a.score);

  const topSlots = futureBlockCells.slice(0, 6);

  return {
    source: 'heuristic_v1',
    industry,
    platform,
    regionCluster,
    merchantTimezone,
    audienceTimezones: normalizedAudience,
    weekStartsOn,
    weekendDays,
    timeFormat,
    days,
    topSlots,
  };
}

/**
 * Generates an editable caption template tailored to the chosen CreativeAngleType and language.
 */
export function buildAngleCaptionTemplate(params: {
  angle: CreativeAngleType;
  language: 'en' | 'fr' | 'ar' | 'dialect';
  shopName: string;
  productName?: string;
  deliveryMention?: string;
}): string {
  const shop = params.shopName || 'Our Store';
  const prod = params.productName || 'our signature collection';

  if (params.language === 'en') {
    switch (params.angle) {
      case 'lifestyle_aspiration':
        return `✨ Elevate your daily routine with ${prod} by ${shop}.\n\nCrafted for effortless style and lasting performance.\n\n📦 Fast, tracked delivery\n💬 Send us a DM or click the link in bio to order yours today.`;
      case 'problem_solution':
        return `💡 Tired of compromising on quality? Meet ${prod} from ${shop}.\n\n✓ Proven daily results\n✓ Premium certified materials\n\n👉 Message us now to get yours!`;
      case 'social_proof':
        return `⭐ Our #1 community favorite is back in stock at ${shop}!\n\nSee why customers love ${prod} for everyday reliability.\n\n📩 DM us to reserve yours before it sells out.`;
      case 'benefit_ingredient':
        return `💎 Pure craftsmanship, zero compromise. Discover what makes ${prod} by ${shop} stand out.\n\n✓ Authentic quality\n✓ Fast shipping\n\n👉 Tap to order or send us a message!`;
      case 'offer_urgency':
      default:
        return `🔥 Limited availability on ${prod} at ${shop}!\n\n✓ Certified original quality\n🚚 ${params.deliveryMention || 'Express tracked shipping'}\n\n📲 Send us a DM right now to secure your order!`;
    }
  }

  if (params.language === 'ar') {
    switch (params.angle) {
      case 'lifestyle_aspiration':
        return `✨ ارتقِ بروتينك اليومي مع ${prod} من ${shop}.\n\nتصميم أنيق وجودة استثنائية تدوم طويلاً.\n\n📦 توصيل سريع وموثوق\n💬 أرسل لنا رسالة خاصة الآن لطلب منتجك!`;
      case 'problem_solution':
        return `💡 هل تبحث عن الحل الأمثل؟ اكتشف ${prod} لدى ${shop}.\n\n✓ جودة أصلية مضمونة 100%\n✓ نتائج فعالة من أول استخدام\n\n👉 تواصل معنا عبر الرسائل للحجز!`;
      case 'social_proof':
        return `⭐ المنتج الأكثر طلباً وتقييماً عاد من جديد لدى ${shop}!\n\nاكتشف سر اختيار عملائنا لـ ${prod}.\n\n📩 راسلنا الآن لحجز طلبك!`;
      case 'benefit_ingredient':
        return `💎 عناية فائقة بأدق التفاصيل مع ${prod} من ${shop}.\n\n✓ مكونات وخامات عالية الجودة\n🚚 شحن سريع وآمن\n\n👉 اطلب الآن عبر الرسائل الخاصة!`;
      case 'offer_urgency':
      default:
        return `🔥 كميات محدودة جداً من ${prod} لدى ${shop}!\n\n✓ جودة أصلية مضمونة\n🚚 توصيل سريع ومباشر\n\n📲 أرسل رسالة الآن لتأكيد طلبك قبل نفاد الكمية!`;
    }
  }

  if (params.language === 'dialect') {
    return `🔥 Weslet el nouveauté chez ${shop} !\n\nQualité 100% originale w résultat مضمون men awwel marra.\n\n🚚 ${params.deliveryMention || 'Livraison rapide 24-48h'}\n💰 Khlas waqt el livraison\n\n📲 Abathna message privé tawwa bech treservi !`;
  }

  // Default: 'fr'
  switch (params.angle) {
    case 'lifestyle_aspiration':
      return `✨ Sublimez votre quotidien avec ${prod} signé ${shop}.\n\nUne finition irréprochable pensée pour durer.\n\n📦 ${params.deliveryMention || 'Livraison rapide et soignée'}\n💬 Envoyez-nous un message privé pour commander.`;
    case 'problem_solution':
      return `💡 Ne faites plus aucun compromis sur la qualité : découvrez ${prod} chez ${shop}.\n\n✓ Efficacité prouvée au quotidien\n✓ Qualité certifiée\n\n👉 Écrivez-nous en DM pour réserver le vôtre !`;
    case 'social_proof':
      return `⭐ Notre best-seller n°1 est de retour chez ${shop} !\n\nDécouvrez pourquoi nos clients plébiscitent ${prod}.\n\n📩 Commandez dès maintenant par message privé !`;
    case 'benefit_ingredient':
      return `💎 L'exigence du détail : découvrez la conception pure de ${prod} par ${shop}.\n\n✓ Finition haut de gamme\n🚚 ${params.deliveryMention || 'Expédition rapide'}\n\n👉 Contactez-nous en DM pour plus d'infos !`;
    case 'offer_urgency':
    default:
      return `🔥 Stock très limité sur ${prod} chez ${shop} !\n\n✓ Qualité 100% certifiée\n🚚 ${params.deliveryMention || 'Livraison express'}\n\n📲 Envoyez-nous un message maintenant pour réserver !`;
  }
}

