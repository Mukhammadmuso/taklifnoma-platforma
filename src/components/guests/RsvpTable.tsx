"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/platform/ConfirmButton";
import { deleteRsvp } from "@/app/(platform)/kabinet/t/[id]/actions";
import s from "./guests.module.css";

export type RsvpRow = {
  id: string;
  name: string;
  attending: boolean;
  count: number;
  wish: string | null;
  at: string;
  guestName: string | null;
};

type Filter = "all" | "yes" | "no";

export function RsvpTable({ id, rows }: { id: string; rows: RsvpRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("uz");
    return rows.filter(
      (r) =>
        (filter === "all" || (filter === "yes") === r.attending) &&
        (!q || [r.name, r.wish ?? "", r.guestName ?? ""].some((v) => v.toLocaleLowerCase("uz").includes(q))),
    );
  }, [rows, query, filter]);

  if (!rows.length) {
    return (
      <div className={`p-card ${s.empty}`}>
        <p className="p-h2">Hali javob yo‘q</p>
        <p className="p-lead">
          Mehmonlar taklifnomadagi formani to‘ldirgach, javoblari shu yerda paydo bo‘ladi. Havolani yuborishni unutmang —{" "}
          <a href={`/kabinet/t/${id}/mehmonlar`}>mehmonlar ro‘yxatiga o‘tish</a>.
        </p>
      </div>
    );
  }

  const yesCount = rows.filter((r) => r.attending).length;

  return (
    <section aria-labelledby="replies-title">
      <h2 id="replies-title" className="p-sr">
        Javoblar ro‘yxati
      </h2>
      <div className={s.toolbar}>
        <label className="p-sr" htmlFor="rsvp-search">
          Ism yoki tilak bo‘yicha qidirish
        </label>
        <input id="rsvp-search" type="search" className="p-input" placeholder="Ism yoki tilak bo‘yicha qidirish" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="p-sr" htmlFor="rsvp-filter">
          Javob bo‘yicha saralash
        </label>
        <select id="rsvp-filter" className="p-select" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">Hammasi ({rows.length})</option>
          <option value="yes">Keladi ({yesCount})</option>
          <option value="no">Kelmaydi ({rows.length - yesCount})</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <p className="p-muted" style={{ padding: "16px 0" }}>
          Bu so‘rov bo‘yicha javob topilmadi.
        </p>
      ) : (
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Ism</th>
              <th scope="col">Javob</th>
              <th scope="col" className={s.num}>
                Kishi
              </th>
              <th scope="col">Tilak</th>
              <th scope="col">Sana</th>
              <th scope="col">
                <span className="p-sr">Amallar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                  {r.guestName && r.guestName !== r.name && <div className={s.muted}>havola: {r.guestName}</div>}
                </td>
                <td>
                  <span className={r.attending ? "p-badge p-badge--ok" : "p-badge p-badge--no"}>{r.attending ? "Keladi" : "Kelmaydi"}</span>
                </td>
                <td className={s.num} data-label="Kishi">
                  {r.attending ? r.count : "—"}
                </td>
                <td className={s.wish}>{r.wish ?? <span className={s.muted}>—</span>}</td>
                <td className={s.muted}>{r.at}</td>
                <td>
                  <ConfirmButton
                    label="O‘chirish"
                    ariaLabel={`${r.name} javobini o‘chirish`}
                    title="Javob o‘chirilsinmi?"
                    text={`«${r.name}» javobi ro‘yxatdan va hisobdan butunlay o‘chiriladi. Masalan, xato yoki takror yuborilgan javoblar uchun.`}
                    confirmLabel="Ha, o‘chirish"
                    onConfirm={async () => {
                      const res = await deleteRsvp(id, r.id);
                      if (!res.ok) return res.error;
                      router.refresh();
                      return null;
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 16 }}>
        <a className="p-btn p-btn--sm" href={`/kabinet/t/${id}/javoblar/csv`} download>
          Excel uchun yuklab olish (CSV)
        </a>
      </p>
    </section>
  );
}
