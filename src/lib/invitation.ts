import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { toView, type InvitationView } from "./view";

/**
 * Ochiq sahifa uchun taklifnomani yuklaydi.
 * Faqat e'lon qilinganlari; mehmon tokeni noto'g'ri bo'lsa — umumiy matn (xato ko'rsatilmaydi).
 */
export const getPublicInvitation = cache(async (slug: string, guestToken?: string | null): Promise<InvitationView | null> => {
  const row = await prisma.invitation.findUnique({ where: { slug } });
  if (!row || row.status !== "published") return null;

  let guest: { token: string; name: string } | null = null;
  if (guestToken && /^[A-Za-z0-9_-]{6,32}$/.test(guestToken)) {
    const g = await prisma.guest.findFirst({
      where: { token: guestToken, invitationId: row.id },
      select: { token: true, name: true },
    });
    guest = g ?? null;
  }
  return toView(row, guest);
});
