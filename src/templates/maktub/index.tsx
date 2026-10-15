"use client";

import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import type { InvitationView } from "@/lib/view";
import type { TemplateDefinition } from "../contract";
import { maktubDecor } from "./decor";
import { body, label, script } from "./fonts";
import { maktubMeta } from "./meta";
import MaktubOpening from "./Opening";
import styles from "./maktub.module.css";

export const maktub: TemplateDefinition = {
  ...maktubMeta,
  Opening: MaktubOpening,
  decor: maktubDecor,
  rootClassName: `${script.variable} ${body.variable} ${label.variable} ${styles.root}`,
};

export default function MaktubInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={maktub} view={view} startOpen={startOpen} />;
}
