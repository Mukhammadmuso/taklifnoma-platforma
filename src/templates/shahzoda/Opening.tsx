"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { OpeningProps } from "../contract";
import { toScript } from "@/lib/translit";
import { apos } from "@/components/invitation/Apos";
import { ARCH_PERCH, DoveShape } from "./decor";
import s from "./opening.module.css";

type Step = "idle" | "lift" | "fly";

const FLY_AT = 240;
const DONE_AT = 2300;
const DONE_AT_REDUCED = 420;

type Spot = { at: "apex" | "shoulderL" | "shoulderR" | "sill"; t?: number; flip: boolean; fx: number; fy: number; fr: number; fd: number };

/**
 * Kaptarlar: qayerda o'tiradi, qaysi tomonga qaraydi, qayerga uchadi.
 * fx — ekran enining %, fy — balandligining %, fd — kechikish (s).
 */
const FLOCK: Spot[] = [
  { at: "apex", flip: true, fx: -22, fy: -70, fr: -8, fd: 0.12 },
  { at: "shoulderL", flip: true, fx: -75, fy: -42, fr: -14, fd: 0 },
  { at: "shoulderR", flip: false, fx: 75, fy: -48, fr: 12, fd: 0.06 },
  { at: "sill", t: 0.13, flip: true, fx: -85, fy: -62, fr: -12, fd: 0.2 },
  { at: "sill", t: 0.35, flip: false, fx: 36, fy: -100, fr: 10, fd: 0.3 },
  { at: "sill", t: 0.63, flip: true, fx: -40, fy: -104, fr: -10, fd: 0.24 },
  { at: "sill", t: 0.87, flip: false, fx: 88, fy: -66, fr: 14, fd: 0.16 },
];

type Perch = { x: number; y: number; size: number; tilt: number };

export default function ShahzodaOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const [perches, setPerches] = useState<Perch[] | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hint = toScript("Ochish uchun bosing", view.script);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** Kaptarlar sahifadagi haqiqiy arka ustiga qo'nadi: arka o'lchanadi */
  const measure = useCallback((): Perch[] | null => {
    const arch = document.querySelector<HTMLElement>(".sh-arch");
    const sill = arch?.querySelector<HTMLElement>(".sh-arch__sill");
    if (!arch || !sill) return null;
    const r = arch.getBoundingClientRect();
    const sl = sill.getBoundingClientRect();
    const k = r.width / 320;
    const size = Math.max(50, Math.min(80, r.width * 0.18));
    const [sx, sy] = ARCH_PERCH.shoulder;
    return FLOCK.map((d) => {
      switch (d.at) {
        case "apex":
          return { x: r.left + 160 * k, y: r.top + 5 * k, size, tilt: 0 };
        case "shoulderL":
          return { x: r.left + sx * k, y: r.top + sy * k, size, tilt: -9 };
        case "shoulderR":
          return { x: r.right - sx * k, y: r.top + sy * k, size, tilt: 9 };
        default:
          return { x: sl.left + (d.t ?? 0.5) * sl.width, y: sl.top + 1, size, tilt: 0 };
      }
    });
  }, []);

  useLayoutEffect(() => {
    const run = () => setPerches(measure());
    run();
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, [measure]);

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("fly");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("lift");
    timers.current.push(setTimeout(() => setStep("fly"), FLY_AT));
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  return (
    <button type="button" className={s.stage} data-step={step} data-reduced={reducedMotion || undefined} onClick={open} aria-label={hint}>
      <span className={s.address} aria-hidden>
        <span className={s.event}>{apos(t.event.eventTitle)}</span>
        <span className={s.to}>{view.guest ? t.common.dear : t.common.dearGuest}</span>
        {view.guest && <span className={s.name}>{apos(view.guest.name)}</span>}
        <span className={s.hint}>{hint}</span>
      </span>

      {perches?.map((p, i) => {
        const d = FLOCK[i];
        return (
          <span
            key={i}
            className={s.dove}
            aria-hidden
            style={
              {
                left: p.x - p.size / 2,
                top: p.y - (p.size * 42) / 60,
                width: p.size,
                "--tilt": `${p.tilt}deg`,
                "--fx": `${d.fx}vw`,
                "--fy": `${d.fy}vh`,
                "--fr": `${d.fr}deg`,
                "--fd": `${d.fd}s`,
                "--bob": `${(i * 0.53) % 2.4}s`,
              } as CSSProperties
            }
          >
            <svg viewBox="0 0 60 44" className={d.flip ? s.flip : undefined}>
              <DoveShape />
            </svg>
          </span>
        );
      })}
    </button>
  );
}
