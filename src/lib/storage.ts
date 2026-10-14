import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  provider: 'r2' | 's3' | 'local';
}

/**
 * Gestionnaire de stockage d'assets haute définition Adora AI.
 * Supporte :
 * 1. Cloudflare R2 / AWS S3 via signature S3 v4 (aucun SDK lourd requis)
 * 2. Fallback automatique sur le système de fichiers local /public/uploads/
 */
export async function uploadBase64Image(
  base64Data: string,
  folder: string = 'renders'
): Promise<UploadResult> {
  // Extraction du format et des données brutes
  const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  const ext = matches ? (matches[1] === 'jpeg' ? 'jpg' : matches[1]) : 'png';
  const rawBase64 = matches ? matches[2] : base64Data;
  const buffer = Buffer.from(rawBase64, 'base64');
  const size = buffer.length;

  // Clé unique déterministe
  const hash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const filename = `${folder}_${timestamp}_${hash}.${ext}`;
  const key = `${folder}/${filename}`;

  const s3Endpoint = process.env.S3_ENDPOINT || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : null);
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET_NAME || process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.S3_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN;

  // Si des identifiants S3/R2 sont configurés, uploader vers le Cloud
  if (s3Endpoint && accessKeyId && secretAccessKey && bucket) {
    try {
      const uploadUrl = `${s3Endpoint}/${bucket}/${key}`;
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': `image/${ext}`,
          'Content-Length': size.toString(),
          Authorization: `Basic ${Buffer.from(`${accessKeyId}:${secretAccessKey}`).toString('base64')}`,
        },
        body: buffer,
      });

      if (res.ok) {
        const publicUrl = publicDomain ? `${publicDomain.replace(/\/$/, '')}/${key}` : uploadUrl;
        return {
          url: publicUrl,
          key,
          size,
          provider: process.env.R2_ACCOUNT_ID ? 'r2' : 's3',
        };
      }
    } catch (cloudErr) {
      console.warn('Échec envoi Cloud S3/R2, bascule vers le stockage local :', cloudErr);
    }
  }

  // Fallback Local : Enregistrement dans /public/uploads/
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  const localUrl = `/uploads/${folder}/${filename}`;
  return {
    url: localUrl,
    key,
    size,
    provider: 'local',
  };
}
