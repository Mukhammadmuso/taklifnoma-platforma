"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { InvitationView } from "@/lib/view";

export type PreviewHandle = { replay: () => void };

/**
 * Jonli ko'rinish: /oldindan-korish iframe'iga har o'zgarishda ma'lumot yuboradi.
 * Iframe — haqiqiy telefon kabi o'z 100svh balandligiga ega, shuning uchun dizayn aynan mehmondagidek chiziladi.
 */
export const PhonePreview = forwardRef<
  PreviewHandle,
  { view: InvitationView; focus?: string; className?: string; title?: string }
>(function PhonePreview({ view, focus, className, title = "Taklifnoma ko‘rinishi" }, ref) {
    const frame = useRef<HTMLIFrameElement>(null);
    const replayCount = useRef(0);
    const latest = useRef(view);
    latest.current = view;
    const latestFocus = useRef(focus);
    latestFocus.current = focus;

    const send = useCallback((replay?: number) => {
      frame.current?.contentWindow?.postMessage(
        { type: "taklifnoma:view", view: latest.current, focus: latestFocus.current, ...(replay !== undefined ? { replay } : {}) },
        window.location.origin,
      );
    }, []);

    // Iframe tayyor bo'lganda birinchi ma'lumot
    useEffect(() => {
      const onMessage = (e: MessageEvent) => {
        if (e.origin === window.location.origin && e.data?.type === "taklifnoma:ready" && e.source === frame.current?.contentWindow) {
          send(replayCount.current);
        }
      };
      window.addEventListener("message", onMessage);
      return () => window.removeEventListener("message", onMessage);
    }, [send]);

    // Har o'zgarishda (bir kadrda bir marta)
    useEffect(() => {
      const id = requestAnimationFrame(() => send());
      return () => cancelAnimationFrame(id);
    }, [view, focus, send]);

    useImperativeHandle(ref, () => ({
      replay: () => {
        replayCount.current += 1;
        send(replayCount.current);
      },
    }));

    return <iframe ref={frame} src="/oldindan-korish" title={title} className={className} />;
});
