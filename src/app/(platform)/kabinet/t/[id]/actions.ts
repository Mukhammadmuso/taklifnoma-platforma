"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { GUEST_LIMIT, GUEST_NAME_MAX, MESSAGE_MAX, parseGuestList } from "@/lib/guests";
import { rateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/sanitize";
import { requireUser } from "@/lib/session";
import { guestToken } from "@/lib/tokens";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Faqat egasi (yoki admin) o'z taklifnomasining mehmon va javoblariga tegadi */
async function own(id: string) {
  const user = await requireUser();
  const inv = await prisma.invitation.findUnique({ where: { id }, select: { id: true, ownerId: true } });
  if (!inv || (inv.ownerId !== user.id && user.role !== "admin")) return null;
  return { inv, user };
}

const refresh = (id: string) => {
  revalidatePath(`/kabinet/t/${id}/mehmonlar`);
  revalidatePath(`/kabinet/t/${id}/javoblar`);
  revalidatePath("/kabinet");
};

const NOT_FOUND = "Taklifnoma topilmadi yoki sizga tegishli emas.";

export async function addGuests(id: string, text: string): Promise<Result<{ added: number; duplicates: string[]; overLimit: number }>> {
  const ctx = await own(id);
  if (!ctx) return { ok: false, error: NOT_FOUND };
  if (typeof text !== "string" || text.length > 60_000) return { ok: false, error: "Ro‘yxat juda uzun. Bir martada 1000 tagacha ism qo‘shing." };
  if (!rateLimit(`guests:${ctx.user.id}`, 20, 60_000)) return { ok: false, error: "Juda ko‘p urinish. Bir daqiqadan so‘ng qayta urinib ko‘ring." };

  const existing = await prisma.guest.findMany({ where: { invitationId: id }, select: { name: true } });
  const { names, duplicates } = parseGuestList(text, existing.map((g) => g.name));
  if (!names.length && !duplicates.length) return { ok: false, error: "Ro‘yxatda ism topilmadi. Har qatorga bitta ism yozing." };

  const room = Math.max(0, GUEST_LIMIT - existing.length);
  const toAdd = names.slice(0, room);
  try {
    if (toAdd.length) {
      await prisma.guest.createMany({ data: toAdd.map((name) => ({ invitationId: id, name, token: guestToken() })) });
    }
  } catch (e) {
    console.error("[addGuests]", e);
    return { ok: false, error: "Mehmonlar saqlanmadi. Qayta urinib ko‘ring." };
  }
  refresh(id);
  return { ok: true, added: toAdd.length, duplicates, overLimit: names.length - toAdd.length };
}

export async function renameGuest(id: string, guestId: string, name: string): Promise<Result<{ name: string }>> {
  const ctx = await own(id);
  if (!ctx) return { ok: false, error: NOT_FOUND };
  const clean = cleanText(name, GUEST_NAME_MAX);
  if (!clean) return { ok: false, error: "Ism bo‘sh bo‘lmasin." };
  const res = await prisma.guest.updateMany({ where: { id: guestId, invitationId: id }, data: { name: clean } });
  if (!res.count) return { ok: false, error: "Mehmon topilmadi." };
  refresh(id);
  return { ok: true, name: clean };
}

export async function deleteGuest(id: string, guestId: string): Promise<Result> {
  const ctx = await own(id);
  if (!ctx) return { ok: false, error: NOT_FOUND };
  // Javobi saqlanib qoladi (guestId bo'shatiladi) — egasi javobni alohida o'chirishi mumkin
  const res = await prisma.guest.deleteMany({ where: { id: guestId, invitationId: id } });
  if (!res.count) return { ok: false, error: "Mehmon topilmadi." };
  refresh(id);
  return { ok: true };
}

export async function saveGuestMessage(id: string, message: string): Promise<Result> {
  const ctx = await own(id);
  if (!ctx) return { ok: false, error: NOT_FOUND };
  if (typeof message !== "string") return { ok: false, error: "Xabar noto‘g‘ri." };
  // Satr ko'chishlari saqlanadi, faqat teglar va boshqaruv belgilari olinadi
  const clean = cleanText(message, MESSAGE_MAX);
  await prisma.invitation.update({ where: { id }, data: { guestMessage: clean || null } });
  revalidatePath(`/kabinet/t/${id}/mehmonlar`);
  return { ok: true };
}

export async function deleteRsvp(id: string, rsvpId: string): Promise<Result> {
  const ctx = await own(id);
  if (!ctx) return { ok: false, error: NOT_FOUND };
  const rsvp = await prisma.rsvp.findFirst({ where: { id: rsvpId, invitationId: id }, select: { id: true, guestId: true } });
  if (!rsvp) return { ok: false, error: "Javob topilmadi." };
  await prisma.$transaction([
    prisma.rsvp.delete({ where: { id: rsvp.id } }),
    ...(rsvp.guestId ? [prisma.guest.update({ where: { id: rsvp.guestId }, data: { respondedAt: null } })] : []),
  ]);
  refresh(id);
  return { ok: true };
}
