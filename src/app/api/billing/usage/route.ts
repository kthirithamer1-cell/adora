import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getWorkspaceUsage } from '@/lib/billing';

export async function GET() {
  try {
    const session = await getCurrentSession();
    const usage = await getWorkspaceUsage(session.workspace.id);
    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
