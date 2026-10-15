import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { guestStatus, renderGuestMessage, STATUS_LABELS, defaultGuestMessage } from "@/lib/guests";
import type { EventType } from "@/lib/dictionary";
import { toCsv, csvResponse } from "@/lib/csv";
import { siteUrl } from "@/lib/site";

/** Mehmonlar va ularning shaxsiy havolalari — faqat taklifnoma egasiga */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Avval tizimga kiring.", { status: 401 });
  const inv = await prisma.invitation.findUnique({
    where: { id },
    include: { guests: { orderBy: { createdAt: "asc" }, include: { rsvp: { select: { attending: true, count: true } } } } },
  });
  if (!inv || (inv.ownerId !== session.user.id && session.user.role !== "admin")) return new Response("Topilmadi.", { status: 404 });

  const template = inv.guestMessage ?? defaultGuestMessage(inv.eventType as EventType, inv.name1, inv.name2);
  const rows = inv.guests.map((g) => {
    const link = `${siteUrl()}/i/${inv.slug}?g=${g.token}`;
    const st = guestStatus(g);
    return [g.name, link, STATUS_LABELS[st], st === "yes" ? String(g.rsvp?.count ?? 1) : "", renderGuestMessage(template, { name: g.name, link })];
  });
  return csvResponse(toCsv(["Ism", "Shaxsiy havola", "Holat", "Kishi", "Xabar"], rows), `mehmonlar-${inv.slug}.csv`);
}
