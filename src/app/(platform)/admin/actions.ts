"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getTemplateMeta } from "@/templates/registry";

type Result = { ok: true } | { ok: false; error: string };

/** «Namuna» belgisi: to'lov tasdiqlangach (hozircha qo'lda) olib tashlanadi */
export async function setPaid(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const paid = form.get("paid") === "1";
  const inv = await prisma.invitation.update({ where: { id }, data: { isPaid: paid }, select: { slug: true } }).catch(() => null);
  if (inv) revalidatePath(`/i/${inv.slug}`);
  revalidatePath("/admin");
}

export async function setTemplateEnabled(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!getTemplateMeta(id)) return;
  const enabled = form.get("enabled") === "1";
  await prisma.templateSetting.upsert({ where: { id }, create: { id, enabled }, update: { enabled } });
  revalidatePath("/admin");
  revalidatePath("/");
}

/** Qoidabuzar taklifnomani e'londan olish (havola ishlamay qoladi, ma'lumot saqlanadi) */
export async function adminUnpublish(id: string): Promise<Result> {
  await requireAdmin();
  const inv = await prisma.invitation.update({ where: { id }, data: { status: "draft" }, select: { slug: true } }).catch(() => null);
  if (!inv) return { ok: false, error: "Taklifnoma topilmadi." };
  revalidatePath(`/i/${inv.slug}`);
  revalidatePath("/admin");
  return { ok: true };
}
