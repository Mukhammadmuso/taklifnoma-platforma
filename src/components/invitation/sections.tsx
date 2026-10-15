"use client";

import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { SectionProps } from "@/templates/contract";
import { formatTime, icsStamp, monthGrid, pad2, sameTashkentDay, tashkentParts } from "@/lib/datetime";
import { initialsOf } from "@/lib/view";
import { useCopy, useInView } from "./hooks";
import {
  IconCalendar,
  IconCheck,
  IconCopy,
  IconPin,
} from "./icons";
import { RsvpSection } from "./RsvpSection";
import { GallerySection } from "./Gallery";
import { ProgramIcon } from "./programIcons";
import { apos } from "./Apos";

/* ------------------------------------------------------------------ */

export function namesJoined(view: SectionProps["view"]) {
  const and = view.script === "cyr" ? " ва " : " va ";
  return view.name2 ? `${view.name1}${and}${view.name2}` : view.name1;
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="inv-title">{typeof children === "string" ? apos(children) : children}</h2>;
}

function SectionShell({ id, children, label }: { id: string; children: ReactNode; label?: string }) {
  return (
    <section className={`inv-section inv-section--${id}`} data-section={id} aria-label={label}>
      {children}
    </section>
  );
}

/* ---------------------------- Hero -------------------------------- */

export function HeroSection({ view, t, decor }: SectionProps) {
  const p = tashkentParts(new Date(view.eventISO));
  const long = Math.max(view.name1.length, view.name2?.length ?? 0) > 9;
  return (
    <SectionShell id="hero" label={t.event.eventTitle}>
      <decor.Emblem initials={initialsOf(view.name1, view.name2)} className="inv-hero__emblem" />
      <h1 className="inv-hero__names" data-long={long || undefined}>
        <span className="inv-hero__name">{apos(view.name1)}</span>
        {view.name2 && (
          <>
            <span className="inv-hero__amp" aria-label={view.script === "cyr" ? "ва" : "va"}>
              &amp;
            </span>
            <span className="inv-hero__name">{apos(view.name2)}</span>
          </>
        )}
      </h1>
      <p className="inv-hero__event">{t.event.eventTitle}</p>
      <p className="inv-hero__date">
        <time dateTime={view.eventISO}>
          {pad2(p.day)}
          <span className="inv-hero__dot" aria-hidden>
            ·
          </span>
          {pad2(p.month)}
          <span className="inv-hero__dot" aria-hidden>
            ·
          </span>
          {p.year}
        </time>
      </p>
      <a className="inv-hero__scroll" href="#taklif">
        <span>{t.common.scrollDown}</span>
        <span className="inv-hero__thread" aria-hidden />
      </a>
    </SectionShell>
  );
}

/* --------------------------- Invite ------------------------------- */

/** Ota-onalar ikki ustunda (nikoh/fotiha) */
export function ParentsBlock({ view, t }: Pick<SectionProps, "view" | "t">) {
  if (!view.parents1 && !view.parents2) return null;
  return (
    <div className="inv-parents">
      {view.parents1 && (
        <p>
          <span className="inv-parents__label">{apos(t.common.parents1Label)}</span>
          <span className="inv-parents__names">{apos(view.parents1)}</span>
        </p>
      )}
      {view.parents2 && (
        <p>
          <span className="inv-parents__label">{apos(t.common.parents2Label)}</span>
          <span className="inv-parents__names">{apos(view.parents2)}</span>
        </p>
      )}
    </div>
  );
}

/** Shior qatori: «— Ikki qalb — bir taqdir —» */
export function QuoteLine({ view }: Pick<SectionProps, "view">) {
  if (!view.quote) return null;
  return (
    <p className="inv-quote">
      <span aria-hidden>— </span>
      {apos(view.quote)}
      <span aria-hidden> —</span>
    </p>
  );
}

export function InviteSection({ view, t, decor }: SectionProps) {
  const greeting = view.guest ? `${t.common.dear} ${view.guest.name}!` : `${t.common.dearGuest}!`;
  const text = view.subtitle ?? t.event.inviteText.replace("{names}", namesJoined(view));
  return (
    <SectionShell id="invite">
      <span id="taklif" className="inv-anchor" />
      <p className="inv-invite__greeting">{apos(greeting)}</p>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className={i === 0 ? "inv-invite__text inv-invite__text--lead" : "inv-invite__text"}>
          {para}
        </p>
      ))}
      {view.mainPhotoUrl && (
        <figure className="inv-photo inv-photo--main">
          <img src={view.mainPhotoUrl} alt={namesJoined(view)} loading="lazy" decoding="async" />
        </figure>
      )}
      {view.hosts && (
        <p className="inv-invite__hosts">
          <span>{t.common.respectfully},</span> {view.hosts}
        </p>
      )}
      <ParentsBlock view={view} t={t} />
      <QuoteLine view={view} />
      <decor.Divider className="inv-divider" />
    </SectionShell>
  );
}

