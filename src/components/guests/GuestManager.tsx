"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCopy } from "@/components/invitation/hooks";
import { ConfirmButton } from "@/components/platform/ConfirmButton";
import { GUEST_LIMIT, MESSAGE_MAX, guestStatus, parseGuestList, renderGuestMessage, STATUS_LABELS, type GuestStatus } from "@/lib/guests";
import { addGuests, deleteGuest, renameGuest, saveGuestMessage } from "@/app/(platform)/kabinet/t/[id]/actions";
import s from "./guests.module.css";

export type GuestRow = {
  id: string;
  name: string;
  token: string;
  openedAt: string | null;
  rsvp: { attending: boolean; count: number } | null;
};

type Filter = "all" | GuestStatus;

const BADGE: Record<GuestStatus, string> = {
  new: "p-badge",
  opened: "p-badge p-badge--info",
  yes: "p-badge p-badge--ok",
  no: "p-badge p-badge--no",
};

export function GuestManager({
  id,
  base,
  ready,
  initialMessage,
  defaultMessage,
  guests,
}: {
  id: string;
  /** Umumiy havola: https://sayt/i/slug */
  base: string;
  /** Taklifnoma e'lon qilingan va doimiy havolasi bor */
  ready: boolean;
  initialMessage: string;
  defaultMessage: string;
  guests: GuestRow[];
}) {
  const router = useRouter();
  const linkOf = (g: GuestRow) => `${base}?g=${g.token}`;

  /* ---------- Qo'shish ---------- */
  const [list, setList] = useState("");
  const [addMsg, setAddMsg] = useState<{ kind: "ok" | "error" | "warn"; text: string } | null>(null);
  const [adding, startAdd] = useTransition();
  const parsed = useMemo(() => parseGuestList(list, guests.map((g) => g.name)), [list, guests]);
  const submitList = () =>
    startAdd(async () => {
      setAddMsg(null);
      const res = await addGuests(id, list);
      if (!res.ok) return setAddMsg({ kind: "error", text: res.error });
      const parts = [`${res.added} ta mehmon qo‘shildi.`];
      if (res.duplicates.length) parts.push(`${res.duplicates.length} tasi ro‘yxatda bor edi, qayta qo‘shilmadi: ${res.duplicates.slice(0, 5).join(", ")}${res.duplicates.length > 5 ? "…" : ""}`);
      if (res.overLimit) parts.push(`${res.overLimit} tasi sig‘madi — bitta taklifnomaga ${GUEST_LIMIT} tagacha mehmon.`);
      setAddMsg({ kind: res.duplicates.length || res.overLimit ? "warn" : "ok", text: parts.join(" ") });
      setList("");
      router.refresh();
    });

  /* ---------- Xabar ---------- */
  const [message, setMessage] = useState(initialMessage);
  const [savedMessage, setSavedMessage] = useState(initialMessage);
  const [msgState, setMsgState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveMessage = async (value = message) => {
    setMsgState("saving");
    const res = await saveGuestMessage(id, value).catch(() => null);
    if (res?.ok) {
      setSavedMessage(value);
      setMsgState("saved");
    } else setMsgState("error");
  };
  const sample = guests[0] ? { name: guests[0].name, link: linkOf(guests[0]) } : { name: "Aziza opa", link: `${base}?g=namuna` };

  /* ---------- Ro'yxat ---------- */
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const counts = useMemo(() => {
    const c = { all: guests.length, new: 0, opened: 0, yes: 0, no: 0, people: 0 };
    for (const g of guests) {
      const st = guestStatus(g);
      c[st]++;
      if (st === "yes") c.people += g.rsvp?.count ?? 1;
    }
    return c;
  }, [guests]);
  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("uz");
    return guests.filter((g) => (filter === "all" || guestStatus(g) === filter) && (!q || g.name.toLocaleLowerCase("uz").includes(q)));
  }, [guests, query, filter]);

  return (
    <div className={s.layout} data-has-guests={guests.length > 0 || undefined}>
      <div className={s.side}>
        <section className={`p-card ${s.card}`} aria-labelledby="add-title">
          <h2 id="add-title" className="p-h2">
            Mehmon qo‘shish
          </h2>
          <p className="p-hint" style={{ marginTop: 4 }}>
            Har qatorga bitta ism yoki oila. Telefon kontaktlaridan yoki Excel’dan nusxalab joylashingiz mumkin — raqamlar va telefon raqamlari o‘zi olib tashlanadi.
          </p>
          <label className="p-sr" htmlFor="guest-list">
            Mehmonlar ro‘yxati
          </label>
          <textarea
            id="guest-list"
            className="p-textarea"
            rows={7}
            value={list}
            onChange={(e) => setList(e.target.value)}
            placeholder={"Aziza opa\nG‘ayrat aka\nKarimovlar oilasi"}
            style={{ marginTop: 12 }}
          />
          <div className="p-row" style={{ marginTop: 10, justifyContent: "space-between" }}>
            <span className="p-hint" aria-live="polite">
              {parsed.names.length ? `${parsed.names.length} ta yangi ism` : "Ro‘yxat bo‘sh"}
              {parsed.duplicates.length ? ` · ${parsed.duplicates.length} ta takror` : ""}
            </span>
            <button type="button" className="p-btn p-btn--primary" disabled={adding || !parsed.names.length} onClick={submitList}>
              {adding ? "Qo‘shilmoqda…" : parsed.names.length ? `${parsed.names.length} ta mehmonni qo‘shish` : "Qo‘shish"}
            </button>
          </div>
          {addMsg && (
            <p className={`p-alert p-alert--${addMsg.kind}`} role="status" style={{ marginTop: 12 }}>
              {addMsg.text}
            </p>
          )}
        </section>

        <section className={`p-card ${s.card}`} aria-labelledby="msg-title">
          <h2 id="msg-title" className="p-h2">
            Xabar matni
          </h2>
          <p className="p-hint" style={{ marginTop: 4 }}>
            <code>{"{ism}"}</code> o‘rniga mehmon ismi, <code>{"{havola}"}</code> o‘rniga uning shaxsiy havolasi qo‘yiladi.
          </p>
          <label className="p-sr" htmlFor="guest-message">
            Xabar matni
          </label>
          <textarea
            id="guest-message"
            className="p-textarea"
            rows={7}
            maxLength={MESSAGE_MAX}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setMsgState("idle");
            }}
            style={{ marginTop: 12 }}
          />
          <div className="p-row" style={{ marginTop: 10 }}>
            <button type="button" className="p-btn" disabled={msgState === "saving" || message === savedMessage} onClick={() => saveMessage()}>
              {msgState === "saving" ? "Saqlanmoqda…" : "Saqlash"}
            </button>
            {message !== defaultMessage && (
              <button
                type="button"
                className="p-btn p-btn--ghost"
                onClick={() => {
                  setMessage(defaultMessage);
                  void saveMessage(defaultMessage);
                }}
              >
                Asl matnga qaytarish
              </button>
            )}
            <span className="p-hint" role="status">
              {msgState === "saved" && "Saqlandi"}
              {msgState === "error" && <span className="p-error">Saqlanmadi, qayta urinib ko‘ring</span>}
              {msgState === "idle" && message !== savedMessage && "Saqlanmagan o‘zgarishlar bor"}
            </span>
          </div>
          <p className={s.previewLabel}>{sample.name} uchun ko‘rinishi:</p>
          <p className={s.preview}>{renderGuestMessage(message, sample)}</p>
        </section>
      </div>

      <section className={s.main} aria-labelledby="list-title">
        <div className={s.summary}>
          <p>
            <strong>{counts.all}</strong> mehmon
          </p>
          <p>
            <strong>{counts.opened + counts.yes + counts.no}</strong> ochgan
          </p>
          <p>
            <strong>{counts.yes}</strong> keladi · <strong>{counts.people}</strong> kishi
          </p>
          <p>
            <strong>{counts.no}</strong> kelmaydi
          </p>
          {guests.length > 0 && (
            <a href="#add-title" className={s.jump}>
              + Mehmon qo‘shish
            </a>
          )}
        </div>

        <div className={s.toolbar}>
          <h2 id="list-title" className="p-sr">
            Mehmonlar ro‘yxati
          </h2>
          <label className="p-sr" htmlFor="guest-search">
            Ism bo‘yicha qidirish
          </label>
          <input id="guest-search" type="search" className="p-input" placeholder="Ism bo‘yicha qidirish" value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className="p-sr" htmlFor="guest-filter">
            Holat bo‘yicha saralash
          </label>
          <select id="guest-filter" className="p-select" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="all">Hammasi ({counts.all})</option>
            <option value="new">{STATUS_LABELS.new} ({counts.new})</option>
            <option value="opened">{STATUS_LABELS.opened} ({counts.opened})</option>
            <option value="yes">{STATUS_LABELS.yes} ({counts.yes})</option>
            <option value="no">{STATUS_LABELS.no} ({counts.no})</option>
          </select>
        </div>

        {guests.length === 0 ? (
          <div className={`p-card ${s.empty}`}>
            <p className="p-h2">Hali mehmon yo‘q</p>
            <p className="p-lead">
              Ro‘yxatni chapdagi maydonga joylang. Har bir mehmonga alohida havola yaratiladi: taklifnoma «Hurmatli Aziza opa» deb ochiladi, kim ochgani va kim javob bergani shu yerda ko‘rinadi.
            </p>
          </div>
        ) : shown.length === 0 ? (
          <p className="p-muted" style={{ padding: "16px 0" }}>
            Bu so‘rov bo‘yicha mehmon topilmadi.
          </p>
        ) : (
          <ul className={s.list}>
            {shown.map((g) => (
              <GuestItem key={g.id} id={id} guest={g} link={linkOf(g)} message={renderGuestMessage(savedMessage, { name: g.name, link: linkOf(g) })} ready={ready} onChanged={() => router.refresh()} />
            ))}
          </ul>
        )}

        {guests.length > 0 && (
          <p style={{ marginTop: 16 }}>
            <a className="p-btn p-btn--sm" href={`/kabinet/t/${id}/mehmonlar/csv`} download>
              Havolalar ro‘yxatini yuklab olish (CSV)
            </a>
          </p>
        )}
      </section>
    </div>
  );
}

