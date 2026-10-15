import "server-only";

/**
 * TO'LOV (Click / Payme) — TAYYORGARLIK.
 *
 * Kalitlar faqat muhit o'zgaruvchilarida (.env), kodga yozilmaydi:
 *   PRICE_UZS            — «Namuna» belgisini olib tashlash narxi, so'mda (bo'lmasa narx ko'rsatilmaydi)
 *   CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY
 *   PAYME_MERCHANT_ID, PAYME_KEY
 *
 * Hozirgi holat: to'lov tugmalari ATAYLAB yashirilgan. Sabab — to'lov tizimi pul olgandan keyin
 * bizga xabar yuboradi (webhook), va shu xabar asosida taklifnoma «to'landi» deb belgilanadi.
 * Webhook'lar (src/app/api/payments/*) hali to'liq yozilmagan va sandbox'da sinalmagan.
 * Ularsiz tugmani ochsak, mijoz pul to'laydi-yu, belgi olib tashlanmaydi.
 *
 * Ulash tartibi:
 *   1) Click va Payme'da merchant sifatida ro'yxatdan o'tish, test kalitlarini olish
 *   2) api/payments/click (Prepare/Complete, sign_string MD5 tekshiruvi) va
 *      api/payments/payme (JSON-RPC: CheckPerformTransaction, CreateTransaction, PerformTransaction,
 *      CancelTransaction, CheckTransaction, GetStatement; Basic auth) ni yozish va sandbox'da sinash
 *   3) Payment jadvalini qo'shish (tranzaksiyalarni saqlash, takroriy xabarlardan himoya)
 *   4) WEBHOOKS_READY ni true qilish
 * Shu vaqtgacha «Namuna» belgisi admin panelidan qo'lda olib tashlanadi.
 */
export const WEBHOOKS_READY = false;

export type Provider = "click" | "payme";

export function priceUzs(): number | null {
  const n = Number(process.env.PRICE_UZS);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export function providerConfigured(p: Provider): boolean {
  if (p === "click") return !!(process.env.CLICK_SERVICE_ID && process.env.CLICK_MERCHANT_ID && process.env.CLICK_SECRET_KEY);
  return !!(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY);
}

/** To'lov tugmalarini ko'rsatish mumkinmi */
export function checkoutAvailable(p: Provider): boolean {
  return WEBHOOKS_READY && priceUzs() !== null && providerConfigured(p);
}

/** Click to'lov sahifasi (my.click.uz/services/pay) */
export function clickCheckoutUrl(invitationId: string, returnUrl: string): string | null {
  const price = priceUzs();
  if (!checkoutAvailable("click") || !price) return null;
  const q = new URLSearchParams({
    service_id: process.env.CLICK_SERVICE_ID!,
    merchant_id: process.env.CLICK_MERCHANT_ID!,
    amount: String(price),
    transaction_param: invitationId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${q}`;
}

/** Payme checkout: parametrlar base64 ichida, summa tiyinda */
export function paymeCheckoutUrl(invitationId: string, returnUrl: string): string | null {
  const price = priceUzs();
  if (!checkoutAvailable("payme") || !price) return null;
  const params = `m=${process.env.PAYME_MERCHANT_ID};ac.invitation_id=${invitationId};a=${price * 100};c=${returnUrl}`;
  return `https://checkout.paycom.uz/${Buffer.from(params).toString("base64")}`;
}
