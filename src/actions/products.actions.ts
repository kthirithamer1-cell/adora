'use server';

import { supabase } from '@/lib/supabase';
import { getCurrentSession } from '@/lib/auth';
import { getCatalogByWorkspace, addProductToCatalog, deleteProductFromCatalog } from '@/lib/brandkit';
import { revalidatePath } from 'next/cache';

export async function getProductsAction(workspaceId?: string) {
  try {
    const session = await getCurrentSession();
    const wsId = workspaceId || session.workspace.id;

    // 1. Tenter la lecture depuis Supabase
    try {
      const dbProducts = await supabase.from('products').select('*', {
        eq: { workspace_id: wsId },
        order: 'created_at.desc',
      });

      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        return {
          success: true,
          data: dbProducts.map((p) => ({
            id: p.id,
            workspaceId: p.workspace_id,
            name: p.name,
            brand: session.workspace.name,
            category: p.category,
            originalImageUrl: p.original_image_url,
            cutoutImageUrl: p.cutout_image_url || p.original_image_url,
            priceTND: Number(p.price_tnd) || 0,
            descriptionFr: p.description_fr || '',
            descriptionDarija: p.description_darija || '',
            badgeId: p.badge_label || 'livraison',
            createdAt: p.created_at,
          })),
        };
      }
    } catch (dbErr) {
      console.warn('Supabase fallback vers cache local catalogue :', dbErr);
    }

    // 2. Fallback local / mémoire
    const local = getCatalogByWorkspace(wsId);
    return { success: true, data: local };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createProductAction(data: {
  name: string;
  category?: string;
  priceTND: number;
  originalImageUrl: string;
  cutoutImageUrl?: string;
  descriptionFr?: string;
  descriptionDarija?: string;
  badgeLabel?: string;
}) {
  try {
    const session = await getCurrentSession();
    const wsId = session.workspace.id;

    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Le nom du produit est obligatoire.' };
    }

    // 1. Sauvegarde dans Supabase
    let createdProduct = null;
    try {
      const inserted = await supabase.from('products').insert({
        workspace_id: wsId,
        name: data.name.trim(),
        category: data.category || 'general',
        price_tnd: Number(data.priceTND) || 49,
        original_image_url: data.originalImageUrl,
        cutout_image_url: data.cutoutImageUrl || data.originalImageUrl,
        description_fr: data.descriptionFr || '',
        description_darija: data.descriptionDarija || '',
        badge_label: data.badgeLabel || 'Nouveauté',
        is_active: true,
      });

      if (Array.isArray(inserted) && inserted.length > 0) {
        createdProduct = inserted[0];
      }
    } catch (dbErr) {
      console.warn('Supabase insert notice :', dbErr);
    }

    // 2. Synchronisation mémoire locale
    const local = addProductToCatalog(wsId, {
      name: data.name.trim(),
      brand: session.workspace.name,
      category: data.category || 'general',
      originalImageUrl: data.originalImageUrl,
      cutoutImageUrl: data.cutoutImageUrl || data.originalImageUrl,
      priceTND: Number(data.priceTND) || 49,
      descriptionFr: data.descriptionFr || '',
      descriptionDarija: data.descriptionDarija || '',
      badgeId: data.badgeLabel || 'livraison',
    });

    revalidatePath('/brand-kit');
    revalidatePath('/studio');

    return {
      success: true,
      data: createdProduct || local,
      message: '✓ Produit ajouté au catalogue avec succès.',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const session = await getCurrentSession();
    const wsId = session.workspace.id;

    try {
      await supabase.from('products').delete({ id: productId, workspace_id: wsId });
    } catch (dbErr) {
      console.warn('Supabase delete notice :', dbErr);
    }

    deleteProductFromCatalog(wsId, productId);

    revalidatePath('/brand-kit');
    revalidatePath('/studio');

    return { success: true, message: '✓ Produit retiré du catalogue.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
