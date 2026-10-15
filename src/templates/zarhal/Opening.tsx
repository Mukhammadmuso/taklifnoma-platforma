"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { OpeningProps } from "../contract";
import { apos } from "@/components/invitation/Apos";
import { invitePhrase } from "./sections";
import s from "./opening.module.css";

type Step = "idle" | "fade" | "part";

const PART_AT = 260;
const DONE_AT = 1750;
const DONE_AT_REDUCED = 420;

/** Oltin zarralar: markazdan har tomonga, takrorlanadigan tasodif */
const SPARKS = (() => {
  let a = 77;
  const rand = () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
  return Array.from({ length: 28 }, () => {
    const ang = rand() * Math.PI * 2;
    const dist = 90 + rand() * 260;
    return {
      x: Math.round(Math.cos(ang) * dist),
      y: Math.round(Math.sin(ang) * dist * 0.8 - 40),
      s: +(0.5 + rand() * 1.1).toFixed(2),
      d: +(rand() * 0.25).toFixed(2),
    };
  });
})();

export default function ZarhalOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const greeting = view.guest ? `${t.common.dear} ${view.guest.name}!` : `${t.common.dearGuest}!`;

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("part");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("fade");
    timers.current.push(setTimeout(() => setStep("part"), PART_AT));
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  return (
    <div className={s.stage} data-step={step} data-reduced={reducedMotion || undefined}>
      <div className={`${s.curtain} ${s.left}`} aria-hidden />
      <div className={`${s.curtain} ${s.right}`} aria-hidden />

      <div className={s.sparks} aria-hidden>
        {SPARKS.map((p, i) => (
          <i key={i} style={{ "--x": `${p.x}px`, "--y": `${p.y}px`, "--s": p.s, "--d": `${p.d}s` } as CSSProperties} />
        ))}
      </div>

      <div className={s.content}>
        <svg className={s.star} viewBox="0 0 40 40" aria-hidden>
          <path d="M20 2l4.5 9 9.5-4.5-4.5 9.5 9 4.5-9 4.5 4.5 9.5-9.5-4.5L20 38l-4.5-9-9.5 4.5 4.5-9.5L2 20l9-4.5L6.5 6l9.5 4.5z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="3" fill="currentColor" />
        </svg>
        {view.bismillah && <p className={s.bismillah}>{apos(t.common.bismillah)}</p>}
        <span className={s.rule} aria-hidden />
        <p className={s.greeting}>{apos(greeting)}</p>
        <p className={s.phrase}>{apos(invitePhrase({ view, t }))}</p>
        <button type="button" className={s.btn} onClick={open}>
          {t.common.openInvitation}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
