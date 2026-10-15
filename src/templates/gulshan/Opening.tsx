"use client";

import { useEffect, useRef, useState } from "react";
import type { OpeningProps } from "../contract";
import { initialsOf } from "@/lib/view";
import { toScript } from "@/lib/translit";
import { apos } from "@/components/invitation/Apos";
import { ASSETS, WaxSeal } from "./decor";
import s from "./opening.module.css";

type Step = "idle" | "press" | "glow" | "open";

const TIMELINE: [Step, number][] = [
  ["glow", 140],
  ["open", 520],
];
const DONE_AT = 1800;
const DONE_AT_REDUCED = 420;

/**
 * Konvert — haqiqiy rasm (envelope-front.webp), to'rt uchburchakka "X" bo'ylab kesilgan.
 * Har qanot aslida bitta rasmning o'zi, faqat clip-path bilan o'z burchagiga cheklangan —
 * shuning uchun to'rttasi birga bitta butun konvert rasmini hosil qiladi.
 * Muhr bosilganda ichidan nur (inside-glow.webp) chiqadi va qanotlar to'rt tomonga ochiladi.
 */
export default function GulshanOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const hint = toScript("Ochish uchun muhrni bosing", view.script);

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("open");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("press");
    for (const [next, at] of TIMELINE) timers.current.push(setTimeout(() => setStep(next), at));
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  return (
    <div className={s.stage} data-step={step} data-reduced={reducedMotion || undefined}>
      <img className={s.glow} src={ASSETS.glow} alt="" aria-hidden />
      <div className={`${s.flap} ${s.top}`} aria-hidden>
        <p className={s.to}>
          <span>{view.guest ? t.common.dear : t.common.dearGuest}</span>
          {view.guest && <strong>{apos(view.guest.name)}</strong>}
        </p>
      </div>
      <div className={`${s.flap} ${s.left}`} aria-hidden />
      <div className={`${s.flap} ${s.right}`} aria-hidden />
      <div className={`${s.flap} ${s.bottom}`} aria-hidden>
        <p className={s.hint}>{hint}</p>
      </div>
      <button type="button" className={s.seal} onClick={open} aria-label={hint}>
        <WaxSeal initials={initialsOf(view.name1, view.name2)} className={s.sealSvg} />
      </button>
    </div>
  );
}
