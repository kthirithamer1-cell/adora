import { NextResponse } from 'next/server';
import { getMemoryUsers, getMemoryWorkspaces } from '@/lib/auth';
import { memoryEmailLogs } from '@/lib/email';

export async function GET() {
  try {
    const users = getMemoryUsers();
    const workspaces = getMemoryWorkspaces();

    const leads = users.map((user) => {
      const userWs = workspaces.filter((w) => w.ownerId === user.id || w.members.some((m) => m.userId === user.id));
      const primaryWs = userWs[0];
      const emailsReceived = memoryEmailLogs.filter((e) => e.recipientEmail.toLowerCase() === user.email.toLowerCase());

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Non renseigné',
        storeName: primaryWs?.name || 'Boutique',
        storeUrl: user.storeUrl || primaryWs?.storeUrl || 'Non renseigné',
        niche: user.niche || primaryWs?.niche || 'Généraliste',
        adChannels: user.adChannels || ['meta'],
        monthlyVolumeTier: user.monthlyVolumeTier || '1-5',
        monthlyAdSpendTier: user.monthlyAdSpendTier || '<1k',
        leadScore: user.leadScore || 'STANDARD',
        creditsRemaining: primaryWs?.creditsRemaining ?? 10,
        plan: primaryWs?.plan || 'trial',
        createdAt: user.createdAt,
        emailsSentCount: emailsReceived.length,
        lastEmailSent: emailsReceived[0]?.subject || null,
      };
    });

    return NextResponse.json({
      success: true,
      totalLeads: leads.length,
      hotLeadsCount: leads.filter((l) => l.leadScore === 'HOT').length,
      warmLeadsCount: leads.filter((l) => l.leadScore === 'WARM').length,
      data: leads,
      recentEmailLogs: memoryEmailLogs.slice(0, 20),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
