import { NextResponse } from "next/server";
import { WEBHOOKS_READY } from "@/lib/payments";

/**
 * Click webhook (Prepare / Complete) — HALI ULANMAGAN.
 * Yozilganda: sign_string = md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id
 * [+ merchant_prepare_id] + amount + action + sign_time) tekshiriladi, summa PRICE_UZS bilan solishtiriladi,
 * Complete muvaffaqiyatli bo'lsa invitation.isPaid = true. Batafsil: src/lib/payments.ts
 */
export async function POST() {
  if (!WEBHOOKS_READY) {
    return NextResponse.json({ error: -8, error_note: "To'lov qabul qilish hali ulanmagan" }, { status: 501 });
  }
  return NextResponse.json({ error: -8, error_note: "Not implemented" }, { status: 501 });
}
