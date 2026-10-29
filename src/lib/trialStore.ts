import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const TRIAL_COOKIE_NAME = 'markmosaiq_trial_guest';

export interface TrialPostRecord {
  id: string;
  guestId: string;
  clientIp: string;
  brandName: string;
  category: 'Skincare' | 'Cosmetics' | 'Perfume';
  style: 'Premium & minimal' | 'Natural & organic' | 'Bold & modern';
  goal: 'educate' | 'care' | 'promote';
  socialHandle: string;
  headline: string;
  subheadline: string;
  caption: string;
  hashtags: string[];
  previewDataUrl: string; // Watermarked base64 data URL for anonymous preview
  unwatermarkedDataUrl: string; // Full-res unwatermarked base64 unlocked after claim
  storyCards: {
    title: string;
    subtitle: string;
    image: string;
  }[];
  createdAt: string;
  claimedByUserId?: string;
  claimedByWorkspaceId?: string;
  claimedAt?: string;
}

interface TrialStoreData {
  recordsByGuestId: Record<string, TrialPostRecord>;
  generationsByIp: Record<string, number>;
}

const STORE_FILE_PATH = path.join(process.cwd(), '.next-data-trials.json');

declare global {
  // eslint-disable-next-line no-var
  var __markmosaiqTrialStore: TrialStoreData | undefined;
}

function loadStore(): TrialStoreData {
  if (global.__markmosaiqTrialStore) {
    return global.__markmosaiqTrialStore;
  }

  let initial: TrialStoreData = {
    recordsByGuestId: {},
    generationsByIp: {},
  };

  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        initial = {
          recordsByGuestId: parsed.recordsByGuestId || {},
          generationsByIp: parsed.generationsByIp || {},
        };
      }
    }
  } catch (e) {
    console.warn('[TRIAL STORE] Failed to load persisted trial store:', e);
  }

  global.__markmosaiqTrialStore = initial;
  return initial;
}

function saveStore(store: TrialStoreData): void {
  try {
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[TRIAL STORE] Failed to save trial store:', e);
  }
}

export function getTrialByGuestId(guestId: string): TrialPostRecord | null {
  if (!guestId) return null;
  const store = loadStore();
  return store.recordsByGuestId[guestId] || null;
}

export function getIpGenerationCount(ip: string): number {
  const store = loadStore();
  return store.generationsByIp[ip] || 0;
}

export function saveTrialRecord(record: TrialPostRecord): void {
  const store = loadStore();
  store.recordsByGuestId[record.guestId] = record;
  store.generationsByIp[record.clientIp] = (store.generationsByIp[record.clientIp] || 0) + 1;
  saveStore(store);
}

export function claimTrialRecord(
  guestId: string,
  userId: string,
  workspaceId: string
): TrialPostRecord | null {
  const store = loadStore();
  const record = store.recordsByGuestId[guestId];
  if (!record) return null;

  record.claimedByUserId = userId;
  record.claimedByWorkspaceId = workspaceId;
  record.claimedAt = new Date().toISOString();
  saveStore(store);
  return record;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxCharsPerLine) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

/**
 * Renders a real studio-composited branded Instagram post (1080x1080) using Sharp.
 * Produces both a watermarked preview version (for anonymous trial) and a clean master version (unlocked upon signup).
 */
