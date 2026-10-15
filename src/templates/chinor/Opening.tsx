"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { OpeningProps } from "../contract";
import { toScript } from "@/lib/translit";
import { apos } from "@/components/invitation/Apos";
import { LEAF_COLORS, RingDisc, rng } from "./decor";
import s from "./opening.module.css";

type Step = "idle" | "rustle" | "fall";

const FALL_AT = 180;
const DONE_AT = 2700;
const DONE_AT_REDUCED = 420;

/** Barg qatlami: ekranni zich qoplaydi. Takrorlanadigan tasodif — server va brauzerda bir xil */
const CANOPY = (() => {
  const rand = rng(2027);
  const cols = 6;
  const rows = 8;
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5 + (rand() - 0.5) * 0.9) / cols) * 100;
      const y = ((r + 0.5 + (rand() - 0.5) * 0.9) / rows) * 100;
      out.push({
        x: +x.toFixed(2),
        y: +y.toFixed(2),
        size: +(30 + rand() * 20).toFixed(2),
        r0: Math.round(rand() * 360),
        color: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)],
        sx: Math.round((rand() - 0.5) * 36),
        spin: Math.round((rand() > 0.5 ? 1 : -1) * (200 + rand() * 340)),
        delay: (rand() * 0.55 + (1 - y / 100) * 0.25).toFixed(2),
        dur: (1.5 + rand() * 0.7).toFixed(2),
        z: Math.floor(rand() * 3),
      });
    }
  }
  return out;
})();

export default function ChinorOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hint = toScript("Ochish uchun bosing", view.script);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("fall");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("rustle");
    timers.current.push(setTimeout(() => setStep("fall"), FALL_AT));
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  return (
    <button type="button" className={s.stage} data-step={step} data-reduced={reducedMotion || undefined} onClick={open} aria-label={hint}>
      <span className={s.canopy} aria-hidden>
        {CANOPY.map((l, i) => (
          <svg
            key={i}
            className={s.leaf}
            viewBox="0 0 100 100"
            data-z={l.z}
            style={
              {
                left: `${l.x}%`,
                top: `${l.y}%`,
                "--s": l.size,
                color: l.color,
                "--r0": `${l.r0}deg`,
                "--sx": `${l.sx}vw`,
                "--spin": `${l.spin}deg`,
                "--dl": `${l.delay}s`,
                "--du": `${l.dur}s`,
                "--bd": `${(i % 7) * 0.6}s`,
              } as CSSProperties
            }
          >
            <use href="#ch-leaf" />
          </svg>
        ))}
      </span>

      <span className={s.center}>
        <span className={s.disc}>
          <RingDisc className={s.discSvg} />
          <span className={s.address} aria-hidden>
            <span className={s.event}>{apos(t.event.eventTitle)}</span>
            <span className={s.to}>{view.guest ? t.common.dear : t.common.dearGuest}</span>
            {view.guest && <span className={s.name}>{apos(view.guest.name)}</span>}
          </span>
        </span>
        <span className={s.hint} aria-hidden>
          {hint}
        </span>
      </span>
    </button>
  );
}
