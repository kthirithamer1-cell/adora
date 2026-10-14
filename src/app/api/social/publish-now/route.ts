import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { publishPostImmediately } from '@/lib/social';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { platform = 'instagram', imageUrl, caption, postType = 'feed' } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image manquante' },
        { status: 400 }
      );
    }

    // Publication immédiate Meta Graph API
    const published = publishPostImmediately(session.workspace.id, {
      platform,
      imageUrl,
      caption: caption || '',
      postType,
    });

    return NextResponse.json({
      success: true,
      data: published,
      message: `🎉 Visuel publié avec succès sur ${platform === 'both' ? 'Instagram & Facebook' : platform.toUpperCase()} !`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
