import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Fayl ombori. Hozir: lokal disk (./uploads). Prod'da serverless hosting bo'lsa,
 * shu ikki funksiyani S3/R2/Supabase Storage'ga almashtirish kifoya — qolgan kod o'zgarmaydi.
 */
const ROOT = path.join(process.cwd(), "uploads");

const SAFE_SEGMENT = /^[A-Za-z0-9_-]{1,64}(\.(webp|jpg|jpeg|png))?$/;

export function isSafePath(segments: string[]) {
  return segments.length === 2 && segments.every((s) => SAFE_SEGMENT.test(s));
}

export async function saveFile(folder: string, name: string, data: Buffer) {
  const dir = path.join(ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), data);
  return `/api/files/${folder}/${name}`;
}

export async function readStoredFile(segments: string[]) {
  if (!isSafePath(segments)) return null;
  try {
    return await readFile(path.join(ROOT, ...segments));
  } catch {
    return null;
  }
}
