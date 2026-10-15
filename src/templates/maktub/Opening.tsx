"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { OpeningProps } from "../contract";
import { initialsOf } from "@/lib/view";
import { HeroSection } from "@/components/invitation/sections";
import { apos } from "@/components/invitation/Apos";
import { maktubDecor, WaxSeal } from "./decor";
import s from "./opening.module.css";

type Step = "idle" | "press" | "crack" | "open" | "rise" | "out";

/** Bosqichlar vaqti (ms, bosilgan paytdan boshlab) */
const TIMELINE: [Step, number][] = [
  ["crack", 140],
  ["open", 560],
  ["rise", 1300],
  ["out", 2250],
];
const DONE_AT = 3200;

type Geo = { x: number; y: number; s: number; lw: number; rise: number; clipIdle: number; clipRise: number; tx?: number; ty?: number };
const DONE_AT_REDUCED = 420;

export default function MaktubOpening({ view, t, reducedMotion, onOpen, onDone }: OpeningProps) {
  const [step, setStep] = useState<Step>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const initials = initialsOf(view.name1, view.name2);
  const envRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /**
   * Xat — sahifa bosh ekranining aynan nusxasi, kichraytirilgan holda konvert ichida.
   * Oxirida u haqiqiy varaq turgan joyga, asl o'lchamiga qaytadi va sahifaga aylanadi.
   */
  const measure = useCallback((): Geo | null => {
    const env = envRef.current;
    const letter = letterRef.current;
    const sheet = document.querySelector<HTMLElement>(".inv-sheet:not([data-clone])");
    if (!env || !letter || !sheet) return null;
    const lw = sheet.getBoundingClientRect().width;
    const lh = letter.offsetHeight;
    const ew = env.offsetWidth;
    const eh = env.offsetHeight;
    const sc = (ew * 0.9) / lw;
    const x = ew * 0.05;
    const y = eh * 0.03;
    const rise = eh * 0.6;
    return {
      x, y, s: sc, lw, rise,
      clipIdle: Math.max(0, lh - (eh - y) / sc),
      clipRise: Math.max(0, lh - (eh - y + rise) / sc),
    };
  }, []);

  useLayoutEffect(() => {
    const run = () => setGeo((g) => ({ ...(measure() ?? g!), tx: g?.tx, ty: g?.ty }));
    run();
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, [measure]);

  /** Chiqish nuqtasi: varaqning ekrandagi joyi, konvertga nisbatan */
  const aimAtSheet = () => {
    const env = envRef.current?.getBoundingClientRect();
    const sheet = document.querySelector<HTMLElement>(".inv-sheet:not([data-clone])")?.getBoundingClientRect();
    if (!env || !sheet) return;
    setGeo((g) => (g ? { ...g, tx: sheet.left - env.left, ty: sheet.top - env.top } : g));
  };

  const open = () => {
    if (step !== "idle") return;
    onOpen();
    if (reducedMotion) {
      setStep("out");
      timers.current.push(setTimeout(onDone, DONE_AT_REDUCED));
      return;
    }
    setStep("press");
    for (const [next, at] of TIMELINE)
      timers.current.push(
        setTimeout(() => {
          if (next === "out") aimAtSheet();
          setStep(next);
        }, at),
      );
    timers.current.push(setTimeout(onDone, DONE_AT));
  };

  return (
    <div className={s.stage} data-step={step} data-reduced={reducedMotion || undefined}>
      <div className={s.light} aria-hidden />
      <div className={s.envWrap}>
        <div className={s.env} ref={envRef} onClick={open}>
          {/* 1. Konvert ichi (bordo qavat) */}
          <svg className={s.back} viewBox="0 0 500 700" aria-hidden>
            <rect width="500" height="700" fill="url(#mk-khatam)" />
            <rect width="500" height="700" fill="url(#mk-env-inner-shade)" />
            <defs>
              <linearGradient id="mk-env-inner-shade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1A0206" stopOpacity="0.55" />
                <stop offset="0.35" stopColor="#1A0206" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* 2. Xat: bosh ekranning aynan o'zi */}
          <div
            ref={letterRef}
            className={s.letter}
            aria-hidden
            inert
            data-ready={geo ? true : undefined}
            style={
              geo
                ? ({
                    "--lw": `${geo.lw}px`,
                    "--x": `${geo.x}px`,
                    "--y": `${geo.y}px`,
                    "--s": geo.s,
                    "--rise": `${geo.rise}px`,
                    "--clip-idle": `${geo.clipIdle}px`,
                    "--clip-rise": `${geo.clipRise}px`,
                    "--tx": `${geo.tx ?? 0}px`,
                    "--ty": `${geo.ty ?? 0}px`,
                  } as CSSProperties)
                : undefined
            }
          >
            <div className={`inv-sheet ${s.letterSheet}`} data-clone>
              <maktubDecor.Corner className="inv-corner inv-corner--tl" />
              <maktubDecor.Corner className="inv-corner inv-corner--tr" />
              <HeroSection view={view} t={t} decor={maktubDecor} reducedMotion />
            </div>
          </div>

          {/* 3. Cho'ntak: chap, o'ng va pastki qanotlar */}
          <svg className={s.pocket} viewBox="0 0 500 700" aria-hidden>
            <defs>
              <linearGradient id="mk-flap-l" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#EADFCB" />
                <stop offset="1" stopColor="#F5EDDF" />
              </linearGradient>
              <linearGradient id="mk-flap-r" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0" stopColor="#E3D6BF" />
                <stop offset="1" stopColor="#EFE5D3" />
              </linearGradient>
              <linearGradient id="mk-flap-b" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F8F1E4" />
                <stop offset="1" stopColor="#ECE1CE" />
              </linearGradient>
              <filter id="mk-flap-shadow" x="-5%" y="-10%" width="110%" height="120%">
                <feDropShadow dx="0" dy="-3" stdDeviation="4" floodColor="#4A2A10" floodOpacity="0.18" />
              </filter>
            </defs>
            <g filter="url(#mk-grain)">
              <path d="M0 0L240 322Q250 334 246 352L0 700Z" fill="url(#mk-flap-l)" />
              <path d="M500 0L260 322Q250 334 254 352L500 700Z" fill="url(#mk-flap-r)" />
              <path
                d="M0 700L234 362Q250 342 266 362L500 700Z"
                fill="url(#mk-flap-b)"
                filter="url(#mk-flap-shadow)"
              />
            </g>
            <g fill="none" stroke="#A57C34" strokeLinejoin="round">
              <path d="M40 688L250 384L460 688" strokeWidth="1.1" />
              <path d="M56 688L250 404L444 688" strokeWidth="0.5" />
            </g>
            <path d="M0 0L240 322M500 0L260 322" stroke="#8C6A48" strokeOpacity="0.18" strokeWidth="1" />
          </svg>

          <div className={s.address} aria-hidden>
            <span className={s.addressTo}>{view.guest ? t.common.dear : t.common.dearGuest}</span>
            {view.guest && <span className={s.addressName}>{apos(view.guest.name)}</span>}
          </div>

          {/* 4. Qopqoq: old tomoni qog'oz, orqa tomoni bordo qavat */}
          <div className={s.flap}>
            <svg className={s.flapFront} viewBox="0 0 500 380" aria-hidden>
              <defs>
                <linearGradient id="mk-flap-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#EFE6D5" />
                  <stop offset="1" stopColor="#F7F0E3" />
                </linearGradient>
                <filter id="mk-flap-top-shadow" x="-5%" y="-5%" width="110%" height="120%">
                  <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#3A1E0A" floodOpacity="0.22" />
                </filter>
              </defs>
              <g filter="url(#mk-flap-top-shadow)">
                <path d="M0 0H500L266 352Q250 374 234 352Z" fill="url(#mk-flap-top)" filter="url(#mk-grain)" />
              </g>
              <path
                d="M30 12H470L256 334Q250 343 244 334Z"
                fill="none"
                stroke="#A57C34"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <path
                d="M48 22H452L253 320Q250 325 247 320Z"
                fill="none"
                stroke="#A57C34"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
            <svg className={s.flapBack} viewBox="0 0 500 380" aria-hidden>
              <path d="M0 0H500L266 352Q250 374 234 352Z" fill="url(#mk-khatam)" />
              <path d="M0 0H500L266 352Q250 374 234 352Z" fill="none" stroke="#D9BC78" strokeOpacity="0.5" strokeWidth="2" />
            </svg>
          </div>

          {/* 5. Muhr — asosiy harakat */}
          <button type="button" className={s.seal} onClick={(e) => { e.stopPropagation(); open(); }} aria-label={t.common.open}>
            <span className={s.pulse} aria-hidden />
            <WaxSeal initials={initials} broken className={s.sealSvg} />
          </button>
        </div>
      </div>
      <p className={s.hint}>{t.common.open}</p>
    </div>
  );
}
