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
  platform: 'instagram' | 'facebook' | 'both';
  imageUrl: string;
  caption: string;
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  postType: 'feed' | 'story';
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
      accountName: 'NutriStore Tunisie Officiel',
      username: '@nutristore.tn',
      profilePictureUrl: '/images/Adora_logo.png',
      isConnected: true,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
    {
      id: 'acc_fb_nutri',
      workspaceId: 'ws_nutristore',
      platform: 'facebook',
      accountName: 'NutriStore TN - Compléments & Whey',
      username: 'nutristore.tunisie',
      profilePictureUrl: '/images/Adora_logo.png',
      isConnected: true,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
  ],
  ws_vestiaire: [
    {
      id: 'acc_ig_vest',
      workspaceId: 'ws_vestiaire',
      platform: 'instagram',
      accountName: 'Vestiaire Tunis',
      username: '@vestiaire_tunis',
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
      caption: `🔥 Weslet el Nutrex IsoFit fi boutique mteena !\n\nQualité originale 100%, 25g de protéine par dose w khfifa al meeda. \n\n🚚 Livri fisaa fi tounes el kol (24-48h)\n💰 Khlas fel livraison\n\nAbathna message bech treservi pot mteeek !`,
      scheduledFor: '2026-10-08T19:30:00Z',
      status: 'scheduled',
      postType: 'feed',
      createdAt: '2026-10-07T12:00:00Z',
    },
    {
      id: 'post_2',
      workspaceId: 'ws_nutristore',
      platform: 'instagram',
      imageUrl: '/images/creatine_story.jpg',
      caption: `🚨 RUPTURE DE STOCK IMMINENTE ! Cliquez vite pour réserver votre Creapure avant épuisement !`,
      scheduledFor: '2026-10-07T14:00:00Z',
      status: 'published',
      postType: 'story',
      publishedPostId: 'ig_media_1798234710',
      publishedUrl: 'https://instagram.com/p/nutristore-flash',
      createdAt: '2026-10-07T10:00:00Z',
    },
  ],
};

let memoryAccounts = { ...initialAccounts };
let memoryPosts = { ...initialPosts };

export function getSocialAccounts(workspaceId: string): SocialAccount[] {
  if (memoryAccounts[workspaceId]) {
    return memoryAccounts[workspaceId];
  }

  const defaultAccs: SocialAccount[] = [
    {
      id: `acc_ig_${workspaceId}`,
      workspaceId,
      platform: 'instagram',
      accountName: 'Boutique Instagram',
      username: '@maboutique.tn',
      profilePictureUrl: '/images/Adora_logo.png',
      isConnected: false,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
    {
      id: `acc_fb_${workspaceId}`,
      workspaceId,
      platform: 'facebook',
      accountName: 'Page Facebook',
      username: 'boutique.tn',
      profilePictureUrl: '/images/Adora_logo.png',
      isConnected: false,
      accessTokenExpiry: '2026-12-31T23:59:59Z',
    },
  ];

  memoryAccounts[workspaceId] = defaultAccs;
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
  return memoryPosts[workspaceId] || [];
}

export function createScheduledPost(
  workspaceId: string,
  post: Omit<ScheduledPost, 'id' | 'workspaceId' | 'status' | 'createdAt'>
): ScheduledPost {
  if (!memoryPosts[workspaceId]) {
    memoryPosts[workspaceId] = [];
  }

  const newPost: ScheduledPost = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    workspaceId,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  memoryPosts[workspaceId].unshift(newPost);
  return newPost;
}

export function publishPostImmediately(
  workspaceId: string,
  postData: {
    platform: 'instagram' | 'facebook' | 'both';
    imageUrl: string;
    caption: string;
    postType: 'feed' | 'story';
  }
): ScheduledPost {
  if (!memoryPosts[workspaceId]) {
    memoryPosts[workspaceId] = [];
  }

  const id = `post_${Date.now()}`;
  const publishedPost: ScheduledPost = {
    id,
    workspaceId,
    platform: postData.platform,
    imageUrl: postData.imageUrl,
    caption: postData.caption,
    scheduledFor: new Date().toISOString(),
    status: 'published',
    postType: postData.postType,
    publishedPostId: `meta_${Date.now()}`,
    publishedUrl: `https://instagram.com/p/${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  memoryPosts[workspaceId].unshift(publishedPost);
  return publishedPost;
}

export function deleteScheduledPost(workspaceId: string, postId: string): boolean {
  if (!memoryPosts[workspaceId]) return false;
  const initialLength = memoryPosts[workspaceId].length;
  memoryPosts[workspaceId] = memoryPosts[workspaceId].filter((p) => p.id !== postId);
  return memoryPosts[workspaceId].length < initialLength;
}
