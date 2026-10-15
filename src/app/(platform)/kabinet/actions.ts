"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { cleanText } from "@/lib/sanitize";
import { requireUser } from "@/lib/session";
import { auth } from "@/auth";
import { createAnonymousUser } from "@/lib/anon";
import { EVENT_TYPES, type EventType } from "@/lib/dictionary";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { defaultDate, draftSchema, draftToRow, findIssues, isTempSlug, rowToDraft, slugProblem, type Draft } from "@/lib/draft";
import { fromTashkentLocal } from "@/lib/datetime";
import { getTemplateMeta } from "@/templates/registry";
import { disabledTemplateIds, enabledTemplates } from "@/lib/template-settings";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const tempSlug = () => `q-${randomBytes(6).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "x")}`;

/** Faqat egasi (yoki admin) o'z taklifnomasiga tegishi mumkin */
async function ownInvitation(id: string) {
  const user = await requireUser();
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || (inv.ownerId !== user.id && user.role !== "admin")) return null;
  return inv;
}

/** Saqlashdan oldin barcha matnlarni tozalash */
function cleanDraft(d: Draft): Draft {
  const c = (s: string, n: number) => cleanText(s, n);
  return {
    ...d,
    name1: c(d.name1, 60),
    name2: c(d.name2, 60),
    subtitle: c(d.subtitle, 1200),
    hosts: c(d.hosts, 160),
    parents1: c(d.parents1, 160),
    parents2: c(d.parents2, 160),
    quote: c(d.quote, 120),
    venueHall: c(d.venueHall, 80),
    landmark: c(d.landmark, 200),
    venueName: c(d.venueName, 120),
    address: c(d.address, 300),
    googleMapsUrl: c(d.googleMapsUrl, 600),
    yandexMapsUrl: c(d.yandexMapsUrl, 600),
    program: d.program.map((p) => ({ time: c(p.time, 10), title: c(p.title, 80), description: c(p.description ?? "", 200), icon: /^[a-z-]{2,20}$/.test(p.icon ?? "") ? p.icon : undefined })),
    notes: d.notes.map((n) => c(n, 240)),
    giftTitle: c(d.giftTitle, 40),
    giftText: c(d.giftText, 600),
    telegramUsername: c(d.telegramUsername, 40),
    phone: c(d.phone, 30),
    theme: c(d.theme, 20).replace(/[^a-z0-9-]/g, ""),
  };
}

export async function createInvitation(form?: FormData) {
  const user = await requireUser();
  const requested = String(form?.get("templateId") ?? "");
  const list = await enabledTemplates();
  const template = list.find((t) => t.id === requested) ?? list[0];
  const { date, time } = defaultDate();
  const inv = await prisma.invitation.create({
    data: {
      ownerId: user.id,
      slug: tempSlug(),
      templateId: template.id,
      eventType: template.supportedEventTypes[0],
      name1: "",
      eventDateTime: fromTashkentLocal(`${date}T${time}`),
      musicId: null,
    },
  });
  redirect(`/kabinet/t/${inv.id}`);
}

export async function saveDraft(id: string, input: Draft): Promise<Result<{ savedAt: string }>> {
  const inv = await ownInvitation(id);
  if (!inv) return { ok: false, error: "Taklifnoma topilmadi yoki sizga tegishli emas." };
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ba'zi maydonlar juda uzun yoki noto'g'ri. Tekshirib chiqing." };
  if (!getTemplateMeta(parsed.data.templateId)) return { ok: false, error: "Tanlangan dizayn topilmadi." };
  if (parsed.data.templateId !== inv.templateId && (await disabledTemplateIds()).has(parsed.data.templateId)) {
    return { ok: false, error: "Bu dizayn vaqtincha mavjud emas. Boshqasini tanlang." };
  }
  const row = draftToRow(cleanDraft(parsed.data as Draft));
  if (Number.isNaN(row.eventDateTime.getTime())) return { ok: false, error: "Sana yoki vaqt noto'g'ri." };
  try {
    const saved = await prisma.invitation.update({ where: { id }, data: row });
    if (inv.status === "published") revalidatePath(`/i/${inv.slug}`);
    return { ok: true, savedAt: saved.updatedAt.toISOString() };
  } catch (e) {
    console.error("[saveDraft]", e);
    return { ok: false, error: "Saqlanmadi. Internetni tekshirib, qayta urinib ko'ring." };
  }
}

export async function checkSlug(id: string, slug: string): Promise<Result> {
  const user = await requireUser();
  const problem = slugProblem(slug);
  if (problem) return { ok: false, error: problem };
  const taken = await prisma.invitation.findUnique({ where: { slug }, select: { id: true, ownerId: true } });
  if (taken && taken.id !== id) return { ok: false, error: "Bu havola band. Boshqasini tanlang." };
  void user;
  return { ok: true };
}

