"use client";

import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import type { InvitationView } from "@/lib/view";
import type { TemplateDefinition } from "../contract";
import { zarhalDecor } from "./decor";
import { display, label } from "./fonts";
import { zarhalMeta } from "./meta";
import ZarhalOpening from "./Opening";
import { ZarhalClosing, ZarhalHero, ZarhalInvite } from "./sections";
import styles from "./zarhal.module.css";

export const zarhal: TemplateDefinition = {
  ...zarhalMeta,
  Opening: ZarhalOpening,
  decor: zarhalDecor,
  sections: { hero: ZarhalHero, invite: ZarhalInvite, closing: ZarhalClosing },
  rootClassName: `${display.variable} ${label.variable} ${styles.root}`,
};

export default function ZarhalInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={zarhal} view={view} startOpen={startOpen} />;
}