export async function renderBrandedTrialVisuals(params: {
  baseImageRelPath: string;
  brandName: string;
  socialHandle: string;
  category: string;
  style: string;
  headline: string;
  subheadline: string;
}): Promise<{ previewDataUrl: string; unwatermarkedDataUrl: string }> {
  const cleanRel = params.baseImageRelPath.replace(/^\//, '');
  const fullImagePath = path.join(process.cwd(), 'public', cleanRel);

  const width = 900;
  const height = 900;

  let baseBuffer: Buffer;
  if (fs.existsSync(fullImagePath)) {
    baseBuffer = await sharp(fullImagePath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .toBuffer();
  } else {
    // Fallback luxury cream canvas
    baseBuffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 243, g: 239, b: 232 },
      },
    })
      .jpeg()
      .toBuffer();
  }

  const brandUpper = escapeXml((params.brandName || 'BLOOM SKIN').toUpperCase().slice(0, 26));
  const handleClean = escapeXml(
    params.socialHandle
      ? params.socialHandle.startsWith('@')
        ? params.socialHandle
        : `@${params.socialHandle.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '')}`
      : `@${(params.brandName || 'bloomskin').toLowerCase().replace(/[^a-z0-9]/g, '')}`
  );
  const subheadClean = escapeXml(params.subheadline.toUpperCase().slice(0, 36));
  const headlineLines = wrapTextLines(params.headline, 24).map(escapeXml);

  const buildSvgOverlay = (includeWatermark: boolean) => {
    const headlineTspans = headlineLines
      .map(
        (line, idx) =>
          `<tspan x="64" dy="${idx === 0 ? 0 : 52}">${line}</tspan>`
      )
      .join('');

    const watermarkSvg = includeWatermark
      ? `
        <g transform="translate(620, 28)">
          <rect x="0" y="0" width="252" height="36" rx="18" fill="rgba(24, 24, 27, 0.72)" />
          <circle cx="20" cy="18" r="4" fill="#10B981" />
          <text x="34" y="23" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#FFFFFF" letter-spacing="0.8">
            TRIAL PREVIEW • MARKMOSAIQ
          </text>
        </g>
      `
      : '';

    return Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FAF8F5" stop-opacity="0.92" />
            <stop offset="42%" stop-color="#FAF8F5" stop-opacity="0.25" />
            <stop offset="72%" stop-color="#18181B" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#18181B" stop-opacity="0.68" />
          </linearGradient>
        </defs>

        <!-- Editorial Lighting Gradient -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#topGrad)" />

        <!-- Subtle Luxury Inner Frame -->
        <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="12" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" />

        <!-- Top Category Pill -->
        <rect x="64" y="58" width="${Math.max(140, subheadClean.length * 8.5 + 32)}" height="30" rx="15" fill="rgba(24, 24, 27, 0.85)" />
        <text x="80" y="77" font-family="sans-serif" font-size="11" font-weight="700" fill="#FAF8F5" letter-spacing="2">
          ${subheadClean}
        </text>

        <!-- Editorial Headline -->
        <text x="64" y="142" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="600" fill="#1A1816">
          ${headlineTspans}
        </text>

        <!-- Bottom Brand Identity Plaque -->
        <g transform="translate(64, ${height - 128})">
          <rect x="0" y="0" width="${width - 128}" height="74" rx="12" fill="rgba(255, 255, 255, 0.92)" />
          <text x="28" y="34" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="700" fill="#1A1816" letter-spacing="3.5">
            ✦ ${brandUpper} ✦
          </text>
          <text x="28" y="56" font-family="sans-serif" font-size="13" font-weight="500" fill="#6E6A64" letter-spacing="0.5">
            ${handleClean} • Bespoke Beauty Studio
          </text>
        </g>

        ${watermarkSvg}
      </svg>
    `);
  };

  const previewBuffer = await sharp(baseBuffer)
    .composite([{ input: buildSvgOverlay(true), top: 0, left: 0 }])
    .jpeg({ quality: 86 })
    .toBuffer();

  const unwatermarkedBuffer = await sharp(baseBuffer)
    .composite([{ input: buildSvgOverlay(false), top: 0, left: 0 }])
    .jpeg({ quality: 95 })
    .toBuffer();

  return {
    previewDataUrl: `data:image/jpeg;base64,${previewBuffer.toString('base64')}`,
    unwatermarkedDataUrl: `data:image/jpeg;base64,${unwatermarkedBuffer.toString('base64')}`,
  };
}

