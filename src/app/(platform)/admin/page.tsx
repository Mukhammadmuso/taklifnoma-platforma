import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pad2, tashkentParts } from "@/lib/datetime";
import { EVENT_LABELS, type EventType } from "@/lib/dictionary";
import { isTempSlug } from "@/lib/draft";
import { requireAdmin } from "@/lib/session";
import { disabledTemplateIds } from "@/lib/template-settings";
import { getTemplateMeta, TEMPLATES } from "@/templates/registry";
import { setPaid, setTemplateEnabled } from "./actions";
import { UnpublishButton } from "./UnpublishButton";
import s from "@/components/guests/guests.module.css";
import a from "./admin.module.css";

export const metadata: Metadata = { title: "Admin — Taklifnoma", robots: { index: false } };

const day = (d: Date) => {
  const p = tashkentParts(d);
  return `${pad2(p.day)}.${pad2(p.month)}.${p.year}`;
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; holat?: string }> }) {
  await requireAdmin();
  const { q = "", holat = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  const weekAgo = new Date(Date.now() - 7 * 86400_000);

  const [users, total, published, paid, recent, guests, rsvpYes, byTemplate, off] = await Promise.all([
    prisma.user.count(),
    prisma.invitation.count(),
    prisma.invitation.count({ where: { status: "published" } }),
    prisma.invitation.count({ where: { isPaid: true } }),
    prisma.invitation.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.guest.count(),
    prisma.rsvp.aggregate({ where: { attending: true }, _sum: { count: true }, _count: true }),
    prisma.invitation.groupBy({ by: ["templateId"], _count: { _all: true } }),
    disabledTemplateIds(),
  ]);
  const usage = new Map(byTemplate.map((r) => [r.templateId, r._count._all]));

  const where = {
    ...(holat === "published" ? { status: "published" } : holat === "draft" ? { status: "draft" } : {}),
    ...(holat === "unpaid" ? { status: "published", isPaid: false } : {}),
    ...(query
      ? {
          OR: [
            { slug: { contains: query.toLowerCase() } },
            { name1: { contains: query } },
            { name2: { contains: query } },
            { owner: { email: { contains: query.toLowerCase() } } },
          ],
        }
      : {}),
  };
  const list = await prisma.invitation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { owner: { select: { email: true } }, _count: { select: { rsvps: true, guests: true } } },
  });

  return (
    <main className="p-main">
      <h1 className="p-h1">Admin</h1>
      <p className="p-lead">Platforma holati, dizaynlar va taklifnomalar.</p>

      <div className={s.stats} style={{ marginTop: 20 }}>
        <p className={`p-card ${s.stat} ${s.statPrimary}`}>
          <span className={s.statNum}>{published}</span>
          <span className={s.statLabel}>e’lon qilingan taklifnoma</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{total}</span>
          <span className={s.statLabel}>jami · {recent} tasi so‘nggi 7 kunda</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{paid}</span>
          <span className={s.statLabel}>«Namuna» belgisisiz</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{users}</span>
          <span className={s.statLabel}>foydalanuvchi</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{guests}</span>
          <span className={s.statLabel}>mehmon ro‘yxatlarda</span>
        </p>
        <p className={`p-card ${s.stat}`}>
          <span className={s.statNum}>{rsvpYes._sum.count ?? 0}</span>
          <span className={s.statLabel}>kishi «kelaman» degan ({rsvpYes._count} javob)</span>
        </p>
      </div>

      <section className={a.section} aria-labelledby="designs">
        <h2 id="designs" className="p-h2">
          Dizaynlar
        </h2>
        <p className="p-hint" style={{ marginTop: 4 }}>
          O‘chirilgan dizayn galereyada va yangi taklifnomada ko‘rinmaydi. Undan foydalanayotgan taklifnomalar ishlashda davom etadi.
        </p>
        <ul className={a.designs}>
          {TEMPLATES.map((t) => {
            const enabled = !off.has(t.id);
            return (
              <li key={t.id} className={`p-card ${a.design}`}>
                <span className={a.swatch} style={{ background: t.palette.ground }} aria-hidden>
                  <i style={{ background: t.palette.bg }} />
                  <i style={{ background: t.palette.accent }} />
                </span>
                <div className={a.designBody}>
                  <p className={a.designName}>{t.name}</p>
                  <p className="p-hint">{usage.get(t.id) ?? 0} ta taklifnomada</p>
                </div>
                <span className={enabled ? "p-badge p-badge--ok" : "p-badge"}>{enabled ? "Yoqilgan" : "O‘chirilgan"}</span>
                <form action={setTemplateEnabled}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="enabled" value={enabled ? "0" : "1"} />
                  <button type="submit" className="p-btn p-btn--sm">
                    {enabled ? "O‘chirish" : "Yoqish"}
                  </button>
                </form>
                <a className="p-btn p-btn--sm p-btn--ghost" href={`/namuna/${t.id}`} target="_blank" rel="noopener">
                  Ko‘rish
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={a.section} aria-labelledby="invs">
        <h2 id="invs" className="p-h2">
          Taklifnomalar
        </h2>
        <form className={a.search} role="search">
          <label className="p-sr" htmlFor="q">
            Havola, ism yoki email bo‘yicha qidirish
          </label>
          <input id="q" name="q" type="search" className="p-input" defaultValue={query} placeholder="Havola, ism yoki egasining emaili" />
          <label className="p-sr" htmlFor="holat">
            Holat
          </label>
          <select id="holat" name="holat" className="p-select" defaultValue={holat}>
            <option value="">Hammasi</option>
            <option value="published">E’lon qilingan</option>
            <option value="unpaid">E’lon qilingan, «Namuna» belgili</option>
            <option value="draft">Qoralama</option>
          </select>
          <button type="submit" className="p-btn">
            Qidirish
          </button>
        </form>
        <p className="p-hint" style={{ margin: "8px 0 12px" }}>
          {list.length === 50 ? "So‘nggi 50 tasi ko‘rsatilgan — aniqroq qidiring." : `${list.length} ta topildi.`}
        </p>

        {list.length === 0 ? (
          <p className="p-muted">Hech narsa topilmadi.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">Taklifnoma</th>
                <th scope="col">Egasi</th>
                <th scope="col">Holat</th>
                <th scope="col" className={s.num}>
                  Javob
                </th>
                <th scope="col">«Namuna» belgisi</th>
                <th scope="col">
                  <span className="p-sr">Amallar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((inv) => {
                const title = [inv.name1, inv.name2].filter(Boolean).join(" & ") || "Nomsiz qoralama";
                const live = inv.status === "published";
                return (
                  <tr key={inv.id}>
                    <td>
                      <strong>{title}</strong>
                      <div className={s.muted}>
                        {EVENT_LABELS[inv.eventType as EventType] ?? inv.eventType} · {getTemplateMeta(inv.templateId)?.name ?? inv.templateId} · {day(inv.createdAt)}
                      </div>
                      {!isTempSlug(inv.slug) && (
                        <div className={s.muted}>
                          {live ? (
                            <a href={`/i/${inv.slug}`} target="_blank" rel="noopener">
                              /i/{inv.slug}
                            </a>
                          ) : (
                            `/i/${inv.slug}`
                          )}
                        </div>
                      )}
                    </td>
                    <td className={s.muted}>{inv.owner.email ?? "—"}</td>
                    <td>
                      <span className={live ? "p-badge p-badge--ok" : "p-badge p-badge--draft"}>{live ? "E’lon qilingan" : "Qoralama"}</span>
                    </td>
                    <td className={s.num} data-label="Javob">
                      {inv._count.rsvps}
                      <div className={s.muted}>{inv._count.guests} mehmon</div>
                    </td>
                    <td>
                      <form action={setPaid}>
                        <input type="hidden" name="id" value={inv.id} />
                        <input type="hidden" name="paid" value={inv.isPaid ? "0" : "1"} />
                        <button type="submit" className={inv.isPaid ? "p-btn p-btn--sm" : "p-btn p-btn--sm p-btn--primary"}>
                          {inv.isPaid ? "Belgini qaytarish" : "To‘landi — belgini olish"}
                        </button>
                      </form>
                      {inv.isPaid && <div className={s.muted}>To‘langan</div>}
                    </td>
                    <td>
                      {live && <UnpublishButton id={inv.id} title={title} />}
                      <Link className="p-btn p-btn--sm p-btn--ghost" href={`/kabinet/t/${inv.id}/javoblar`}>
                        Javoblar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
