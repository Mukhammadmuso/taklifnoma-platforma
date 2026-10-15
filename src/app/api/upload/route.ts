import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { saveFile } from "@/lib/storage";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

/** Fayl boshidagi "sehrli baytlar" bo'yicha haqiqiy turini tekshirish */
function sniff(buf: Buffer): string | null {
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  return null;
}

const err = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return err(401, "Rasm yuklash uchun tizimga kiring.");
  if (!rateLimit(`upload:${session.user.id}`, 30, 10 * 60_000)) return err(429, "Juda ko'p yuklash. Birozdan so'ng urinib ko'ring.");

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return err(400, "Fayl yuborilmadi.");
  }
  if (!file) return err(400, "Fayl tanlanmagan.");
  if (file.size > MAX_BYTES) return err(413, "Rasm juda katta (3 MB dan oshmasin).");

  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) return err(415, "Faqat JPG, PNG yoki WebP rasm yuklang.");

  const name = `${randomBytes(10).toString("base64url")}.${TYPES[type]}`;
  try {
    const url = await saveFile(session.user.id, name, buf);
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("[upload]", e);
    return err(500, "Rasm saqlanmadi. Qayta urinib ko'ring.");
  }
}
