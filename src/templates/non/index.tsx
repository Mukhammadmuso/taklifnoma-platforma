"use client";

import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import type { InvitationView } from "@/lib/view";
import type { TemplateDefinition } from "../contract";
import { nonDecor } from "./decor";
import { sans, serif } from "./fonts";
import { nonMeta } from "./meta";
import NonOpening from "./Opening";
import styles from "./non.module.css";

export const non: TemplateDefinition = {
  ...nonMeta,
  Opening: NonOpening,
  decor: nonDecor,
  rootClassName: `${serif.variable} ${sans.variable} ${styles.root}`,
};

export default function NonInvitation({ view, startOpen }: { view: InvitationView; startOpen?: boolean }) {
  return <InvitationRenderer template={non} view={view} startOpen={startOpen} />;
}
