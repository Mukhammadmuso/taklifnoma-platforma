import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RsvpTable } from "@/components/guests/RsvpTable";
import { InvitationNav } from "@/components/platform/InvitationNav";
import { prisma } from "@/lib/db";
import { pad2, tashkentParts } from "@/lib/datetime";
import { requireUser } from "@/lib/session";
import s from "@/components/guests/guests.module.css";

export const metadata: Metadata = { title: "Javoblar — Taklifnoma" };

function stamp(d: Date) {
  const p = tashkentParts(d);
  return `${pad2(p.day)}.${pad2(p.month)}.${p.year}, ${pad2(p.hour)}:${pad2(p.minute)}`;
}

export default async function RepliesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/kabinet/t/${id}/javoblar`);
  const inv = await prisma.invitation.findUnique({
    where: { id },
    include: {
      rsvps: { orderBy: { updatedAt: "desc" }, include: { guest: { select: { name: true } } } },
      _count: { select: { guests: true } },
    },
  });
  if (!inv || (inv.ownerId !== user.id && user.role !== "admin")) notFound();

  const yes = inv.rsvps.filter((r) => r.attending);
  const people = yes.reduce((n, r) => n + r.count, 0);
  const no = inv.rsvps.length - yes.length;
  const waiting = inv._count.guests ? await prisma.guest.count({ where: { invitationId: id, rsvp: null } }) : 0;
  const title = [inv.name1, inv.name2].filter(Boolean).join(" & ") || "Nomsiz qoralama";

  return (
    <main className="p-main">
      <p className="p-muted" style={{ marginBottom: 4 }}>
        <Link href="/kabinet">← Taklifnomalarim</Link>
      </p>
      <h1 className="p-h1">{title}</h1>
      <div style={{ marginTop: 14 }}>
        <InvitationNav id={inv.id} active="replies" guests={inv._count.guests} replies={inv.rsvps.length} />
      </div>

      {!inv.rsvpEnabled && (
        <p className="p-alert p-alert--info" style={{ marginBottom: 18 }}>
          Javob formasi o‘chirilgan — mehmonlar sahifada formani ko‘rmaydi. <Link href={`/kabinet/t/${inv.id}`}>Yoqish</Link>
        </p>
      )}

      <div className={s.stats}>
        <p className={`p-card ${s.stat} ${s.statPrimary}`}>
          <span className={s.statNum}>{people}</span>
          <span className={s.statLabel}>kishi keladi</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{yes.length}</span>
          <span className={s.statLabel}>«Kelaman» javobi</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{no}</span>
          <span className={s.statLabel}>kela olmaydi</span>
        </p>
        {inv._count.guests > 0 && (
          <p className={`p-card ${s.stat}`}>
            <span className={s.statNum}>{waiting}</span>
            <span className={s.statLabel}>
              mehmon javob bermagan · <Link href={`/kabinet/t/${inv.id}/mehmonlar`}>ro‘yxat</Link>
            </span>
          </p>
        )}
      </div>

      <RsvpTable
        id={inv.id}
        rows={inv.rsvps.map((r) => ({
          id: r.id,
          name: r.name,
          attending: r.attending,
          count: r.count,
          wish: r.wish,
          at: stamp(r.updatedAt),
          guestName: r.guest?.name ?? null,
        }))}
      />
    </main>
  );
}
