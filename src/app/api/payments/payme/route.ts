import { NextResponse } from "next/server";
import { WEBHOOKS_READY } from "@/lib/payments";

/**
 * Payme Merchant API (JSON-RPC) — HALI ULANMAGAN.
 * Yozilganda: Authorization: Basic base64("Paycom:" + PAYME_KEY) tekshiriladi; CheckPerformTransaction,
 * CreateTransaction, PerformTransaction (→ invitation.isPaid = true), CancelTransaction, CheckTransaction,
 * GetStatement metodlari Payme hujjatidagi xato kodlari bilan qaytariladi. Batafsil: src/lib/payments.ts
 */
export async function POST() {
  const body = { jsonrpc: "2.0", id: null, error: { code: -32504, message: { uz: "To'lov qabul qilish hali ulanmagan", ru: "Не подключено", en: "Not configured" } } };
  return NextResponse.json(body, { status: WEBHOOKS_READY ? 200 : 501 });
}
