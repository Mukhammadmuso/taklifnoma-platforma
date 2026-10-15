/**
 * Foydalanuvchi kiritgan matnni tozalash.
 * React matnni avtomatik ekranlaydi, lekin ma'lumot boshqa joylarda ham (CSV, Telegram, admin)
 * ishlatilishi mumkinligi uchun saqlashdan oldin HTML teglar va boshqaruv belgilari olib tashlanadi.
 */
export function cleanText(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFC")
    .replace(/<[^>]*>/g, "") // HTML teglar
    .replace(/[<>]/g, "") // yolg'iz burchak qavslar
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "") // boshqaruv va yo'nalish belgilari
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

/** CSV/Excel formula in'ektsiyasidan himoya (Faza 3 eksportida ishlatiladi) */
export function csvSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}
