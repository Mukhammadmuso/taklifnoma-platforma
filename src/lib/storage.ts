import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Fayl ombori.
 * - R2_* (Cloudflare R2 yoki boshqa S3-mos ombor) sozlangan bo'lsa — bulutda saqlanadi (hosting uchun).
 * - Aks holda — lokal disk ./uploads (faqat kompyuterda ishlatish uchun).
 * Ikkala holatda ham URL bir xil: /api/files/{folder}/{name}.
 */
const ROOT = path.join(process.cwd(), "uploads");
const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,64}(\.(webp|jpg|jpeg|png))?$/;

export function isSafePath(segments: string[]) {
  return segments.length === 2 && segments.every((s) => SAFE_SEGMENT.test(s));
}

const r2 = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET
  ? {
      bucket: process.env.R2_BUCKET,
      client: new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
      }),
    }
  : null;

export async function saveFile(folder: string, name: string, data: Buffer) {
  if (r2) {
    await r2.client.send(new PutObjectCommand({ Bucket: r2.bucket, Key: `${folder}/${name}`, Body: data, ContentType: name.endsWith(".png") ? "image/png" : name.endsWith(".webp") ? "image/webp" : "image/jpeg" }));
  } else {
    const dir = path.join(ROOT, folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), data);
  }
  return `/api/files/${folder}/${name}`;
}

export async function readStoredFile(segments: string[]) {
  if (!isSafePath(segments)) return null;
  if (r2) {
    try {
      const res = await r2.client.send(new GetObjectCommand({ Bucket: r2.bucket, Key: segments.join("/") }));
      const bytes = await res.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    } catch {
      return null;
    }
  }
  try {
    return await readFile(path.join(ROOT, ...segments));
  } catch {
    return null;
  }
}
