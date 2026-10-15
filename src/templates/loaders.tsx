"use client";

/**
 * DIZAYN KOMPONENTLARI — har biri faqat kerak bo'lganda yuklanadi (JS, CSS, shriftlar).
 * Yangi dizayn: registry.ts dagi TEMPLATES ro'yxatiga va shu yerdagi VIEWS ga bittadan qator.
 *
 * next/dynamic mijoz komponentida ishlatiladi: server sahifalarda oddiy import() qilinsa,
 * Next barcha dizaynlarning CSS'ini har sahifaga <script> sifatida ham qo'shib yuboradi.
 */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { InvitationView } from "@/lib/view";
import { TEMPLATES } from "./registry";

type Props = { view: InvitationView; startOpen?: boolean };

const VIEWS: Record<string, ComponentType<Props>> = {
  maktub: dynamic(() => import("./maktub")),
  non: dynamic(() => import("./non")),
  shahzoda: dynamic(() => import("./shahzoda")),
  chinor: dynamic(() => import("./chinor")),
  anor: dynamic(() => import("./anor")),
  zarhal: dynamic(() => import("./zarhal")),
  gulshan: dynamic(() => import("./gulshan")),
};

export function TemplateView({ templateId, ...props }: Props & { templateId: string }) {
  const View = VIEWS[templateId] ?? VIEWS[TEMPLATES[0].id];
  return <View {...props} />;
}