/* ---------------------------- Date -------------------------------- */

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown({ view, t }: Pick<SectionProps, "view" | "t">) {
  const now = useNow();
  const event = new Date(view.eventISO);
  if (now === null) {
    // Server va birinchi chizishda bo'sh katakchalar (gidratsiya mos kelishi uchun)
    return <CountdownCells values={null} t={t} />;
  }
  const diff = event.getTime() - now;
  if (sameTashkentDay(new Date(now), event)) {
    return <p className="inv-countdown__state">{apos(t.event.todayText)}</p>;
  }
  if (diff <= 0) {
    return <p className="inv-countdown__state">{apos(t.event.passedText)}</p>;
  }
  const s = Math.floor(diff / 1000);
  return (
    <CountdownCells
      values={[Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]}
      t={t}
    />
  );
}

function CountdownCells({ values, t }: { values: number[] | null; t: SectionProps["t"] }) {
  const labels = [t.common.days, t.common.hours, t.common.minutes, t.common.seconds];
  return (
    <div className="inv-countdown" role="timer" aria-live="off">
      {labels.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && <span className="inv-countdown__sep" aria-hidden />}
          <div className="inv-countdown__cell">
            <span className="inv-countdown__num">{values ? (i === 0 ? values[i] : pad2(values[i])) : "—"}</span>
            <span className="inv-countdown__label">{label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function googleCalendarUrl(view: SectionProps["view"], title: string) {
  const start = new Date(view.eventISO);
  const end = new Date(start.getTime() + 5 * 3600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${icsStamp(start)}/${icsStamp(end)}`,
    details: typeof window !== "undefined" ? window.location.href.split("?")[0] : "",
    location: [view.venueName, view.address].filter(Boolean).join(", "),
    ctz: "Asia/Tashkent",
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function DateSection({ view, t, decor }: SectionProps) {
  const p = tashkentParts(new Date(view.eventISO));
  const weeks = monthGrid(p.year, p.month);
  const [calOpen, setCalOpen] = useState(false);
  const [ringRef, ringInView] = useInView<HTMLDivElement>();
  const title = `${namesJoined(view)} — ${t.event.eventTitle}`;
  const [gcalUrl, setGcalUrl] = useState<string | null>(null);
  useEffect(() => setGcalUrl(googleCalendarUrl(view, title)), [view, title]);

  return (
    <SectionShell id="date">
      <Title>{t.event.dayTitle}</Title>
      <div className="inv-date__big">
        <span className="inv-date__weekday">{t.weekdays[p.weekday]}</span>
        <span className="inv-date__day">{p.day}</span>
        <span className="inv-date__month">
          {t.months[p.month - 1]} {p.year}
        </span>
      </div>
      <p className="inv-date__time">
        {t.common.at} <strong>{formatTime(p)}</strong> {t.common.atSuffix}
      </p>

      <div className="inv-cal" ref={ringRef} data-inview={ringInView || undefined}>
        <p className="inv-cal__caption">
          {t.months[p.month - 1]} {p.year}
        </p>
        <table className="inv-cal__grid">
          <thead>
            <tr>
              {t.weekdaysShort.map((d) => (
                <th key={d} scope="col">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, wi) => (
              <tr key={wi}>
                {w.map((d, di) => (
                  <td key={di} aria-current={d === p.day ? "date" : undefined}>
                    {d === p.day ? (
                      <span className="inv-cal__mark">
                        {decor.DayMark && <decor.DayMark className="inv-cal__ring" />}
                        <span>{d}</span>
                      </span>
                    ) : (
                      d ?? ""
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="inv-countdown-wrap">
        <h3 className="inv-subtitle">{t.event.countdownTitle}</h3>
        <Countdown view={view} t={t} />
      </div>

      <div className="inv-calendar-add">
        <button
          type="button"
          className="inv-btn inv-btn--ghost"
          aria-expanded={calOpen}
          aria-controls="inv-cal-menu"
          onClick={() => setCalOpen((o) => !o)}
        >
          <IconCalendar />
          {t.common.addToCalendar}
        </button>
        {calOpen && (
          <div id="inv-cal-menu" className="inv-calendar-add__menu">
            {gcalUrl && (
              <a className="inv-btn inv-btn--line" href={gcalUrl} target="_blank" rel="noopener noreferrer">
                {t.common.googleCalendar}
              </a>
            )}
            <a className="inv-btn inv-btn--line" href={`/api/ics/${encodeURIComponent(view.slug)}`}>
              {t.common.appleCalendar}
            </a>
          </div>
        )}
      </div>
      <decor.Divider className="inv-divider" />
    </SectionShell>
  );
}

/* --------------------------- Program ------------------------------ */

export function ProgramSection({ view, t, decor }: SectionProps) {
  const [ref, inView] = useInView<HTMLOListElement>();
  if (!view.program.length) return null;
  return (
    <SectionShell id="program">
      <Title>{t.event.programTitle}</Title>
      <ol className="inv-program" ref={ref} data-inview={inView || undefined}>
        {view.program.map((item, i) => (
          <li key={i} className="inv-program__item" style={{ "--i": i } as CSSProperties}>
            <span className="inv-program__time">{item.time}</span>
            <span className="inv-program__node" aria-hidden>
              <ProgramIcon id={item.icon} className="inv-program__icon" />
            </span>
            <div className="inv-program__body">
              <p className="inv-program__title">{item.title}</p>
              {item.description && <p className="inv-program__desc">{item.description}</p>}
            </div>
          </li>
        ))}
      </ol>
      <decor.Divider className="inv-divider" />
    </SectionShell>
  );
}

/* ---------------------------- Notes ------------------------------- */

export function NotesSection({ view, t, decor }: SectionProps) {
  if (!view.notes.length) return null;
  const Bullet = decor.Bullet;
  return (
    <SectionShell id="notes">
      <Title>{t.common.notesTitle}</Title>
      <ul className="inv-notes">
        {view.notes.map((n, i) => (
          <li key={i}>
            {Bullet ? <Bullet className="inv-notes__bullet" /> : <span className="inv-notes__bullet" aria-hidden />}
            <span>{n}</span>
          </li>
        ))}
      </ul>
      <decor.Divider className="inv-divider" />
    </SectionShell>
  );
}

/* ---------------------------- Venue ------------------------------- */

function CopyButton({ text, label, t }: { text: string; label: string; t: SectionProps["t"] }) {
  const [state, copy] = useCopy();
  return (
    <button type="button" className="inv-btn inv-btn--line" onClick={() => copy(text)} data-state={state}>
      {state === "copied" ? <IconCheck /> : <IconCopy />}
      <span aria-live="polite">
        {state === "copied" ? t.common.copied : state === "failed" ? t.common.copyFailed : label}
      </span>
    </button>
  );
}

/** Xarita uchun joy: havoladagi koordinatalar, bo'lmasa — to'yxona nomi va manzil */
export function mapQuery(view: SectionProps["view"]): string | null {
  const g = view.googleMapsUrl ?? "";
  const m =
    g.match(/[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/) ??
    g.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return `${m[1]},${m[2]}`;
  const y = (view.yandexMapsUrl ?? "").match(/[?&](?:pt|ll)=(-?\d{1,3}\.\d+),(-?\d{1,2}\.\d+)/);
  if (y) return `${y[2]},${y[1]}`;
  const text = [view.venueName, view.address].filter(Boolean).join(", ");
  return text || null;
}

export function directionsUrl(q: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

/** Xarita (sahifa shu joyga yetganda yuklanadi) */
export function VenueMap({ view, t }: Pick<SectionProps, "view" | "t">) {
  const q = mapQuery(view);
  if (!q) return null;
  return (
    <div className="inv-map">
      <iframe
        src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`}
        title={t.common.mapLabel}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function VenueSection({ view, t, decor }: SectionProps) {
  if (!view.venueName && !view.address) return null;
  const Art = decor.VenueArt;
  return (
    <SectionShell id="venue">
      <Title>{t.common.venueTitle}</Title>
      {view.venuePhotoUrl ? (
        <figure className="inv-photo inv-photo--venue">
          <img src={view.venuePhotoUrl} alt={view.venueName ?? ""} loading="lazy" decoding="async" />
        </figure>
      ) : (
        Art && <Art className="inv-venue__art" />
      )}
      {view.venueName && <p className="inv-venue__name">{view.venueName}</p>}
      {view.venueHall && <p className="inv-venue__hall">{view.venueHall}</p>}
      {view.address && (
        <p className="inv-venue__address">
          <IconPin />
          <span>{view.address}</span>
        </p>
      )}
      {view.landmark && <p className="inv-venue__landmark">{view.landmark}</p>}
      <VenueMap view={view} t={t} />
      <div className="inv-venue__actions">
        {mapQuery(view) && (
          <a className="inv-btn inv-btn--solid" href={directionsUrl(mapQuery(view)!)} target="_blank" rel="noopener noreferrer">
            <IconPin />
            {t.common.directions}
          </a>
        )}
        {view.googleMapsUrl && (
          <a className="inv-btn inv-btn--solid" href={view.googleMapsUrl} target="_blank" rel="noopener noreferrer">
            {t.common.googleMaps}
          </a>
        )}
        {view.yandexMapsUrl && (
          <a className="inv-btn inv-btn--solid" href={view.yandexMapsUrl} target="_blank" rel="noopener noreferrer">
            {t.common.yandexMaps}
          </a>
        )}
        {view.address && <CopyButton text={view.address} label={t.common.copyAddress} t={t} />}
      </div>
      <decor.Divider className="inv-divider" />
    </SectionShell>
  );
}

/* ----------------------------- Gift ------------------------------- */

const CARD_RE = /(?:\d[ -]?){15,18}\d/g;

export function GiftSection({ view, t, decor }: SectionProps) {
  const text = view.giftText;
  const parts = useMemo(() => {
    if (!text) return [];
    const out: { kind: "text" | "card"; value: string }[] = [];
    let last = 0;
    for (const m of text.matchAll(CARD_RE)) {
      const i = m.index ?? 0;
      if (i > last) out.push({ kind: "text", value: text.slice(last, i) });
      out.push({ kind: "card", value: m[0].trim() });
      last = i + m[0].length;
    }
    if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
    return out;
  }, [text]);
  if (!text) return null;
  return (
    <SectionShell id="gift">
      <Title>{view.giftTitle ?? t.event.giftTitle}</Title>
      <div className="inv-gift">
        {parts.map((p, i) =>
          p.kind === "text" ? (
            <span key={i} className="inv-gift__text">
              {p.value}
            </span>
          ) : (
            <span key={i} className="inv-gift__card">
              <span className="inv-gift__number">{p.value.replace(/[ -]/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")}</span>
              <CopyButton text={p.value.replace(/[ -]/g, "")} label={t.common.copyNumber} t={t} />
            </span>
          ),
        )}
      </div>
      <decor.Divider className="inv-divider" />
    </SectionShell>
  );
}

/* ---------------------------- Share ------------------------------- */

/** Taklifnomani ulashish: umumiy havola (mehmonning shaxsiy tokeni qo'shilmaydi) */
export function ShareRow({ view, t }: Pick<SectionProps, "view" | "t">) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, copy] = useCopy();
  useEffect(() => setUrl(`${window.location.origin}${window.location.pathname}`), []);
  if (!url) return null;
  const title = `${namesJoined(view)} — ${t.event.eventTitle}`;
  return (
    <div className="inv-share">
      <a className="inv-btn inv-btn--line" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
          <path d="M21 4L3 11l6 2 2 6 3-4 5 4z" />
          <path d="M9 13l12-9" />
        </svg>
        {t.common.shareTelegram}
      </a>
      <button type="button" className="inv-btn inv-btn--line" onClick={() => copy(url)} data-state={state}>
        {state === "copied" ? <IconCheck /> : <IconCopy />}
        <span aria-live="polite">{state === "copied" ? t.common.copied : state === "failed" ? t.common.copyFailed : t.common.copyLink}</span>
      </button>
    </div>
  );
}

/* --------------------------- Closing ------------------------------ */

export function ClosingSection({ view, t, decor }: SectionProps) {
  return (
    <SectionShell id="closing">
      <p className="inv-closing__text">{apos(t.event.closingText)}</p>
      <p className="inv-closing__names">
        {apos(view.name1)}
        {view.name2 && (
          <>
            {" "}
            <span className="inv-hero__amp">&amp;</span> {apos(view.name2)}
          </>
        )}
      </p>
      {view.hosts && (
        <p className="inv-closing__hosts">
          {t.common.respectfully}, {view.hosts}
        </p>
      )}
      <decor.Emblem initials={initialsOf(view.name1, view.name2)} className="inv-closing__emblem" />
      <ShareRow view={view} t={t} />
    </SectionShell>
  );
}

export const DEFAULT_SECTIONS = {
  hero: HeroSection,
  invite: InviteSection,
  date: DateSection,
  program: ProgramSection,
  notes: NotesSection,
  venue: VenueSection,
  gift: GiftSection,
  rsvp: RsvpSection,
  gallery: GallerySection,
  closing: ClosingSection,
};
