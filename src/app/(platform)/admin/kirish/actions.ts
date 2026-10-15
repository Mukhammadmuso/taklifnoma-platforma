"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";

export type AdminKeyState = { error?: string };

/** ADMIN_KEY (.env) to'g'ri kiritilsa, joriy hisob admin bo'ladi */
export async function adminKeyLogin(_prev: AdminKeyState, form: FormData): Promise<AdminKeyState> {
  const user = await requireUser("/admin/kirish");
  const expected = process.env.ADMIN_KEY ?? "";
  if (expected.length < 16) return { error: "ADMIN_KEY .env faylida sozlanmagan (kamida 16 belgi)." };
  if (!rateLimit(`adminkey:${clientIp(await headers())}`, 5, 600_000)) return { error: "Juda ko‘p urinish. 10 daqiqadan so‘ng qayta urinib ko‘ring." };
  const given = Buffer.from(String(form.get("key") ?? ""));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return { error: "Kalit noto‘g‘ri." };
  await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
  redirect("/admin");
}
