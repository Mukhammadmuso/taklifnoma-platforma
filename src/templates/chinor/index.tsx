"use client";

import type { CSSProperties } from "react";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { HeroSection } from "@/components/invitation/sections";
import type { InvitationView } from "@/lib/view";
import type { SectionProps, TemplateDefinition } from "../contract";
import { chinorDecor, LEAF_COLORS } from "./decor";
import { caps, serif } from "./fonts";
import { chinorMeta } from "./meta";
import ChinorOpening from "./Opening";
import styles from "./chinor.module.css";

/** Bosh ekranda vaqti-vaqti bilan bittadan barg to'kiladi (harakatsiz rejimda yo'q) */
const DRIFT = [
  { left: "12%", d: "13s", w: "0.4s", c: 3 },
  { left: "78%", d: "15s", w: "4.2s", c: 1 },
  { left: "40%", d: "17s", w: "8.5s", c: 4 },
  { left: "64%", d: "14s", w: "11s", c: 6 },
];

function ChinorHero(props: SectionProps) {
  return (
    <div className="ch-hero">
      <div className="ch-drift" aria-hidden>
        {DRIFT.map((l, i) => (
          <svg key={i} viewBox="0 0 100 100" style={{ left: l.left, color: LEAF_COLORS[l.c], "--d": l.d, "--w": l.w } as CSSProperties}>
            <use href="#ch-leaf" />
          </svg>
        ))}
      </div>
      <HeroSection {...props} />
    </div>
  );
}

export const chinor: TemplateDefinition = {
  ...chinorMeta,
  Opening: ChinorOpening,
  decor: chinorDecor,
  sections: { hero: ChinorHero },
  rootClassName: `${serif.variable} ${caps.variable} ${styles.root}`,
};

export default function ChinorInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={chinor} view={view} startOpen={startOpen} />;
}
