import {
  RegionClusterId,
  AudienceTimezoneShare,
  WorkspaceCalendarSettings,
  REGION_CLUSTERS,
  isValidIanaTimezone,
} from './postingCalendarEngine';

export interface SocialAccount {
  id: string;
  workspaceId: string;
  platform: 'instagram' | 'facebook';
  accountName: string;
  username: string;
  profilePictureUrl: string;
  isConnected: boolean;
  accessTokenExpiry: string;
}

export interface ScheduledPost {
  id: string;
  workspaceId: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'both';
  imageUrl: string;
  caption: string;
  scheduledFor: string;          // ISO-8601 UTC string (kept as primary/alias for backwards compatibility)
  scheduledForUtc?: string;      // Canonical ISO-8601 UTC instant
  merchantTimezone?: string;     // IANA timezone of the merchant when scheduled
  audiencePrimaryTimezone?: string; // Primary target audience IANA timezone
  creativeAngle?: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  postType: 'feed' | 'story' | 'reel';
  publishedPostId?: string;
  publishedUrl?: string;
  createdAt: string;
}

const initialAccounts: Record<string, SocialAccount[]> = {
  ws_nutristore: [
    {
      id: 'acc_ig_nutri',
      workspaceId: 'ws_nutristore',
      platform: 'instagram',
      accountName: 'NutriStore Official',
      username: '@nutristore.official',
      profilePictureUrl: '/images/logo.png',
      isConnected: true,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
    {
      id: 'acc_fb_nutri',
      workspaceId: 'ws_nutristore',
      platform: 'facebook',
      accountName: 'NutriStore - Performance & Whey',
      username: 'nutristore.official',
      profilePictureUrl: '/images/logo.png',
      isConnected: true,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
  ],
  ws_vestiaire: [
    {
      id: 'acc_ig_vest',
      workspaceId: 'ws_vestiaire',
      platform: 'instagram',
      accountName: 'Vestiaire Studio',
      username: '@vestiaire.studio',
      profilePictureUrl: '/images/hero_lifestyle.jpg',
      isConnected: true,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
  ],
};

const initialPosts: Record<string, ScheduledPost[]> = {
  ws_nutristore: [
    {
      id: 'post_1',
      workspaceId: 'ws_nutristore',
      platform: 'both',
      imageUrl: '/images/bottle_nutrex.png',
      caption: `🔥 Nutrex IsoFit 100% Whey Isolate is back in stock!\n\nCertified 100% original quality, 25g pure protein per serving.\n\n🚚 Fast 24-48h tracked shipping\n💬 Send us a DM to reserve yours today!`,
      scheduledFor: '2026-11-06T19:30:00.000Z',
      scheduledForUtc: '2026-11-06T19:30:00.000Z',
      merchantTimezone: 'Africa/Tunis',
      audiencePrimaryTimezone: 'Europe/Paris',
      creativeAngle: 'offer_urgency',
      status: 'scheduled',
      postType: 'feed',
      createdAt: '2026-11-05T12:00:00.000Z',
    },
    {
      id: 'post_2',
      workspaceId: 'ws_nutristore',
      platform: 'instagram',
      imageUrl: '/images/creatine_story.jpg',
      caption: `🚨 Limited Stock Alert! Tap to reserve your Micronized Creapure before it sells out.`,
      scheduledFor: '2026-11-05T13:00:00.000Z',
      scheduledForUtc: '2026-11-05T13:00:00.000Z',
      merchantTimezone: 'Africa/Tunis',
      audiencePrimaryTimezone: 'Africa/Tunis',
      creativeAngle: 'social_proof',
      status: 'published',
      postType: 'story',
      publishedPostId: 'ig_media_1798234710',
      publishedUrl: 'https://instagram.com/p/nutristore-flash',
      createdAt: '2026-11-05T10:00:00.000Z',
    },
  ],
};

const initialCalendarSettings: Record<string, WorkspaceCalendarSettings> = {
  ws_nutristore: {
    workspaceId: 'ws_nutristore',
    merchantTimezone: 'Africa/Tunis',
    audienceTimezones: [
      { timezone: 'Africa/Tunis', weight: 60, country: 'TN', label: 'North Africa (CET)' },
      { timezone: 'Europe/Paris', weight: 40, country: 'FR', label: 'Western Europe (CET/CEST)' },
    ],
    regionCluster: 'maghreb_med',
    country: 'TN',
    regions: ['Tunis', 'Paris', 'Lyon', 'Sousse'],
    weekStartsOn: 1,
    weekendDays: [0, 6],
    timeFormat: '24h',
  },
  ws_vestiaire: {
    workspaceId: 'ws_vestiaire',
    merchantTimezone: 'Europe/Paris',
    audienceTimezones: [
      { timezone: 'Europe/Paris', weight: 70, country: 'FR', label: 'France & Europe' },
      { timezone: 'Asia/Dubai', weight: 30, country: 'AE', label: 'UAE & Gulf' },
    ],
    regionCluster: 'western_europe',
    country: 'FR',
    regions: ['Paris', 'Dubai', 'Geneva'],
    weekStartsOn: 1,
    weekendDays: [0, 6],
    timeFormat: '24h',
  },
};

let memoryAccounts = { ...initialAccounts };
let memoryPosts = { ...initialPosts };
let memoryCalendarSettings = { ...initialCalendarSettings };

function resolveWorkspaceKey(workspaceId: string): string {
  if (workspaceId === 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22') {
    return 'ws_nutristore';
  }
  return workspaceId || 'ws_nutristore';
}

export function getWorkspaceCalendarSettings(workspaceId: string): WorkspaceCalendarSettings {
  const key = resolveWorkspaceKey(workspaceId);
  if (memoryCalendarSettings[key]) {
    return memoryCalendarSettings[key];
  }

  const defaultSettings: WorkspaceCalendarSettings = {
    workspaceId: key,
    merchantTimezone: 'Europe/Paris',
    audienceTimezones: [
      { timezone: 'Europe/Paris', weight: 100, country: 'FR', label: 'Primary Audience' },
    ],
    regionCluster: 'western_europe',
    country: 'FR',
    regions: [],
    weekStartsOn: 1,
    weekendDays: [0, 6],
    timeFormat: '24h',
  };

  memoryCalendarSettings[key] = defaultSettings;
  return defaultSettings;
}

export function updateWorkspaceCalendarSettings(
  workspaceId: string,
  partial: Partial<WorkspaceCalendarSettings>
): WorkspaceCalendarSettings {
  const key = resolveWorkspaceKey(workspaceId);
  const current = getWorkspaceCalendarSettings(key);

  const regionCluster: RegionClusterId =
    partial.regionCluster && REGION_CLUSTERS[partial.regionCluster]
      ? partial.regionCluster
      : current.regionCluster;

  const merchantTimezone = isValidIanaTimezone(partial.merchantTimezone)
    ? partial.merchantTimezone
    : current.merchantTimezone;

  const audienceTimezones: AudienceTimezoneShare[] =
    Array.isArray(partial.audienceTimezones) && partial.audienceTimezones.length > 0
      ? partial.audienceTimezones.filter((a) => isValidIanaTimezone(a.timezone) && a.weight > 0)
      : current.audienceTimezones;

  const updated: WorkspaceCalendarSettings = {
    ...current,
    ...partial,
    workspaceId: key,
    regionCluster,
    merchantTimezone,
    audienceTimezones:
      audienceTimezones.length > 0
        ? audienceTimezones
        : [{ timezone: merchantTimezone, weight: 100 }],
  };

  memoryCalendarSettings[key] = updated;
  return updated;
}

export function getSocialAccounts(workspaceId: string): SocialAccount[] {
  const key = resolveWorkspaceKey(workspaceId);
  if (memoryAccounts[key]) {
    return memoryAccounts[key];
  }

  const defaultAccs: SocialAccount[] = [
    {
      id: `acc_ig_${key}`,
      workspaceId: key,
      platform: 'instagram',
      accountName: 'Instagram Business Store',
      username: '@mystore.official',
      profilePictureUrl: '/images/logo.png',
      isConnected: false,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
    {
      id: `acc_fb_${key}`,
      workspaceId: key,
      platform: 'facebook',
      accountName: 'Official Facebook Page',
      username: 'mystore.official',
      profilePictureUrl: '/images/logo.png',
      isConnected: false,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
  ];

  memoryAccounts[key] = defaultAccs;
  return defaultAccs;
}

export function toggleAccountConnection(
  workspaceId: string,
  platform: 'instagram' | 'facebook'
): SocialAccount[] {
  const accs = getSocialAccounts(workspaceId);
  const target = accs.find((a) => a.platform === platform);
  if (target) {
    target.isConnected = !target.isConnected;
  }
  return accs;
}

export function getScheduledPosts(workspaceId: string): ScheduledPost[] {
  const key = resolveWorkspaceKey(workspaceId);
  return memoryPosts[key] || [];
}

export function createScheduledPost(
  workspaceId: string,
  post: Omit<ScheduledPost, 'id' | 'workspaceId' | 'status' | 'createdAt'>
): ScheduledPost {
  const key = resolveWorkspaceKey(workspaceId);
  if (!memoryPosts[key]) {
    memoryPosts[key] = [];
  }

  const utcInstant = post.scheduledForUtc || post.scheduledFor || new Date().toISOString();

  const newPost: ScheduledPost = {
    ...post,
    scheduledFor: utcInstant,
    scheduledForUtc: utcInstant,
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    workspaceId: key,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  memoryPosts[key].unshift(newPost);
  return newPost;
}

export function publishPostImmediately(
  workspaceId: string,
  postData: {
    platform: 'instagram' | 'facebook' | 'tiktok' | 'both';
    imageUrl: string;
    caption: string;
    postType: 'feed' | 'story' | 'reel';
    merchantTimezone?: string;
    audiencePrimaryTimezone?: string;
    creativeAngle?: string;
  }
): ScheduledPost {
  const key = resolveWorkspaceKey(workspaceId);
  if (!memoryPosts[key]) {
    memoryPosts[key] = [];
  }

  const id = `post_${Date.now()}`;
  const nowIso = new Date().toISOString();
  const publishedPost: ScheduledPost = {
    id,
    workspaceId: key,
    platform: postData.platform,
    imageUrl: postData.imageUrl,
    caption: postData.caption,
    scheduledFor: nowIso,
    scheduledForUtc: nowIso,
    merchantTimezone: postData.merchantTimezone || 'UTC',
    audiencePrimaryTimezone: postData.audiencePrimaryTimezone || postData.merchantTimezone || 'UTC',
    creativeAngle: postData.creativeAngle,
    status: 'published',
    postType: postData.postType,
    publishedPostId: `meta_${Date.now()}`,
    publishedUrl: `https://instagram.com/p/${Date.now()}`,
    createdAt: nowIso,
  };

  memoryPosts[key].unshift(publishedPost);
  return publishedPost;
}

export function deleteScheduledPost(workspaceId: string, postId: string): boolean {
  const key = resolveWorkspaceKey(workspaceId);
  if (!memoryPosts[key]) return false;
  const initialLength = memoryPosts[key].length;
  memoryPosts[key] = memoryPosts[key].filter((p) => p.id !== postId);
  return memoryPosts[key].length < initialLength;
}