function GuestItem({
  id,
  guest,
  link,
  message,
  ready,
  onChanged,
}: {
  id: string;
  guest: GuestRow;
  link: string;
  message: string;
  ready: boolean;
  onChanged: () => void;
}) {
  const status = guestStatus(guest);
  const [copyState, copy] = useCopy();
  const [linkState, copyLink] = useCopy();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(guest.name);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const textOnly = message.replace(link, "").replace(/\n{3,}/g, "\n\n").trim();

  const saveName = () =>
    start(async () => {
      const res = await renameGuest(id, guest.id, name);
      if (!res.ok) return setErr(res.error);
      setErr(null);
      setEditing(false);
      onChanged();
    });

  return (
    <li className={s.item}>
      <div className={s.itemHead}>
        {editing ? (
          <form
            className={s.rename}
            onSubmit={(e) => {
              e.preventDefault();
              saveName();
            }}
          >
            <label className="p-sr" htmlFor={`name-${guest.id}`}>
              Mehmon ismi
            </label>
            <input id={`name-${guest.id}`} className="p-input" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoFocus />
            <button type="submit" className="p-btn p-btn--sm p-btn--primary" disabled={pending}>
              Saqlash
            </button>
            <button
              type="button"
              className="p-btn p-btn--sm p-btn--ghost"
              onClick={() => {
                setEditing(false);
                setName(guest.name);
                setErr(null);
              }}
            >
              Bekor
            </button>
          </form>
        ) : (
          <p className={s.name}>{guest.name}</p>
        )}
        <span className={BADGE[status]}>
          {STATUS_LABELS[status]}
          {status === "yes" && guest.rsvp && guest.rsvp.count > 1 ? ` · ${guest.rsvp.count} kishi` : ""}
        </span>
      </div>
      {err && <p className="p-error">{err}</p>}

      <button type="button" className={s.link} onClick={() => copyLink(link)} title="Havolani nusxalash">
        {linkState === "copied" ? "Havola nusxalandi" : linkState === "failed" ? "Nusxalab bo‘lmadi — qo‘lda belgilang" : link.replace(/^https?:\/\//, "")}
      </button>

      <div className={s.actions}>
        {ready ? (
          <>
            <a className="p-btn p-btn--sm" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(textOnly)}`} target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
            <a className="p-btn p-btn--sm" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </>
        ) : null}
        <button type="button" className="p-btn p-btn--sm" onClick={() => copy(message)} data-state={copyState}>
          {copyState === "copied" ? "Nusxalandi" : copyState === "failed" ? "Nusxalab bo‘lmadi" : "Xabarni nusxalash"}
        </button>
        <span className={s.spacer} />
        {!editing && (
          <button type="button" className="p-btn p-btn--sm p-btn--ghost" onClick={() => setEditing(true)} aria-label={`${guest.name} — ismni o‘zgartirish`}>
            Tahrirlash
          </button>
        )}
        <ConfirmButton
          label="O‘chirish"
          ariaLabel={`${guest.name} — o‘chirish`}
          title="Mehmon o‘chirilsinmi?"
          text={`«${guest.name}» ro‘yxatdan o‘chiriladi va uning shaxsiy havolasi umumiy taklifnomaga aylanadi (ismsiz ochiladi). Agar javob bergan bo‘lsa, javobi «Javoblar»da qoladi.`}
          confirmLabel="Ha, o‘chirish"
          onConfirm={async () => {
            const res = await deleteGuest(id, guest.id);
            if (!res.ok) return res.error;
            onChanged();
            return null;
          }}
        />
      </div>
    </li>
  );
}
