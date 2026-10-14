'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface VisualAssetPayload {
  formatType: 'story' | 'facebook' | 'instagram_post';
  aspectRatio: string;
  finalImageUrl: string;
  backgroundUrl: string;
  headline: string;
  subheadlineDarija?: string;
  ctaText?: string;
  priceDisplayed?: string;
  badgeText?: string;
}

export async function recordGenerationAction(payload: {
  productId?: string;
  promptUsed: string;
  creditsCost?: number;
  assets: VisualAssetPayload[];
}) {
  try {
    const session = await getCurrentSession();
    const wsId = session.workspace.id;
    const cost = payload.creditsCost || 1;

    // 1. Décrémentation et enregistrement dans Supabase
    let generationId: string | null = null;
    let newBalance = session.workspace.creditsRemaining;

    try {
      // a. Récupérer le solde actuel depuis Supabase
      const wsRows = await supabase.from('workspaces').select('credits_remaining', {
        eq: { id: wsId },
        limit: 1,
      });

      let currentCredits = wsRows?.[0]?.credits_remaining ?? session.workspace.creditsRemaining;
      newBalance = Math.max(0, currentCredits - cost);

      // b. Mettre à jour le solde
      await supabase.from('workspaces').update({ id: wsId }, {
        credits_remaining: newBalance,
      });

      // c. Créer l'entrée de génération
      const genRows = await supabase.from('generations').insert({
        workspace_id: wsId,
        product_id: payload.productId || null,
        prompt_used: payload.promptUsed,
        status: 'completed',
        credits_deducted: cost,
      });

      generationId = genRows?.[0]?.id || null;

      // d. Insérer les formats créatifs
      if (generationId && payload.assets.length > 0) {
        await supabase.from('creative_assets').insert(
          payload.assets.map((a) => ({
            generation_id: generationId,
            product_id: payload.productId || null,
            format_type: a.formatType,
            aspect_ratio: a.aspectRatio,
            final_image_url: a.finalImageUrl,
            background_url: a.backgroundUrl,
            headline: a.headline,
            subheadline_darija: a.subheadlineDarija || '',
            cta_text: a.ctaText || 'Commander',
            price_displayed: a.priceDisplayed || '',
            badge_text: a.badgeText || '',
          }))
        );
      }

      // e. Journal d'audit des crédits
      await supabase.from('credit_transactions').insert({
        workspace_id: wsId,
        type: 'CONSUME',
        amount: -cost,
        balance_after: newBalance,
        reason: 'Génération Studio IA Réseaux Sociaux (3 formats)',
      });
    } catch (dbErr) {
      console.warn('Supabase recordGeneration notice :', dbErr);
    }

    // 2. Synchroniser le solde de la session en mémoire
    if (session.workspace) {
      session.workspace.creditsRemaining = newBalance;
    }

    revalidatePath('/studio');
    revalidatePath('/dashboard');

    return {
      success: true,
      generationId,
      creditsRemaining: newBalance,
      message: `✨ Vos visuels sont enregistrés ! Solde : ${newBalance} crédits`,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