export async function setSlug(id: string, slug: string): Promise<Result<{ slug: string }>> {
  const inv = await ownInvitation(id);
  if (!inv) return { ok: false, error: "Taklifnoma topilmadi." };
  const check = await checkSlug(id, slug);
  if (!check.ok) return check;
  try {
    await prisma.invitation.update({ where: { id }, data: { slug } });
  } catch {
    return { ok: false, error: "Bu havola hozirgina band qilindi. Boshqasini tanlang." };
  }
  if (inv.status === "published") revalidatePath(`/i/${inv.slug}`);
  return { ok: true, slug };
}

export async function publishInvitation(id: string): Promise<Result<{ slug: string }>> {
  const inv = await ownInvitation(id);
  if (!inv) return { ok: false, error: "Taklifnoma topilmadi." };
  const issues = findIssues(rowToDraft(inv), inv.slug);
  if (issues.length) return { ok: false, error: issues.map((i) => i.message).join(" ") };
  if (isTempSlug(inv.slug)) return { ok: false, error: "Avval havola tanlang." };
  await prisma.invitation.update({ where: { id }, data: { status: "published" } });
  revalidatePath("/kabinet");
  return { ok: true, slug: inv.slug };
}

export async function unpublishInvitation(id: string): Promise<Result> {
  const inv = await ownInvitation(id);
  if (!inv) return { ok: false, error: "Taklifnoma topilmadi." };
  await prisma.invitation.update({ where: { id }, data: { status: "draft" } });
  revalidatePath(`/i/${inv.slug}`);
  revalidatePath("/kabinet");
  return { ok: true };
}

export async function duplicateInvitation(form: FormData) {
  const inv = await ownInvitation(String(form.get("id")));
  if (!inv) return;
  const { id: _id, createdAt: _c, updatedAt: _u, slug: _s, status: _st, isPaid: _p, program, notes, gallery, ...rest } = inv;
  const copy = await prisma.invitation.create({
    data: {
      ...rest,
      program: program ?? [],
      notes: notes ?? [],
      gallery: gallery ?? [],
      slug: tempSlug(),
      status: "draft",
      isPaid: false,
      name1: inv.name1,
    },
  });
  revalidatePath("/kabinet");
  redirect(`/kabinet/t/${copy.id}`);
}

export async function deleteInvitation(form: FormData) {
  const inv = await ownInvitation(String(form.get("id")));
  if (!inv) return;
  await prisma.invitation.delete({ where: { id: inv.id } });
  revalidatePath("/kabinet");
  if (inv.status === "published") revalidatePath(`/i/${inv.slug}`);
}

/**
 * Tezkor boshlash: namunadan kelgan mijoz dizayn, tadbir turi, ismlar va sanani bitta formada kiritadi.
 * Ro'yxatdan o'tish shart emas — birinchi marta yaratganda yashirin hisob ochiladi.
 */
export async function quickStart(form: FormData) {
  const list = await enabledTemplates();
  const template = list.find((t) => t.id === form.get("templateId")) ?? list[0];
  const rawType = String(form.get("eventType") ?? "");
  const eventType: EventType =
    (EVENT_TYPES as readonly string[]).includes(rawType) && template.supportedEventTypes.includes(rawType as EventType)
      ? (rawType as EventType)
      : template.supportedEventTypes[0];
  const name1 = cleanText(form.get("name1"), 60);
  const name2 = cleanText(form.get("name2"), 60);
  const fallback = defaultDate();
  const rawDate = String(form.get("date") ?? "");
  const rawTime = String(form.get("time") ?? "");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : fallback.date;
  const time = /^\d{2}:\d{2}$/.test(rawTime) ? rawTime : fallback.time;

  // Ro'yxatdan o'tish yo'q: hisob bo'lmasa shu yerning o'zida yashirin hisob ochiladi
  const session = await auth();
  let userId = session?.user?.id;
  if (!userId) {
    if (!rateLimit(`anon:${clientIp(await headers())}`, 30, 3_600_000)) redirect("/kabinet/yangi");
    userId = (await createAnonymousUser()).id;
  }
  if (!rateLimit(`quick:${userId}`, 10, 60_000)) redirect("/kabinet");

  let when = fromTashkentLocal(`${date}T${time}`);
  if (Number.isNaN(when.getTime())) when = fromTashkentLocal(`${fallback.date}T${fallback.time}`);
  const inv = await prisma.invitation.create({
    data: {
      ownerId: userId,
      slug: tempSlug(),
      templateId: template.id,
      eventType,
      name1,
      name2: name2 || null,
      eventDateTime: when,
      musicId: null,
    },
  });
  redirect(`/kabinet/t/${inv.id}`);
}
