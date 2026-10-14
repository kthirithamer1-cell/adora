import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getScheduledPosts, createScheduledPost } from '@/lib/social';

export async function GET() {
  try {
    const session = await getCurrentSession();
    const posts = getScheduledPosts(session.workspace.id);
    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { platform, imageUrl, caption, scheduledFor, postType } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image manquante' },
        { status: 400 }
      );
    }

    const scheduled = createScheduledPost(session.workspace.id, {
      platform: platform || 'instagram',
      imageUrl,
      caption: caption || '',
      scheduledFor: scheduledFor || new Date(Date.now() + 3600000 * 2).toISOString(),
      postType: postType || 'feed',
    });

    return NextResponse.json({
      success: true,
      data: scheduled,
      message: 'Publication programmée avec succès.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
