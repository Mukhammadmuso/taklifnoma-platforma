"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import type { SectionProps } from "@/templates/contract";
import { toScript } from "@/lib/translit";
import { initialsOf } from "@/lib/view";
import { IconMinus, IconPhone, IconPlus, IconTelegram } from "./icons";

type Answer = { name: string; attending: boolean; count: number };
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; answer: Answer; fresh: boolean };

const MAX_NAME = 80;
const MAX_WISH = 600;

function storageKey(slug: string) {
  return `taklifnoma:javob:${slug}`;
}

function readStored(slug: string): Answer | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? (JSON.parse(raw) as Answer) : null;
  } catch {
    return null;
  }
}

function writeStored(slug: string, a: Answer) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(a));
  } catch {
    /* Saqlab bo'lmasa — faqat qayta kirganda forma yana chiqadi, xato emas */
  }
}

export function RsvpSection({ view, t, decor }: SectionProps) {
  const uid = useId();
  const [name, setName] = useState(view.guest?.name ?? "");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [count, setCount] = useState(1);
  const [wish, setWish] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<"name" | "choice" | null>(null);

  useEffect(() => {
    const stored = readStored(view.slug);
    if (stored) setStatus({ kind: "done", answer: stored, fresh: false });
  }, [view.slug]);

  if (!view.rsvpEnabled) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setFieldError("name");
      document.getElementById(`${uid}-name`)?.focus();
      return;
    }
    if (attending === null) {
      setFieldError("choice");
      return;
    }
    setFieldError(null);
    const answer: Answer = { name: cleanName, attending, count: attending ? count : 0 };
    setStatus({ kind: "sending" });

    if (view.isSample) {
      await new Promise((r) => setTimeout(r, 700));
      setStatus({ kind: "done", answer, fresh: true });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus({ kind: "error", message: t.common.errorNetwork });
      return;
    }
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: view.slug,
          guestToken: view.guest?.token ?? null,
          name: cleanName,
          attending,
          count: answer.count || 1,
          wish: wish.trim() || null,
          website,
        }),
      });
      if (res.status === 429) {
        setStatus({ kind: "error", message: t.common.errorRate });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus({
          kind: "error",
          message: data?.error ? toScript(data.error, view.script) : t.common.errorServer,
        });
        return;
      }
      writeStored(view.slug, answer);
      setStatus({ kind: "done", answer, fresh: true });
    } catch {
      setStatus({ kind: "error", message: t.common.errorNetwork });
    }
  }

  const Stamp = decor.Stamp ?? decor.Emblem;

  if (status.kind === "done") {
    const a = status.answer;
    const statusLine = a.attending ? `${t.common.yes} (${a.count} ${t.common.people})` : t.common.no;
    const tgText = `${t.event.telegramReply.replace("{names}", view.name2 ? `${view.name1} & ${view.name2}` : view.name1)} ${statusLine}. — ${a.name}`;
    return (
      <section className="inv-section inv-section--rsvp" data-section="rsvp">
        <div className="inv-rsvp inv-rsvp--done" data-fresh={status.fresh || undefined}>
          <Stamp initials={initialsOf(view.name1, view.name2)} className="inv-rsvp__stamp" />
          <h2 className="inv-title" tabIndex={-1} ref={(el) => { if (status.fresh) el?.focus(); }}>
            {t.common.thanksTitle}
          </h2>
          <p className="inv-rsvp__thanks">{a.attending ? `${t.common.thanksText} ${t.event.closingText}` : t.common.thanksNo}</p>
          <p className="inv-rsvp__summary">
            {a.name} · {statusLine}
          </p>
          <div className="inv-rsvp__after">
            {view.telegramUsername && (
              <a
                className="inv-btn inv-btn--solid"
                href={`https://t.me/${encodeURIComponent(view.telegramUsername)}?text=${encodeURIComponent(tgText)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconTelegram />
                {t.common.telegramReplyBtn}
              </a>
            )}
            {view.phone && (
              <a className="inv-btn inv-btn--line" href={`tel:${view.phone.replace(/[^\d+]/g, "")}`}>
                <IconPhone />
                {t.common.callBtn}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  const sending = status.kind === "sending";
  return (
    <section className="inv-section inv-section--rsvp" data-section="rsvp">
      <form className="inv-rsvp" onSubmit={submit} noValidate>
        <h2 className="inv-title">{t.common.rsvpTitle}</h2>
        <p className="inv-rsvp__lead">{t.common.rsvpLead}</p>

        <div className="inv-field">
          <label htmlFor={`${uid}-name`} className="inv-field__label">
            {t.common.name}
          </label>
          <input
            id={`${uid}-name`}
            className="inv-input"
            value={name}
            maxLength={MAX_NAME}
            autoComplete="name"
            placeholder={t.common.namePlaceholder}
            aria-invalid={fieldError === "name" || undefined}
            aria-describedby={fieldError === "name" ? `${uid}-name-err` : undefined}
            onChange={(e) => setName(e.target.value)}
          />
          {fieldError === "name" && (
            <p id={`${uid}-name-err`} className="inv-field__error" role="alert">
              {t.common.errorRequired}
            </p>
          )}
        </div>

        <fieldset className="inv-field inv-choice" aria-describedby={fieldError === "choice" ? `${uid}-choice-err` : undefined}>
          <legend className="inv-field__label">{t.common.attending}</legend>
          {[
            { v: true, label: t.common.yes },
            { v: false, label: t.common.no },
          ].map((o) => (
            <label key={String(o.v)} className="inv-choice__option" data-checked={attending === o.v || undefined}>
              <input
                type="radio"
                name={`${uid}-attending`}
                checked={attending === o.v}
                onChange={() => {
                  setAttending(o.v);
                  if (fieldError === "choice") setFieldError(null);
                }}
              />
              <span className="inv-choice__box" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12.8l4.4 4.2L19.5 6.5" />
                </svg>
              </span>
              <span>{o.label}</span>
            </label>
          ))}
          {fieldError === "choice" && (
            <p id={`${uid}-choice-err`} className="inv-field__error" role="alert">
              {t.common.errorChoice}
            </p>
          )}
        </fieldset>

        {attending && (
          <div className="inv-field">
            <span className="inv-field__label" id={`${uid}-count`}>
              {t.common.count}
            </span>
            <div className="inv-stepper" role="group" aria-labelledby={`${uid}-count`}>
              <button type="button" aria-label="−1" disabled={count <= 1} onClick={() => setCount((c) => Math.max(1, c - 1))}>
                <IconMinus />
              </button>
              <output aria-live="polite">{count}</output>
              <button type="button" aria-label="+1" disabled={count >= 10} onClick={() => setCount((c) => Math.min(10, c + 1))}>
                <IconPlus />
              </button>
            </div>
          </div>
        )}

        <div className="inv-field">
          <label htmlFor={`${uid}-wish`} className="inv-field__label">
            {t.common.wish}
          </label>
          <textarea
            id={`${uid}-wish`}
            className="inv-input inv-input--area"
            rows={3}
            maxLength={MAX_WISH}
            value={wish}
            placeholder={t.common.wishPlaceholder}
            onChange={(e) => setWish(e.target.value)}
          />
        </div>

        {/* Bot tuzog'i: odamlarga ko'rinmaydi */}
        <div className="inv-hp" aria-hidden>
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        {status.kind === "error" && (
          <p className="inv-rsvp__error" role="alert">
            {status.message}
          </p>
        )}

        <button type="submit" className="inv-btn inv-btn--solid inv-rsvp__submit" disabled={sending} aria-busy={sending}>
          {sending ? t.common.sending : t.common.submit}
        </button>
      </form>
    </section>
  );
}
