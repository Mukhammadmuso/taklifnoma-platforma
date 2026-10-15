import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuestManager } from "@/components/guests/GuestManager";
import { InvitationNav } from "@/components/platform/InvitationNav";
import { prisma } from "@/lib/db";
import type { EventType } from "@/lib/dictionary";
import { isTempSlug } from "@/lib/draft";
import { defaultGuestMessage } from "@/lib/guests";
import { requireUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Mehmonlar — Taklifnoma" };

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/kabinet/t/${id}/mehmonlar`);
  const inv = await prisma.invitation.findUnique({
    where: { id },
    include: {
      guests: { orderBy: { createdAt: "asc" }, include: { rsvp: { select: { attending: true, count: true } } } },
      _count: { select: { rsvps: true } },
    },
  });
  if (!inv || (inv.ownerId !== user.id && user.role !== "admin")) notFound();

  const title = [inv.name1, inv.name2].filter(Boolean).join(" & ") || "Nomsiz qoralama";
  const published = inv.status === "published";
  const tempSlug = isTempSlug(inv.slug);
  const fallback = defaultGuestMessage(inv.eventType as EventType, inv.name1, inv.name2);

  return (
    <main className="p-main">
      <p className="p-muted" style={{ marginBottom: 4 }}>
        <Link href="/kabinet">← Taklifnomalarim</Link>
      </p>
      <h1 className="p-h1">{title}</h1>
      <div style={{ marginTop: 14 }}>
        <InvitationNav id={inv.id} active="guests" guests={inv.guests.length} replies={inv._count.rsvps} />
      </div>

      {!published && (
        <p className="p-alert p-alert--warn" role="status" style={{ marginBottom: 18 }}>
          {tempSlug
            ? "Taklifnomaga hali doimiy havola tanlanmagan va u e’lon qilinmagan. Ro‘yxatni hozir tuzib qo‘yishingiz mumkin, lekin havolalarni e’londan keyin yuboring."
            : "Taklifnoma hali e’lon qilinmagan — mehmon havolani ochsa, sahifa topilmaydi. Havolalarni e’londan keyin yuboring."}{" "}
          <Link href={`/kabinet/t/${inv.id}`}>E’lon qilishga o‘tish</Link>
        </p>
      )}

      <GuestManager
        id={inv.id}
        base={`${siteUrl()}/i/${inv.slug}`}
        ready={published && !tempSlug}
        initialMessage={inv.guestMessage ?? fallback}
        defaultMessage={fallback}
        guests={inv.guests.map((g) => ({
          id: g.id,
          name: g.name,
          token: g.token,
          openedAt: g.openedAt?.toISOString() ?? null,
          rsvp: g.rsvp,
        }))}
      />
    </main>
  );
}
