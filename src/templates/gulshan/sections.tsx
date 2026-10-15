"use client";

import type { SectionProps } from "../contract";
import { pad2, tashkentParts } from "@/lib/datetime";
import { apos } from "@/components/invitation/Apos";
import { namesJoined, ShareRow } from "@/components/invitation/sections";
import { ASSETS } from "./decor";

/* ------------------------------- Bosh qism ------------------------------- */

/** To'liq ekranli bog' rasmi; osmon qismida tadbir, ismlar va sana */
export function GulshanHero({ view, t }: SectionProps) {
  const p = tashkentParts(new Date(view.eventISO));
  const long = Math.max(view.name1.length, view.name2?.length ?? 0) > 9;
  return (
    <section className="inv-section inv-section--hero gs-hero" data-section="hero" aria-label={t.event.eventTitle}>
      <img className="gs-hero__bg" src={ASSETS.hero} alt="" fetchPriority="high" decoding="async" />
      <div className="gs-hero__text">
        <p className="gs-hero__event">{apos(t.event.eventTitle)}</p>
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
        <p className="gs-hero__date">
          <time dateTime={view.eventISO}>
            {pad2(p.day)}
            <span aria-hidden> ◆ </span>
            {pad2(p.month)}
            <span aria-hidden> ◆ </span>
            {p.year}
          </time>
        </p>
      </div>
      <a className="gs-scroll" href="#taklif">
        {t.common.scrollDown}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
    </section>
  );
}

/* --------------------------------- Yakun --------------------------------- */

/** Tadbir turiga mos yakuniy rasm ustida «Sizni kutamiz!» */
export function GulshanClosing({ view, t }: SectionProps) {
  const art =
    view.eventType === "nikoh" || view.eventType === "fotiha"
      ? ASSETS.closingCouple
      : view.eventType === "sunnat"
        ? ASSETS.closingSunnat
        : ASSETS.closingNeutral;
  return (
    <section className="inv-section inv-section--closing gs-closing" data-section="closing">
      <div className="gs-closing__art">
        <img src={art} alt="" loading="lazy" decoding="async" />
        <div className="gs-closing__text">
          <p className="gs-closing__title">{apos(t.common.waitingYou)}</p>
          <p className="gs-closing__names">{apos(namesJoined(view))}</p>
        </div>
      </div>
      {view.hosts && (
        <p className="inv-closing__hosts">
          {t.common.respectfully}, {view.hosts}
        </p>
      )}
      <ShareRow view={view} t={t} />
    </section>
  );
}
