"use client";

import type { SectionProps } from "../contract";
import { apos } from "@/components/invitation/Apos";
import { namesJoined, ShareRow } from "@/components/invitation/sections";

const CLOSING_ART = "/templates/shahzoda/closing-sunnat.webp";

/** Sunnat to'yi uchun yakuniy rasm: bola kaptarlar ostida arka tomon ketayapti */
export function ShahzodaClosing({ view, t }: SectionProps) {
  return (
    <section className="inv-section inv-section--closing sh-closing" data-section="closing">
      <div className="sh-closing__art">
        <img src={CLOSING_ART} alt="" loading="lazy" decoding="async" />
        <div className="sh-closing__text">
          <p className="sh-closing__title">{apos(t.common.waitingYou)}</p>
          <p className="sh-closing__names">{apos(namesJoined(view))}</p>
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
