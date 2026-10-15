"use client";

import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { HeroSection } from "@/components/invitation/sections";
import type { InvitationView } from "@/lib/view";
import type { SectionProps, TemplateDefinition } from "../contract";
import { HeroArch, shahzodaDecor } from "./decor";
import { ShahzodaClosing } from "./sections";
import { caps, display, text } from "./fonts";
import { shahzodaMeta } from "./meta";
import ShahzodaOpening from "./Opening";
import styles from "./shahzoda.module.css";

/** Bosh ekran firuza arka ichida: kaptarlar shu arka ustida o'tiradi */
function ShahzodaHero(props: SectionProps) {
  return (
    <div className="sh-hero">
      <HeroArch />
      <HeroSection {...props} />
    </div>
  );
}

export const shahzoda: TemplateDefinition = {
  ...shahzodaMeta,
  Opening: ShahzodaOpening,
  decor: shahzodaDecor,
  sections: { hero: ShahzodaHero, closing: ShahzodaClosing },
  rootClassName: `${display.variable} ${caps.variable} ${text.variable} ${styles.root}`,
};

export default function ShahzodaInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={shahzoda} view={view} startOpen={startOpen} />;
}
