import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { EVENT_LABELS, type EventType } from "@/lib/dictionary";
import { tashkentParts, pad2 } from "@/lib/datetime";
import { isTempSlug } from "@/lib/draft";
import { getTemplateMeta } from "@/templates/registry";
import { createInvitation } from "./actions";
import { CardActions } from "./CardActions";
import { AccessKey } from "@/components/platform/AccessKey";
import { ensureAccessKey } from "@/lib/anon";
import { siteUrl } from "@/lib/site";
import s from "./kabinet.module.css";

export const metadata: Metadata = { title: "Taklifnomalarim — Taklifnoma" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ kalit?: string }> }) {
  const user = await requireUser("/kabinet");
  const { kalit } = await searchParams;
  const accessKey = await ensureAccessKey(user.id);
  const list = await prisma.invitation.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { rsvps: true, guests: true } } },
  });

  return (
    <main className="p-main">
      {kalit === "xato" && (
        <p className="p-alert p-alert--error" role="alert" style={{ marginBottom: 18 }}>
          Bu tahrirlash havolasi noto‘g‘ri yoki eskirgan. Havolani to‘liq nusxalaganingizni tekshiring.
        </p>
      )}
      <div className={s.head}>
        <div>
          <h1 className="p-h1">Taklifnomalarim</h1>
          <p className="p-lead">
            {list.length ? `${list.length} ta taklifnoma` : "Hali taklifnoma yo‘q — birinchisini yarating."}
          </p>
        </div>
        <form action={createInvitation}>
          <button type="submit" className="p-btn p-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Yangi taklifnoma
          </button>
        </form>
      </div>

      {list.length === 0 ? (
        <div className={`p-card ${s.empty}`}>
          <p className="p-h2">Bir necha daqiqada tayyor</p>
          <ol className={s.steps}>
            <li>Tadbir turi va dizaynni tanlang</li>
            <li>Ismlar, sana va manzilni yozing — o‘ng tomonda telefondagi ko‘rinishi darhol chiqadi</li>
            <li>Havolani mehmonlarga yuboring va javoblarni kuzating</li>
          </ol>
          <form action={createInvitation}>
            <button type="submit" className="p-btn p-btn--primary">
              Boshlash
            </button>
          </form>
        </div>
      ) : (
        <ul className={s.grid}>
          {list.map((inv) => {
            const meta = getTemplateMeta(inv.templateId);
            const p = tashkentParts(inv.eventDateTime);
            const title = [inv.name1, inv.name2].filter(Boolean).join(" & ") || "Nomsiz qoralama";
            const published = inv.status === "published";
            return (
              <li key={inv.id} className={`p-card ${s.card}`}>
                <div className={s.swatch} style={{ background: meta?.palette.ground ?? "#ddd" }} aria-hidden>
                  <span style={{ background: meta?.palette.bg }} />
                  <span style={{ background: meta?.palette.accent }} />
                  <span style={{ background: meta?.palette.accent2 }} />
                </div>
                <div className={s.body}>
                  <div className="p-row" style={{ justifyContent: "space-between" }}>
                    <span className={`p-badge ${published ? "p-badge--ok" : "p-badge--draft"}`}>
                      {published ? "E’lon qilingan" : "Qoralama"}
                    </span>
                    {!inv.isPaid && published && (
                      <Link href={`/kabinet/t/${inv.id}/tolov`} className="p-badge" title="Belgini olib tashlash">
                        «Namuna» belgisi bor
                      </Link>
                    )}
                  </div>
                  <h2 className={s.title}>{title}</h2>
                  <p className="p-muted">
                    {EVENT_LABELS[inv.eventType as EventType] ?? inv.eventType} · {meta?.name ?? inv.templateId}
                  </p>
                  <p className="p-muted">
                    {pad2(p.day)}.{pad2(p.month)}.{p.year}, {pad2(p.hour)}:{pad2(p.minute)}
                  </p>
                  {published && (
                    <p className={s.link}>
                      /i/{inv.slug} · <strong>{inv._count.rsvps}</strong> ta javob
                    </p>
                  )}
                  {!published && !isTempSlug(inv.slug) && <p className={s.link}>/i/{inv.slug}</p>}
                </div>
                <div className={s.actions}>
                  <Link href={`/kabinet/t/${inv.id}`} className="p-btn p-btn--sm">
                    Tahrirlash
                  </Link>
                  {published && (
                    <a href={`/i/${inv.slug}`} target="_blank" rel="noopener" className="p-btn p-btn--sm p-btn--ghost">
                      Ochish
                    </a>
                  )}
                  <Link href={`/kabinet/t/${inv.id}/mehmonlar`} className="p-btn p-btn--sm p-btn--ghost">
                    Mehmonlar{inv._count.guests ? ` (${inv._count.guests})` : ""}
                  </Link>
                  <Link href={`/kabinet/t/${inv.id}/javoblar`} className="p-btn p-btn--sm p-btn--ghost">
                    Javoblar{inv._count.rsvps ? ` (${inv._count.rsvps})` : ""}
                  </Link>
                  <CardActions id={inv.id} title={title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > 0 && <AccessKey link={`${siteUrl()}/kalit/${accessKey}`} />}
    </main>
  );
}
