"use client";

import type { SectionProps } from "../contract";
import { formatTime, tashkentParts } from "@/lib/datetime";
import { toScript } from "@/lib/translit";
import { initialsOf } from "@/lib/view";
import { apos } from "@/components/invitation/Apos";
import { namesJoined, ParentsBlock, QuoteLine, ShareRow } from "@/components/invitation/sections";
import { Heart } from "./decor";

/** «Abdullohning sunnat to'yi» — ism + qaratqich qo'shimchasi + tadbir nomi */
export function genitiveTitle({ view, t }: Pick<SectionProps, "view" | "t">) {
  const ning = view.script === "cyr" ? "нинг" : "ning";
  return `${namesJoined(view)}${ning} ${t.event.eventTitle.toLocaleLowerCase(view.script === "cyr" ? "ru" : "uz")}`;
}

export function invitePhrase(props: Pick<SectionProps, "view" | "t">) {
  return `${genitiveTitle(props)}${toScript("ga lutfan taklif etamiz", props.view.script)}`;
}

/* ------------------------------- Bosh qism ------------------------------- */

export function ZarhalHero({ view, t, decor }: SectionProps) {
  const p = tashkentParts(new Date(view.eventISO));
  const long = Math.max(view.name1.length, view.name2?.length ?? 0) > 9;
  return (
    <section className="inv-section inv-section--hero" data-section="hero" aria-label={t.event.eventTitle}>
      <p className="zh-hero__event">{apos(t.event.eventTitle)}</p>
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
      <figure className="zh-photo" data-empty={view.mainPhotoUrl ? undefined : true}>
        {view.mainPhotoUrl ? (
          <img src={view.mainPhotoUrl} alt={namesJoined(view)} decoding="async" />
        ) : (
          <decor.Emblem initials={initialsOf(view.name1, view.name2)} className="zh-photo__emblem" />
        )}
      </figure>
      <p className="zh-hero__date">
        <span>{t.weekdays[p.weekday]}</span>
        <time dateTime={view.eventISO}>
          {p.day} {t.months[p.month - 1]} {p.year}
        </time>
        <span>
          {t.common.at} {formatTime(p)} {t.common.atSuffix}
        </span>
      </p>
      <a className="inv-hero__scroll" href="#zh-keyingi">
        <span>{t.common.scrollDown}</span>
        <span className="inv-hero__thread" aria-hidden />
      </a>
      <span id="zh-keyingi" className="zh-anchor" />
    </section>
  );
}

/* ------------------------------ Taklif matni ----------------------------- */

export function ZarhalInvite({ view, t, decor }: SectionProps) {
  const greeting = view.guest ? `${t.common.dear} ${view.guest.name}!` : `${t.common.dearGuest}!`;
  const text = view.subtitle ?? t.event.inviteText.replace("{names}", namesJoined(view));
  return (
    <section className="inv-section inv-section--invite" data-section="invite">
      <span id="taklif" className="inv-anchor" />
      <h2 className="inv-title">{apos(t.common.waitingYou)}</h2>
      <p className="zh-greeting">{apos(greeting)}</p>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="zh-invite__text">
          {para}
        </p>
      ))}
      {view.hosts && (
        <p className="zh-hosts">
          <span>{t.common.respectfully},</span>
          <strong>{apos(view.hosts)}</strong>
        </p>
      )}
      <ParentsBlock view={view} t={t} />
      <QuoteLine view={view} />
      <decor.Divider className="inv-divider" />
    </section>
  );
}

/* --------------------------------- Yakun --------------------------------- */

export function ZarhalClosing({ view, t, decor }: SectionProps) {
  const p = tashkentParts(new Date(view.eventISO));
  return (
    <section className="inv-section inv-section--closing" data-section="closing">
      <decor.Emblem initials={initialsOf(view.name1, view.name2)} className="inv-closing__emblem" />
      <p className="zh-closing__title">{apos(genitiveTitle({ view, t }))}</p>
      <p className="zh-closing__date">
        {p.day} {t.months[p.month - 1]} {p.year}
      </p>
      <p className="zh-closing__wait">
        {apos(t.common.waitingYou)} <Heart className="zh-heart" />
      </p>
      {view.hosts && (
        <p className="inv-closing__hosts">
          {t.common.respectfully}, {view.hosts}
        </p>
      )}
      <ShareRow view={view} t={t} />
    </section>
  );
}
