import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getBrandKitByWorkspace } from '@/lib/brandkit';
import {
  getWorkspaceCalendarSettings,
  updateWorkspaceCalendarSettings,
} from '@/lib/social';
import {
  generateGlobalPostingCalendar,
  isValidIanaTimezone,
  BrandIndustryId,
  SocialPlatformId,
  RegionClusterId,
  AudienceTimezoneShare,
} from '@/lib/postingCalendarEngine';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.workspace) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = session.workspace.id;
    const brandKit = getBrandKitByWorkspace(workspaceId);
    const savedSettings = getWorkspaceCalendarSettings(workspaceId);

    const industryParam = (searchParams.get('industry') || brandKit.industry || 'general') as BrandIndustryId;
    const platformParam = (searchParams.get('platform') || 'both') as SocialPlatformId;
    const regionClusterParam = (searchParams.get('regionCluster') || savedSettings.regionCluster) as RegionClusterId;
    const merchantTzParam = searchParams.get('merchantTimezone') || savedSettings.merchantTimezone;
    const localeParam = searchParams.get('locale') || 'en';
    const timeFormatParam = (searchParams.get('timeFormat') || savedSettings.timeFormat || '24h') as '12h' | '24h';

    if (searchParams.get('merchantTimezone') && !isValidIanaTimezone(merchantTzParam)) {
      return NextResponse.json(
        { success: false, error: `Invalid merchantTimezone: ${merchantTzParam}` },
        { status: 400 }
      );
    }

    let audienceTimezones: AudienceTimezoneShare[] = savedSettings.audienceTimezones;
    const audTzJson = searchParams.get('audienceTimezones');
    if (audTzJson) {
      try {
        const parsed = JSON.parse(audTzJson);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (!isValidIanaTimezone(item.timezone)) {
              return NextResponse.json(
                { success: false, error: `Invalid audience timezone: ${item.timezone}` },
                { status: 400 }
              );
            }
          }
          audienceTimezones = parsed;
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Malformed audienceTimezones JSON parameter' },
          { status: 400 }
        );
      }
    }

    const weekStartsOnParam = searchParams.get('weekStartsOn');
    const weekStartsOn =
      weekStartsOnParam === '0'
        ? 0
        : weekStartsOnParam === '1'
        ? 1
        : weekStartsOnParam === '6'
        ? 6
        : undefined;

    const calendar = generateGlobalPostingCalendar({
      industry: industryParam,
      platform: platformParam,
      regionCluster: regionClusterParam,
      merchantTimezone: merchantTzParam,
      audienceTimezones,
      weekStartsOn,
      timeFormat: timeFormatParam,
      locale: localeParam,
    });

    return NextResponse.json({
      success: true,
      data: {
        calendar,
        settings: savedSettings,
        brandKit: {
          shopName: brandKit.shopName,
          industry: brandKit.industry || 'general',
          positioning: brandKit.positioning || 'premium',
          deliveryMention: brandKit.deliveryMention,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
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
    const workspaceId = session.workspace.id;
    const brandKit = getBrandKitByWorkspace(workspaceId);

    if (body.merchantTimezone && !isValidIanaTimezone(body.merchantTimezone)) {
      return NextResponse.json(
        { success: false, error: `Invalid IANA timezone: ${body.merchantTimezone}` },
        { status: 400 }
      );
    }

    if (Array.isArray(body.audienceTimezones)) {
      for (const item of body.audienceTimezones) {
        if (!isValidIanaTimezone(item?.timezone)) {
          return NextResponse.json(
            { success: false, error: `Invalid audience IANA timezone: ${item?.timezone}` },
            { status: 400 }
          );
        }
      }
    }

    const updatedSettings = updateWorkspaceCalendarSettings(workspaceId, {
      merchantTimezone: body.merchantTimezone,
      audienceTimezones: body.audienceTimezones,
      regionCluster: body.regionCluster,
      country: body.country,
      regions: body.regions,
      weekStartsOn: body.weekStartsOn,
      weekendDays: body.weekendDays,
      timeFormat: body.timeFormat,
    });

    const calendar = generateGlobalPostingCalendar({
      industry: (body.industry || brandKit.industry || 'general') as BrandIndustryId,
      platform: (body.platform || 'both') as SocialPlatformId,
      regionCluster: updatedSettings.regionCluster,
      merchantTimezone: updatedSettings.merchantTimezone,
      audienceTimezones: updatedSettings.audienceTimezones,
      weekStartsOn: updatedSettings.weekStartsOn,
      weekendDays: updatedSettings.weekendDays,
      timeFormat: updatedSettings.timeFormat,
      locale: body.locale || 'en',
    });

    return NextResponse.json({
      success: true,
      data: {
        calendar,
        settings: updatedSettings,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

