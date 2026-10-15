"use client";

import { useEffect, useState } from "react";
import type { InvitationView } from "@/lib/view";
import { TemplateView } from "@/templates/loaders";

type Msg = { type: "taklifnoma:view"; view: InvitationView; replay?: number; focus?: string };

/**
 * Muharrir ichidagi telefon ko'rinishi (iframe).
 * Ma'lumot faqat shu saytning o'zidan (same-origin) postMessage orqali qabul qilinadi.
 */
export function Preview() {
  const [view, setView] = useState<InvitationView | null>(null);
  const [replay, setReplay] = useState(0);
  const [focus, setFocus] = useState<string | undefined>();

  useEffect(() => {
    const onMessage = (e: MessageEvent<Msg>) => {
      if (e.origin !== window.location.origin || e.data?.type !== "taklifnoma:view") return;
      setView(e.data.view);
      setFocus(e.data.focus);
      if (typeof e.data.replay === "number") setReplay(e.data.replay);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "taklifnoma:ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Muharrirdagi bosqichga mos bo'limga aylantirish
  useEffect(() => {
    if (!focus || replay > 0) return;
    const id = requestAnimationFrame(() => {
      if (focus === "hero") return window.scrollTo({ top: 0, behavior: "smooth" });
      const el = document.querySelector(`[data-section="${focus}"]:not([data-clone] *)`);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [focus, replay, view?.templateId]);

  if (!view) {
    return <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", fontFamily: "system-ui", color: "#6f6a64" }}>Yuklanmoqda…</div>;
  }
  // replay > 0: ochilish ekranini qayta ko'rsatish (yangi kalit = yangi holat)
  return <TemplateView key={`${view.templateId}-${replay}`} templateId={view.templateId} view={view} startOpen={replay === 0} />;
}
