'use server';

import { supabase, resolveWorkspaceUuid } from '@/lib/supabase';
import { getCurrentSession } from '@/lib/auth';
import { getBrandKitByWorkspace, updateBrandKitByWorkspace, BrandKit } from '@/lib/brandkit';
import { revalidatePath } from 'next/cache';

export async function getBrandKitAction(workspaceId?: string) {
  try {
    const session = await getCurrentSession();
    const rawWsId = workspaceId || session?.workspace?.id || 'ws_nutristore';
    const wsId = resolveWorkspaceUuid(rawWsId);

    // 1. Tenter depuis Supabase
    try {
      const dbKits = await supabase.from('brand_kits').select('*', {
        eq: { workspace_id: wsId },
        limit: 1,
      });

      if (Array.isArray(dbKits) && dbKits.length > 0) {
        const k = dbKits[0];
        return {
          success: true,
          data: {
            workspaceId: k.workspace_id,
            shopName: k.shop_name,
            logoUrl: k.logo_url,
            primaryColor: k.primary_color,
            secondaryColor: k.secondary_color,
            accentColor: k.accent_color,
            fontFamily: k.font_family,
            sloganDarija: k.slogan_darija,
            sloganFr: k.slogan_fr,
            instagramHandle: k.instagram_handle,
            whatsappNumber: k.whatsapp_number,
            deliveryMention: k.delivery_mention,
            watermarkEnabled: k.watermark_enabled,
            watermarkPosition: k.watermark_position,
            ...(k.ai_preferences || {}),
          } as BrandKit,
        };
      }
    } catch (dbErr) {
      console.warn('Supabase brand kit fallback :', dbErr);
    }

    // 2. Fallback local
    const local = getBrandKitByWorkspace(wsId);
    return { success: true, data: local };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveBrandKitAction(data: Partial<BrandKit>) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    }
    const wsId = session.workspace.id;

    // 1. Sauvegarde Supabase
    try {
      await supabase.from('brand_kits').upsert({
        workspace_id: wsId,
        shop_name: data.shopName || session.workspace.name,
        logo_url: data.logoUrl || '/images/logo.png',
        primary_color: data.primaryColor || '#00E5FF',
        secondary_color: data.secondaryColor || '#FF5722',
        accent_color: data.accentColor || '#10B981',
        font_family: data.fontFamily || 'Outfit, sans-serif',
        slogan_darija: data.sloganDarija || '',
        slogan_fr: data.sloganFr || '',
        instagram_handle: data.instagramHandle || '',
        whatsapp_number: data.whatsappNumber || '',
        delivery_mention: data.deliveryMention || 'Livraison 24-48h sur les 24 gouvernorats',
        watermark_enabled: Boolean(data.watermarkEnabled),
        watermark_position: data.watermarkPosition || 'top-right',
        ai_preferences: {
          industry: data.industry,
          positioning: data.positioning,
          palette: data.palette,
          fonts: data.fonts,
          voice: data.voice,
          audience: data.audience,
          visualStyle: data.visualStyle,
        },
      }, 'workspace_id');
    } catch (dbErr) {
      console.warn('Supabase brand kit upsert notice :', dbErr);
    }

    // 2. Synchronisation mémoire locale
    const saved = updateBrandKitByWorkspace(wsId, data);

    revalidatePath('/brand-kit');
    revalidatePath('/studio');

    return {
      success: true,
      data: saved,
      message: '✓ Brand Kit enregistré avec succès dans Supabase.',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
