import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getScheduledPosts, createScheduledPost, deleteScheduledPost } from '@/lib/social';
import { isValidIanaTimezone, wallClockToUtcDate } from '@/lib/postingCalendarEngine';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || !session.workspace) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
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
    if (!session || !session.workspace) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      platform,
      imageUrl,
      caption,
      scheduledFor,
      scheduledForUtc,
      merchantDateTimeLocal,
      merchantTimezone,
      audiencePrimaryTimezone,
      creativeAngle,
      postType,
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    const safeMerchantTz = isValidIanaTimezone(merchantTimezone) ? merchantTimezone : 'UTC';
    const safeAudienceTz = isValidIanaTimezone(audiencePrimaryTimezone)
      ? audiencePrimaryTimezone
      : safeMerchantTz;

    let canonicalUtcIso = scheduledForUtc || scheduledFor;

    // If merchantDateTimeLocal ('YYYY-MM-DDTHH:mm') is provided with merchantTimezone, resolve DST-safe UTC
    if (typeof merchantDateTimeLocal === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(merchantDateTimeLocal)) {
      const [datePart, timePart] = merchantDateTimeLocal.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [hh, mm] = timePart.split(':').map(Number);
      const utcDate = wallClockToUtcDate(y, m, d, hh, mm, safeMerchantTz);
      canonicalUtcIso = utcDate.toISOString();
    }

    if (!canonicalUtcIso || isNaN(new Date(canonicalUtcIso).getTime())) {
      canonicalUtcIso = new Date(Date.now() + 3600000 * 2).toISOString();
    } else {
      canonicalUtcIso = new Date(canonicalUtcIso).toISOString();
    }

    const scheduled = createScheduledPost(session.workspace.id, {
      platform: platform || 'instagram',
      imageUrl,
      caption: caption || '',
      scheduledFor: canonicalUtcIso,
      scheduledForUtc: canonicalUtcIso,
      merchantTimezone: safeMerchantTz,
      audiencePrimaryTimezone: safeAudienceTz,
      creativeAngle: creativeAngle || undefined,
      postType: postType || 'feed',
    });

    return NextResponse.json({
      success: true,
      data: scheduled,
      message: 'Post scheduled successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.workspace) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing post id' }, { status: 400 });
    }

    const deleted = deleteScheduledPost(session.workspace.id, id);
    return NextResponse.json({
      success: true,
      data: { deleted },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
