'use server';

import { getCurrentSession, savePersistedStore } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
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
    if (!session) {
      return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    }
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
    revalidatePath('/studio');

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

export async function ensureSampleImagesAction() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const artifactDir = 'C:\\Users\\MEDIA INFOPLUS\\.gemini\\antigravity-ide\\brain\\550fa523-2c99-427c-b2a9-abdfd965f84f';
    const publicDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const currentArtifactDir = 'C:\\Users\\MEDIA INFOPLUS\\.gemini\\antigravity-ide\\brain\\f3c8488d-4c5e-4613-8683-e6d28b42c34c';
    const pairs = [
      { dir: artifactDir, src: 'sample_sneaker_panda_1792504407509.jpg', dest: 'sample_sneaker_panda.jpg' },
      { dir: artifactDir, src: 'sample_perfume_amber_1792504426581.jpg', dest: 'sample_perfume_amber.jpg' },
      { dir: artifactDir, src: 'sample_cream_jar_1792504447613.jpg', dest: 'sample_cream_jar.jpg' },
      { dir: currentArtifactDir, src: 'carousel_slide1_rose_1793181410324.jpg', dest: 'carousel_bg_slide1.jpg' },
      { dir: currentArtifactDir, src: 'carousel_slide2_petals_1793181453004.jpg', dest: 'carousel_bg_slide2.jpg' },
      { dir: currentArtifactDir, src: 'carousel_slide3_stone_1793181473871.jpg', dest: 'carousel_bg_slide3.jpg' },
    ];
    for (const p of pairs) {
      const srcPath = path.join(p.dir, p.src);
      const destPath = path.join(publicDir, p.dest);
      if (fs.existsSync(srcPath)) {
        try {
          fs.copyFileSync(srcPath, destPath);
        } catch {}
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
