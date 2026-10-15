"use client";

import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import type { InvitationView } from "@/lib/view";
import type { TemplateDefinition } from "../contract";
import { gulshanDecor } from "./decor";
import { script, serif } from "./fonts";
import { gulshanMeta } from "./meta";
import GulshanOpening from "./Opening";
import { GulshanClosing, GulshanHero } from "./sections";
import styles from "./gulshan.module.css";

export const gulshan: TemplateDefinition = {
  ...gulshanMeta,
  Opening: GulshanOpening,
  decor: gulshanDecor,
  sections: { hero: GulshanHero, closing: GulshanClosing },
  rootClassName: `${script.variable} ${serif.variable} ${styles.root}`,
};

export default function GulshanInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={gulshan} view={view} startOpen={startOpen} />;
}
