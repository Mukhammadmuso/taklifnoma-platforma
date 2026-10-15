"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { OpeningProps } from "../contract";
import { toScript } from "@/lib/translit";
import { apos } from "@/components/invitation/Apos";
import { Aril, CutFace, Fruit, rng } from "./decor";
import s from "./opening.module.css";

type Step = "idle" | "press" | "crack" | "open" | "burst";

const TIMELINE: [Step, number][] = [
  ["crack", 150],
  ["open", 480],
  ["burst", 1450],
];
const DONE_AT = 2700;
const DONE_AT_REDUCED = 420;

/** Yorilish chizig'i: tojdan pastgacha, notekis */
const SEAM_PTS: [number, number][] = [
  [200, 30], [204, 96], [196, 140], [206, 186], [195, 232], [205, 278], [194, 324], [204, 370], [198, 440],
];
const SEAM = "M" + SEAM_PTS.map((p) => p.join(" ")).join("L");
const SEAM_TAIL = SEAM_PTS.map((p) => `L${p[0]} ${p[1]}`).join("");
const CLIP_L = `M-120 30${SEAM_TAIL}L-120 440Z`;
const CLIP_R = `M520 30${SEAM_TAIL}L520 440Z`;

/** Sochiladigan donalar: ikki palladan yuqoriga va yon tomonlarga */
const BURST = (() => {
  const rand = rng(99);
  return Array.from({ length: 30 }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      x: 50 + side * (14 + rand() * 30),
      y: 46 + (rand() - 0.5) * 30,
      bx: Math.round(side * (20 + rand() * 160)),
      by: Math.round(-80 - rand() * 300),
      r: Math.round((rand() - 0.5) * 540),
      s: +(0.7 + rand() * 0.8).toFixed(2),
      d: +(rand() * 0.25).toFixed(2),
    };
  });
})();

export default function AnorOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hint = toScript("Anorni ochish uchun bosing", view.script);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("burst");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("press");
    for (const [next, at] of TIMELINE) timers.current.push(setTimeout(() => setStep(next), at));
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  const half = (side: "l" | "r") => (
    <span className={`${s.half} ${side === "l" ? s.left : s.right}`} aria-hidden>
      <svg className={s.front} viewBox="0 0 400 440" overflow="visible">
        <g clipPath={`url(#an-half-${side})`}>
          <use href="#an-fruit" />
        </g>
      </svg>
      <svg className={s.back} viewBox="0 0 400 440">
        <use href="#an-cut" />
      </svg>
    </span>
  );

  return (
    <div className={s.stage} data-step={step} data-reduced={reducedMotion || undefined}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs>
          <Fruit id="an-fruit" />
          <g id="an-cut">
            <CutFace />
          </g>
          <clipPath id="an-half-l">
            <path d={CLIP_L} />
          </clipPath>
          <clipPath id="an-half-r">
            <path d={CLIP_R} />
          </clipPath>
        </defs>
      </svg>

      <div className={s.address} aria-hidden>
        <span className={s.event}>{apos(t.event.eventTitle)}</span>
        <span className={s.to}>{view.guest ? t.common.dear : t.common.dearGuest}</span>
        {view.guest && <span className={s.name}>{apos(view.guest.name)}</span>}
      </div>

      <button type="button" className={s.fruit} onClick={open} aria-label={hint}>
        <span className={s.shadow} aria-hidden />
        <svg className={s.whole} viewBox="0 0 400 440" overflow="visible" aria-hidden>
          <use href="#an-fruit" />
        </svg>
        {half("l")}
        {half("r")}
        <svg className={s.seam} viewBox="0 0 400 440" aria-hidden>
          <path d={SEAM} pathLength={1} fill="none" stroke="#3E0510" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <span className={s.burst} aria-hidden>
          {BURST.map((b, i) => (
            <svg
              key={i}
              viewBox="-12 -12 24 24"
              style={
                {
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  "--bx": `${b.bx}px`,
                  "--by": `${b.by}px`,
                  "--br": `${b.r}deg`,
                  "--bs": b.s,
                  "--bd": `${b.d}s`,
                } as CSSProperties
              }
            >
              <Aril />
            </svg>
          ))}
        </span>
      </button>

      <p className={s.hint} aria-hidden>
        {hint}
      </p>
    </div>
  );
}
