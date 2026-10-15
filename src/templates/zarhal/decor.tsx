"use client";

/**
 * Zarhal bezaklari — oltin chiziqli original SVG: islimi jingalaklari, sakkiz bargli medalyon,
 * gumbazli peshtoq chizmasi. To'q rang mavzuga qarab CSS o'zgaruvchisidan olinadi (--zh-deep).
 */
import type { CSSProperties } from "react";
import type { DecorSet } from "../contract";

const GOLD = "#B8913A";
const GOLD_LIGHT = "#E2C67F";
const deep: CSSProperties = { fill: "var(--zh-deep)" };

const f = (n: number) => n.toFixed(2);

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Sakkiz bargli guldasta (medalyon ichi): barglar R0..R1 oralig'ida */
function rosette(cx: number, cy: number, r0: number, r1: number, n = 8) {
  let d = "";
  for (let k = 0; k < n; k++) {
    const a = (k * 360) / n;
    const [x0, y0] = polar(cx, cy, r0, a - 180 / n);
    const [x1, y1] = polar(cx, cy, r0, a + 180 / n);
    const [tx, ty] = polar(cx, cy, r1, a);
    const [c0x, c0y] = polar(cx, cy, r1 * 1.02, a - 180 / n / 1.6);
    const [c1x, c1y] = polar(cx, cy, r1 * 1.02, a + 180 / n / 1.6);
    d += `M${f(x0)} ${f(y0)}Q${f(c0x)} ${f(c0y)} ${f(tx)} ${f(ty)}Q${f(c1x)} ${f(c1y)} ${f(x1)} ${f(y1)}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */

/** Burchak: ikki qator oltin qavs va islimi jingalagi */
function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden fill="none" strokeLinecap="round">
      <path d="M8 70V16Q8 8 16 8H70" stroke={GOLD} strokeWidth="1.4" />
      <path d="M17 58V22Q17 17 22 17H58" stroke={GOLD} strokeWidth="0.8" opacity="0.8" />
      <path d="M27 27C38 26 42 37 37 43C32 49 23 44 27 38C30 34 35 37 33 40" stroke={GOLD} strokeWidth="1.1" />
      <path d="M27 27C30 22 36 20 42 21M27 27C22 30 20 36 21 42" stroke={GOLD} strokeWidth="0.8" />
      <circle cx="70" cy="8" r="2" fill={GOLD} />
      <circle cx="8" cy="70" r="2" fill={GOLD} />
    </svg>
  );
}

/** Ajratgich: markazda romb, ikki tomonda ko'zgudek islimi jingalaklari */
function Divider({ className }: { className?: string }) {
  const half = (
    <g fill="none" stroke={GOLD} strokeLinecap="round">
      <path d="M121 20H98" strokeWidth="1.1" />
      <path d="M98 20C90 20 86 11 78 11C70 11 68 21 75 23C81 25 84 17 78 16" strokeWidth="1.1" />
      <path d="M98 20C90 21 86 28 79 29" strokeWidth="0.8" />
      <path d="M66 20H12" strokeWidth="0.7" opacity="0.7" />
      <circle cx="12" cy="20" r="1.6" fill={GOLD} stroke="none" />
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 260 40" aria-hidden>
      {half}
      <g transform="translate(260 0) scale(-1 1)">{half}</g>
      <path d="M130 13l7 7-7 7-7-7z" fill="none" stroke={GOLD} strokeWidth="1.1" />
      <path d="M130 17l3 3-3 3-3-3z" fill={GOLD} />
    </svg>
  );
}

function Bullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <path d="M10 3l7 7-7 7-7-7z" fill="none" stroke={GOLD} strokeWidth="1.3" />
      <path d="M10 7.5l2.5 2.5-2.5 2.5-2.5-2.5z" fill={GOLD} />
    </svg>
  );
}

/** Medalyon: ikki oltin halqa, sakkiz bargli guldasta, to'q markazda bosh harflar */
function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden>
      <circle cx="80" cy="80" r="74" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="80" cy="80" r="69" fill="none" stroke={GOLD} strokeWidth="0.7" opacity="0.8" />
      <path d={rosette(80, 80, 44, 64)} fill="none" stroke={GOLD} strokeWidth="1.1" />
      <circle cx="80" cy="80" r="44" style={deep} />
      <circle cx="80" cy="80" r="40" fill="none" stroke={GOLD_LIGHT} strokeWidth="0.8" opacity="0.8" />
      <text
        x="80"
        y={b ? 92 : 95}
        textAnchor="middle"
        fontSize={b ? 34 : 42}
        fontStyle="italic"
        fontWeight="600"
        fill={GOLD_LIGHT}
        style={{ fontFamily: "var(--zh-display), Georgia, serif" }}
      >
        {b ? `${a}${b}` : a}
      </text>
    </svg>
  );
}

function DayMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g className="zh-ring" fill="none">
        <circle cx="30" cy="30" r="25" stroke={GOLD} strokeWidth="1.6" />
        <circle cx="30" cy="30" r="21" stroke={GOLD} strokeWidth="0.7" />
      </g>
    </svg>
  );
}

/** Manzil: gumbazli peshtoq va ikki minora — oltin chiziq */
function VenueArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 200" aria-hidden fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round">
      <path d="M120 70C120 38 200 38 200 70" strokeWidth="1.4" />
      <path d="M136 70C136 50 152 42 160 40C168 42 184 50 184 70" strokeWidth="0.8" />
      <path d="M160 40V24M160 24c-4 0-6-4-3-7 1 3 5 3 6 0 3 3 1 7-3 7z" strokeWidth="1.2" />
      <path d="M108 70H212V184H108Z" strokeWidth="1.4" />
      <path d="M116 78H204" strokeWidth="0.7" />
      <path d="M132 184V128C132 108 148 98 160 92C172 98 188 108 188 128V184" strokeWidth="1.4" />
      <path d="M142 184V132C142 118 152 110 160 106C168 110 178 118 178 132V184" strokeWidth="0.7" />
      <path d="M154 120l6 6-6 6-6-6z" transform="translate(6 -4)" strokeWidth="0.9" />
      {[60, 260].map((x) => (
        <g key={x}>
          <path d={`M${x - 9} 184V74H${x + 9}V184`} strokeWidth="1.3" />
          <path d={`M${x - 12} 74H${x + 12}M${x - 11} 116H${x + 11}`} strokeWidth="1" />
          <path d={`M${x - 8} 74C${x - 8} 60 ${x} 54 ${x} 50C${x} 54 ${x + 8} 60 ${x + 8} 74`} strokeWidth="1.2" />
          <path d={`M${x} 50V42`} strokeWidth="1" />
        </g>
      ))}
      <path d="M20 184H300" strokeWidth="1.4" />
      <path d="M40 192H130M190 192H280" strokeWidth="0.7" strokeDasharray="2 5" />
    </svg>
  );
}

function Stamp({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <circle cx="60" cy="60" r="55" fill="none" stroke={GOLD} strokeWidth="2" />
      <circle cx="60" cy="60" r="49" fill="none" stroke={GOLD} strokeWidth="1" strokeDasharray="1 4" strokeLinecap="round" />
      <path d={rosette(60, 60, 30, 42)} fill="none" stroke={GOLD} strokeWidth="1" />
      <circle cx="60" cy="60" r="30" style={deep} />
      <text x="60" y={b ? 69 : 72} textAnchor="middle" fontSize={b ? 24 : 30} fontStyle="italic" fontWeight="600" fill={GOLD_LIGHT} style={{ fontFamily: "var(--zh-display), Georgia, serif" }}>
        {b ? `${a}${b}` : a}
      </text>
    </svg>
  );
}

/** Kichik oltin yurak (yakuniy so'z yonida) */
export function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export const zarhalDecor: DecorSet = { Corner, Divider, Emblem, Bullet, DayMark, VenueArt, Stamp };
