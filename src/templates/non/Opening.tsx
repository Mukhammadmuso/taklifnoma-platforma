"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { OpeningProps } from "../contract";
import { initialsOf } from "@/lib/view";
import { toScript } from "@/lib/translit";
import { apos } from "@/components/invitation/Apos";
import { LOAF_PATH, PhotoLoaf } from "./decor";
import s from "./opening.module.css";

type Step = "idle" | "press" | "crack" | "split" | "away";

/** Bosqichlar vaqti (ms, bosilgan paytdan boshlab) */
const TIMELINE: [Step, number][] = [
  ["crack", 150],
  ["split", 560],
  ["away", 1250],
];
const DONE_AT = 2350;
const DONE_AT_REDUCED = 420;

/** Sinish chizig'i: nonning tepasidan pastigacha, qo'lda ushatilgandek notekis */
const CRACK_PTS: [number, number][] = [
  [203, -10], [197, 36], [208, 76], [192, 118], [206, 158], [195, 200],
  [209, 240], [193, 282], [205, 322], [194, 362], [202, 410],
];
const CRACK = "M" + CRACK_PTS.map((p) => p.join(" ")).join("L");
const CRACK_TAIL = CRACK_PTS.map((p) => `L${p[0]} ${p[1]}`).join("");
const CLIP_L = `M-80 -10${CRACK_TAIL}L-80 410Z`;
const CLIP_R = `M480 -10${CRACK_TAIL}L480 410Z`;

/** Ushoqlar: sinish chizig'i bo'ylab, ikki tomonga sochiladi */
const CRUMBS = [
  [198, 70, -70, 60, -40, 4], [206, 104, 84, 72, 55, 3.2], [196, 140, -96, 96, 80, 5],
  [207, 176, 66, 110, -30, 3.6], [194, 214, -58, 130, 120, 4.4], [208, 250, 104, 120, 70, 3],
  [196, 286, -84, 150, -90, 3.8], [205, 318, 72, 160, 40, 4.6], [199, 344, -40, 170, 150, 3],
  [203, 52, 50, 40, 20, 2.6], [195, 236, -120, 90, -60, 2.8], [210, 300, 120, 140, 100, 2.6],
] as const;

function crumbPath(x: number, y: number, r: number) {
  return `M${x - r} ${y - r * 0.3}L${x - r * 0.2} ${y - r}L${x + r} ${y - r * 0.4}L${x + r * 0.6} ${y + r * 0.8}L${x - r * 0.7} ${y + r * 0.6}Z`;
}

export default function NonOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const initials = initialsOf(view.name1, view.name2);
  const hint = toScript("Nonni ushatish uchun bosing", view.script);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("away");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("press");
    for (const [next, at] of TIMELINE) timers.current.push(setTimeout(() => setStep(next), at));
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  const half = (side: "l" | "r") => (
    <svg className={`${s.half} ${side === "l" ? s.left : s.right}`} viewBox="0 0 400 400" aria-hidden>
      <g clipPath={`url(#nn-half-${side})`}>
        <use href="#nn-loaf" />
        {/* Ushatilgan chet: nonning oq ichi ko'rinadi */}
        <g clipPath="url(#nn-loaf-clip)" className={s.torn}>
          <path d={CRACK} fill="none" stroke="#F4DEAA" strokeWidth="11" strokeLinejoin="round" />
          <path d={CRACK} fill="none" stroke="#C78F4A" strokeWidth="9" strokeDasharray="1.2 4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        </g>
      </g>
    </svg>
  );

  return (
    <div className={s.stage} data-step={step} data-reduced={reducedMotion || undefined}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs>
          <PhotoLoaf id="nn-loaf" initials={initials} />
          <clipPath id="nn-half-l">
            <path d={CLIP_L} />
          </clipPath>
          <clipPath id="nn-half-r">
            <path d={CLIP_R} />
          </clipPath>
          <clipPath id="nn-loaf-clip">
            <path d={LOAF_PATH} />
          </clipPath>
        </defs>
      </svg>

      <div className={s.address} aria-hidden>
        <span className={s.event}>{apos(t.event.eventTitle)}</span>
        <span className={s.to}>{view.guest ? t.common.dear : t.common.dearGuest}</span>
        {view.guest && <span className={s.name}>{apos(view.guest.name)}</span>}
      </div>

      <button type="button" className={s.loaf} onClick={open} aria-label={hint}>
        <span className={s.shadow} aria-hidden />
        {/* Butun non: yarmlar faqat yorilganda ko'rinadi (o'rtada chok qolmasin) */}
        <svg className={s.whole} viewBox="0 0 400 400" aria-hidden>
          <use href="#nn-loaf" />
        </svg>
        {half("l")}
        {half("r")}
        <svg className={s.crack} viewBox="0 0 400 400" aria-hidden>
          <path d={CRACK} pathLength={1} fill="none" stroke="#4A1E06" strokeWidth="2.4" strokeLinejoin="round" clipPath="url(#nn-loaf-clip)" />
        </svg>
        <svg className={s.crumbs} viewBox="0 0 400 400" aria-hidden>
          {CRUMBS.map(([x, y, dx, dy, r, size], i) => (
            <path
              key={i}
              d={crumbPath(x, y, size)}
              fill={i % 3 === 0 ? "#B9702C" : "#EDCB8C"}
              style={{ "--dx": `${dx}px`, "--dy": `${dy}px`, "--r": `${r}deg`, "--d": `${(i % 4) * 40}ms` } as CSSProperties}
            />
          ))}
        </svg>
        <svg className={s.steam} viewBox="0 0 400 400" aria-hidden>
          <g fill="none" stroke="#FFF8EA" strokeLinecap="round" strokeWidth="9" filter="url(#nn-soft)">
            <path pathLength={1} d="M186 180C170 140 204 116 186 76S196 20 182 -20" />
            <path pathLength={1} d="M206 200C222 160 190 130 210 92S200 30 214 -10" />
            <path pathLength={1} d="M198 150C188 120 212 96 198 60" />
          </g>
        </svg>
      </button>

      <p className={s.hint} aria-hidden>
        {hint}
      </p>
    </div>
  );
}
