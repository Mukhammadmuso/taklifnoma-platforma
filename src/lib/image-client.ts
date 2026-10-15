/**
 * Brauzerda rasmni siqish: uzun tomoni 1600px gacha, WebP (qo'llanmasa JPEG), ~82% sifat.
 * Telefon kamerasidan 5–10 MB rasm odatda 200–400 KB gacha tushadi.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Bu rasm fayli emas.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Rasmni ochib bo'lmadi. Boshqa formatda (JPG/PNG) urinib ko'ring.");
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brauzer rasmni qayta ishlay olmadi.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("Rasmni siqib bo'lmadi.");
  return jpeg;
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append("file", blob, blob.type === "image/webp" ? "rasm.webp" : "rasm.jpg");
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: form });
  } catch {
    throw new Error("Internet bilan aloqa yo'q. Qayta urinib ko'ring.");
  }
  const data = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
  if (!res.ok || !data?.url) throw new Error(data?.error ?? "Rasm yuklanmadi. Qayta urinib ko'ring.");
  return data.url;
}
