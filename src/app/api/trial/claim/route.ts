import { NextRequest, NextResponse } from 'next/server';
import {
  TRIAL_COOKIE_NAME,
  claimTrialRecord,
  getTrialByGuestId,
} from '@/lib/trialStore';
import { getCurrentSession, findWorkspaceById } from '@/lib/auth';

/**
 * POST /api/trial/claim
 * Attaches the guest's generated trial post to their newly created or logged-in account,
 * removes the trial watermark, and returns their unlocked high-res visual + 10 free credits status.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const cookieGuestId = req.cookies.get(TRIAL_COOKIE_NAME)?.value;
    const guestId = body.guestId || cookieGuestId || '';

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'No guest trial session found to claim.' },
        { status: 400 }
      );
    }

    const session = await getCurrentSession();
    const userId = body.userId || session?.user?.id || 'usr_claimed';
    const workspaceId =
      body.workspaceId ||
      session?.workspace?.id ||
      'ws_claimed';

    const existing = getTrialByGuestId(guestId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Trial post expired or not found.' },
        { status: 404 }
      );
    }

    const claimed = claimTrialRecord(guestId, userId, workspaceId);
    if (!claimed) {
      return NextResponse.json(
        { success: false, error: 'Could not claim trial record.' },
        { status: 500 }
      );
    }

    const workspace = findWorkspaceById(workspaceId) || session?.workspace;
    const creditsRemaining =
      typeof workspace?.creditsRemaining === 'number'
        ? workspace.creditsRemaining
        : 10;

    return NextResponse.json({
      success: true,
      message: 'Your branded post has been saved to your account and your 10 free credits are active!',
      creditsRemaining,
      data: {
        id: claimed.id,
        guestId: claimed.guestId,
        brandName: claimed.brandName,
        category: claimed.category,
        style: claimed.style,
        goal: claimed.goal,
        headline: claimed.headline,
        subheadline: claimed.subheadline,
        caption: claimed.caption,
        hashtags: claimed.hashtags,
        imageUrl: claimed.unwatermarkedDataUrl,
        isWatermarked: false,
        isClaimed: true,
        storyCards: claimed.storyCards,
        claimedByWorkspaceId: workspaceId,
      },
    });
  } catch (err: any) {
    console.error('[TRIAL CLAIM ERROR]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to claim trial post.' },
      { status: 500 }
    );
  }
}
