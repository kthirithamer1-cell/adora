import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const {
      productName = 'Produit',
      captions = {},
      visuals = [],
      whiteLabel = false,
      agencyName = '',
      agencyFooter = '',
    } = await req.json();

    const zip = new JSZip();

    // 1. Structure des dossiers professionnels
    const feedFolder = zip.folder('01_Feed_Instagram_1080x1080');
    const storiesFolder = zip.folder('02_Stories_Reels_9x16');
    const adsFolder = zip.folder('03_Publicites_Facebook_Ads');
    const bannerFolder = zip.folder('04_Banniere_Web_3x2');

    // 2. Fichier texte complet de légendes et hashtags tunisiens
    const brandTitle = whiteLabel && agencyName ? agencyName.toUpperCase() : 'ADORA AI';
    const brandSignature = whiteLabel && agencyFooter
      ? agencyFooter
      : whiteLabel
      ? `Studio de Création Graphique & E-commerce`
      : `Généré par Adora AI — Studio de Contenu Produit E-commerce en Tunisie`;

    const captionContent = `======================================================================
               ${brandTitle} — PACK MARKETING & CONTENU E-COMMERCE
                   PRODUIT : ${productName.toUpperCase()}
======================================================================

1. ACCROCHE INSTAGRAM FEED (FRANÇAIS)
----------------------------------------------------------------------
${captions.instagramFeedFr || 'Découvrez notre nouveauté disponible dès maintenant en boutique !'}

2. ACCROCHE INSTAGRAM FEED (VRAI DARIJA TUNISIEN)
----------------------------------------------------------------------
${captions.instagramFeedDarija || 'Weslet el commande fi boutique mteena ! Khlas and el livrison fi tounes el kol.'}

3. ACCROCHE URGENT STORY / REELS (FLASH PROMO)
----------------------------------------------------------------------
${captions.storyUrgency || '🚨 RUPTURE DE STOCK IMMINENTE ! Cliquez vite pour réserver le vôtre !'}

4. TEXTE PUBLICITAIRE SPONSORISÉ (FACEBOOK & INSTAGRAM ADS)
----------------------------------------------------------------------
${captions.facebookAd || 'Commandez en 1 clic avec livraison rapide 24/48h sur toute la Tunisie !'}

5. MESSAGE DE CLÔTURE DIRECT WHATSAPP
----------------------------------------------------------------------
${captions.whatsappText || 'Salam ! Je souhaite commander ' + productName + '. Pouvez-vous me confirmer le stock svp ?'}

6. HASHTAGS TUNISIENS À FORT ENGAGEMENT
----------------------------------------------------------------------
${Array.isArray(captions.hashtags) ? captions.hashtags.join(' ') : '#tunisie #ecommerce_tunisie #livraison24gouvernorats #venteentunisie'}

======================================================================
${brandSignature}
`;

    zip.file('legendes_et_hashtags_tunisie.txt', captionContent);

    // 3. Ajout des visuels dans les dossiers correspondants
    for (let i = 0; i < visuals.length; i++) {
      const vis = visuals[i];
      const filename = `${vis.title ? vis.title.replace(/\s+/g, '_') : `visuel_${i + 1}`}.png`;

      let targetFolder = feedFolder;
      if (vis.format === '9:16' || vis.category === 'story') {
        targetFolder = storiesFolder;
      } else if (vis.category === 'ads' || vis.category === 'promo') {
        targetFolder = adsFolder;
      } else if (vis.format === '3:2' || vis.category === 'banner') {
        targetFolder = bannerFolder;
      }

      if (vis.imageBase64 && typeof vis.imageBase64 === 'string') {
        const base64Data = vis.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        targetFolder?.file(filename, Buffer.from(base64Data, 'base64'));
      } else if (vis.imageUrl && typeof vis.imageUrl === 'string') {
        if (vis.imageUrl.startsWith('/')) {
          const localPath = path.join(process.cwd(), 'public', vis.imageUrl.replace(/^\//, ''));
          if (fs.existsSync(localPath)) {
            const buf = fs.readFileSync(localPath);
            targetFolder?.file(filename, buf);
          }
        } else if (vis.imageUrl.startsWith('http')) {
          try {
            const fetched = await fetch(vis.imageUrl);
            if (fetched.ok) {
              const arrayBuf = await fetched.arrayBuffer();
              targetFolder?.file(filename, Buffer.from(arrayBuf));
            }
          } catch (fetchErr) {
            console.warn(`Impossible de télécharger ${vis.imageUrl}:`, fetchErr);
          }
        }
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const prefix = whiteLabel && agencyName ? agencyName.replace(/[^a-zA-Z0-9-_]/g, '_') : 'Adora';
    const safeFilename = `Pack_${prefix}_${productName.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('API /api/export-pack error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur lors de la génération du zip' }, { status: 500 });
  }
}
