"use client";

import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import type { InvitationView } from "@/lib/view";
import type { TemplateDefinition } from "../contract";
import { anorDecor } from "./decor";
import { display, label, text } from "./fonts";
import { anorMeta } from "./meta";
import AnorOpening from "./Opening";
import styles from "./anor.module.css";

export const anor: TemplateDefinition = {
  ...anorMeta,
  Opening: AnorOpening,
  decor: anorDecor,
  rootClassName: `${display.variable} ${text.variable} ${label.variable} ${styles.root}`,
};

export default function AnorInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={anor} view={view} startOpen={startOpen} />;
}
