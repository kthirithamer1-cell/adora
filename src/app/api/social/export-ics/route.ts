import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getBrandKitByWorkspace } from '@/lib/brandkit';
import { getScheduledPosts, getWorkspaceCalendarSettings } from '@/lib/social';
import {
  generateGlobalPostingCalendar,
  BrandIndustryId,
  SocialPlatformId,
  RegionClusterId,
} from '@/lib/postingCalendarEngine';

function formatUtcToIcsTimestamp(date: Date): string {
  const iso = date.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(text: string): string {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.workspace) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = session.workspace.id;
    const includeGolden = searchParams.get('includeGolden') !== 'false';
    const industryParam = searchParams.get('industry') as BrandIndustryId | null;
    const platformParam = searchParams.get('platform') as SocialPlatformId | null;
    const regionParam = searchParams.get('regionCluster') as RegionClusterId | null;

    const brandKit = getBrandKitByWorkspace(workspaceId);
    const settings = getWorkspaceCalendarSettings(workspaceId);
    const scheduledPosts = getScheduledPosts(workspaceId).filter((p) => p.status === 'scheduled');

    const nowStamp = formatUtcToIcsTimestamp(new Date());
    const events: string[] = [];

    for (const post of scheduledPosts) {
      const startUtc = new Date(post.scheduledForUtc || post.scheduledFor);
      if (isNaN(startUtc.getTime())) continue;
      const endUtc = new Date(startUtc.getTime() + 30 * 60 * 1000);

      const summary = `[MarkMosaiq] Publish ${post.postType.toUpperCase()} on ${post.platform.toUpperCase()}`;
      const desc = `Scheduled Post (${brandKit.shopName})\nFormat: ${post.postType.toUpperCase()}\nPlatform: ${post.platform.toUpperCase()}\nVisual: ${post.imageUrl}\n\nCaption:\n${post.caption}`;

      events.push(
        [
          'BEGIN:VEVENT',
          `UID:post-${post.id}@markmosaiq.app`,
          `DTSTAMP:${nowStamp}`,
          `DTSTART:${formatUtcToIcsTimestamp(startUtc)}`,
          `DTEND:${formatUtcToIcsTimestamp(endUtc)}`,
          `SUMMARY:${escapeIcsText(summary)}`,
          `DESCRIPTION:${escapeIcsText(desc)}`,
          'BEGIN:VALARM',
          'TRIGGER:-PT10M',
          'ACTION:DISPLAY',
          'DESCRIPTION:Reminder: Social Media Post in 10 minutes',
          'END:VALARM',
          'END:VEVENT',
        ].join('\r\n')
      );
    }

    if (includeGolden) {
      const calendar = generateGlobalPostingCalendar({
        industry: industryParam || (brandKit.industry as BrandIndustryId) || 'general',
        platform: platformParam || 'both',
        regionCluster: regionParam || settings.regionCluster,
        merchantTimezone: settings.merchantTimezone,
        audienceTimezones: settings.audienceTimezones,
        weekStartsOn: settings.weekStartsOn,
        weekendDays: settings.weekendDays,
        timeFormat: settings.timeFormat,
      });

      for (const slot of calendar.topSlots) {
        const startUtc = new Date(slot.utcIso);
        if (isNaN(startUtc.getTime())) continue;
        const endUtc = new Date(startUtc.getTime() + 30 * 60 * 1000);

        const summary = `🔥 [Best Time to Post] ${brandKit.shopName} (${slot.recommendedFormat.toUpperCase()})`;
        const desc = `Recommended Posting Window (Heuristic v1 Score: ${slot.score}/100)\nIndustry: ${calendar.industry}\nRecommended Angle: ${slot.recommendedAngle}\nMerchant Time (${calendar.merchantTimezone}): ${slot.merchantTimeLabel}\nAudience Time (${slot.audienceTimezone}): ${slot.audienceTimeLabel}\n\nNote: Static .ICS snapshot exported from MarkMosaiq.`;

        events.push(
          [
            'BEGIN:VEVENT',
            `UID:golden-${slot.dateIso}-${slot.hour}@markmosaiq.app`,
            `DTSTAMP:${nowStamp}`,
            `DTSTART:${formatUtcToIcsTimestamp(startUtc)}`,
            `DTEND:${formatUtcToIcsTimestamp(endUtc)}`,
            `SUMMARY:${escapeIcsText(summary)}`,
            `DESCRIPTION:${escapeIcsText(desc)}`,
            'BEGIN:VALARM',
            'TRIGGER:-PT10M',
            'ACTION:DISPLAY',
            'DESCRIPTION:Peak social media window in 10 minutes',
            'END:VALARM',
            'END:VEVENT',
          ].join('\r\n')
        );
      }
    }

    const icsBody = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MarkMosaiq//Global Social Posting Calendar v1//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeIcsText(`${brandKit.shopName} - Posting Calendar`)}`,
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');

    return new NextResponse(icsBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="markmosaiq-posting-calendar.ics"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate ICS file' },
      { status: 500 }
    );
  }
}

