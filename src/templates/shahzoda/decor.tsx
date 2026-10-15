"use client";

/**
 * Shahzoda bezaklari — hammasi kodda chizilgan original SVG:
 * firuza koshin, Chust do'ppisining qalampir naqshi, sakkiz qirrali yulduz (koshinkorlik),
 * oq kaptarlar, ravoqli ayvon.
 */
import type { CSSProperties } from "react";
import type { DecorSet } from "../contract";

const TEAL = "#0E6466";
const TILE = "#17807F";
const GOLD = "#B8913A";
const GOLD_LIGHT = "#D8B45A";
const IVORY = "#F7F1E3";

/* ------------------------------------------------------------------ */
/* Yordamchilar                                                         */
/* ------------------------------------------------------------------ */

const f = (n: number) => n.toFixed(2);

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function dotsPath(points: [number, number][], r: number) {
  return points.map(([x, y]) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join("");
}

/** Sakkiz qirrali yulduz (ikki kvadrat ustma-ust) — koshinkorlikning asosiy shakli */
export function star8(cx: number, cy: number, R: number) {
  const r = R * 0.7654;
  const pts = Array.from({ length: 16 }, (_, k) => polar(cx, cy, k % 2 === 0 ? R : r, k * 22.5));
  return "M" + pts.map((p) => p.map(f).join(" ")).join("L") + "Z";
}

/* ------------------------------------------------------------------ */
/* Koshin                                                               */
/* ------------------------------------------------------------------ */

/** Bitta koshin plitasi (20×20): to'rt bargli gul, oltin markaz */
const TILE_BODY = `<rect width="20" height="20" fill="${TILE}"/><g fill="${IVORY}"><ellipse cx="10" cy="6.4" rx="1.5" ry="2.7"/><ellipse cx="10" cy="13.6" rx="1.5" ry="2.7"/><ellipse cx="6.4" cy="10" rx="2.7" ry="1.5"/><ellipse cx="13.6" cy="10" rx="2.7" ry="1.5"/></g><circle cx="10" cy="10" r="1.3" fill="${GOLD_LIGHT}"/><g fill="#0B4F55"><circle r="2.2"/><circle cx="20" r="2.2"/><circle cy="20" r="2.2"/><circle cx="20" cy="20" r="2.2"/></g><g fill="${GOLD_LIGHT}"><circle r="0.8"/><circle cx="20" r="0.8"/><circle cy="20" r="0.8"/><circle cx="20" cy="20" r="0.8"/></g>`;

/** CSS fon sifatida (arka ustunlari uchun) — SVG naqsh bilan aynan bir xil */
export const TILE_URL = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">${TILE_BODY}</svg>`)}")`;

export function ShahzodaDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <pattern id="sh-tile" width="20" height="20" patternUnits="userSpaceOnUse" dangerouslySetInnerHTML={{ __html: TILE_BODY }} />
        <linearGradient id="sh-dove" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2EAE8" />
        </linearGradient>
        <linearGradient id="sh-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8E6B22" />
          <stop offset="0.45" stopColor="#D8B45A" />
          <stop offset="0.55" stopColor="#F1DC9C" />
          <stop offset="1" stopColor="#9C7629" />
        </linearGradient>
        <filter id="sh-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Qalampir — Chust do'ppisining naqshi                                 */
/* ------------------------------------------------------------------ */

const QAL_OUTER = "M3 -28C10 -21 15 -8 13 5C11.5 16 6 23 0 25C-6 23 -11.5 16 -13 5C-14.5 -9 -8 -21 3 -28Z";
const QAL_CURL = "M3 -28C7 -31.5 11.5 -30.5 10.5 -26.5";
const QAL_INNER = "M2 -18C7 -12.5 9 -4 8 4.5C7 11.5 4 15.5 0 17C-4 15.5 -7 11.5 -8 4.5C-9 -5 -5 -12.5 2 -18Z";
const QAL_RIBS = "M-6 9Q0 5 6 9M-7 1Q0 -4 7 1M-5 -7Q0 -11 5 -7";

/** Uchi tepaga qaragan qalampir; markazi (0,0), bo'yi ~56 birlik */
function Qalampir({ x, y, deg = 0, s = 1, fill = IVORY, line = TEAL }: { x: number; y: number; deg?: number; s?: number; fill?: string; line?: string }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${deg}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
      <path d={QAL_OUTER} fill={fill} stroke={line} strokeWidth="1.6" />
      <path d={QAL_CURL} fill="none" stroke={line} strokeWidth="1.6" />
      <path d={QAL_INNER} fill="none" stroke={GOLD} strokeWidth="1.2" />
      <path d={QAL_RIBS} fill="none" stroke={line} strokeWidth="1.1" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Kaptar                                                               */
/* ------------------------------------------------------------------ */

/** Oq kaptar, o'ngga qaragan, oyoqlari (30,42) nuqtada. viewBox 0 0 60 44 */
export function DoveShape() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M27 35L26 41.5M31 35L32 41.5" stroke="#C98B7A" strokeWidth="1.4" />
      <path
        d="M49 15.5L54.5 16.9L49 18.2C47.5 22.5 45 26.5 40 30C34 35 25 36 18 34L5.5 38.5L8.8 32.2L2.5 27L16 29C20 24 27 22 33 21C37 20 39 16.5 39 13C39 9 43 6.8 46 7.8C48.5 8.8 49.6 12 49 15.5Z"
        fill="url(#sh-dove)"
        stroke="#93A9A6"
        strokeWidth="0.8"
      />
      <path d="M49 15.5L54.5 16.9L49 18.2Z" fill="#D9A493" />
      <circle cx="45.4" cy="11.8" r="1" fill="#1F2A2E" />
      <g className="sh-dove__wing">
        <path d="M39 21.5C33 15.5 22 16.5 11.5 26.5C21.5 30.5 31.5 29 39 25.5Z" fill="#F4F7F5" stroke="#93A9A6" strokeWidth="0.8" />
        <path d="M30 22.5C25 22 19 24 15 27M33 25C27 25.5 22 27 18 28.6" fill="none" stroke="#B3C4C1" strokeWidth="0.6" />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Bosh ekran arkasi                                                    */
/* ------------------------------------------------------------------ */

/** Arka gumbazi: 320×170 birlik, band qalinligi 20 birlik (ustunlar bilan bir xil) */
const ARCH_BAND =
  "M0 170V120C0 62 92 30 160 0C228 30 320 62 320 120V170H300V122C300 74 222 46 160 22C98 46 20 74 20 122V170Z";
const ARCH_OUTER = "M0 170V120C0 62 92 30 160 0C228 30 320 62 320 120V170";
const ARCH_INNER = "M20 170V122C20 74 98 46 160 22C222 46 300 74 300 122V170";

/** Kaptarlar qo'nadigan nuqtalar (gumbaz koordinatalarida, 320 = arka eni) */
export const ARCH_PERCH = {
  apex: [160, 0],
  shoulder: [44.6, 54.5],
  shoulderTilt: -27,
} as const;

export function HeroArch() {
  return (
    <div className="sh-arch" aria-hidden>
      <svg className="sh-arch__cap" viewBox="0 0 320 170" preserveAspectRatio="xMidYMax meet">
        <path d={ARCH_BAND} fill="url(#sh-tile)" />
        <path d={ARCH_OUTER} fill="none" stroke={GOLD} strokeWidth="1.6" />
        <path d={ARCH_INNER} fill="none" stroke={GOLD} strokeWidth="1.6" />
        <path d="M30 170V123C30 82 102 56 160 33C218 56 290 82 290 123V170" fill="none" stroke={GOLD} strokeWidth="0.7" opacity="0.8" />
        <path d={star8(160, 11, 6)} fill="url(#sh-gold)" stroke="#8E6B22" strokeWidth="0.5" />
      </svg>
      <span className="sh-arch__leg sh-arch__leg--l" style={{ backgroundImage: TILE_URL } as CSSProperties} />
      <span className="sh-arch__leg sh-arch__leg--r" style={{ backgroundImage: TILE_URL } as CSSProperties} />
      <span className="sh-arch__sill" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bezaklar                                                             */
/* ------------------------------------------------------------------ */

/** Burchak: chorak koshin halqasi, qalampir va oltin nuqtalar */
function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <path d="M44 0A44 44 0 0 1 0 44V32A32 32 0 0 0 32 0Z" fill="url(#sh-tile)" stroke={GOLD} strokeWidth="1.2" />
      <path d="M54 0A54 54 0 0 1 0 54" fill="none" stroke={GOLD} strokeWidth="0.9" />
      <Qalampir x={45} y={45} deg={135} s={0.5} />
      <path d={dotsPath([[66, 4], [76, 4], [86, 4], [96, 4], [4, 66], [4, 76], [4, 86], [4, 96]], 1.3)} fill={GOLD} />
      <path d={star8(12, 12, 7)} fill={GOLD_LIGHT} stroke="#8E6B22" strokeWidth="0.5" />
    </svg>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 40" aria-hidden>
      <g stroke={GOLD} strokeWidth="1" fill="none">
        <path d="M14 20H96M164 20H246" />
      </g>
      <path d="M10 20l4-4 4 4-4 4zM242 20l4-4 4 4-4 4z" fill={GOLD} />
      <Qalampir x={112} y={20} deg={-90} s={0.42} />
      <Qalampir x={148} y={20} deg={90} s={0.42} />
      <path d={star8(130, 20, 8.5)} fill={TILE} stroke={GOLD} strokeWidth="1" />
      <circle cx="130" cy="20" r="2" fill={GOLD_LIGHT} />
    </svg>
  );
}

function Bullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <path d={star8(10, 10, 7.5)} fill={TILE} stroke={GOLD} strokeWidth="0.9" />
      <circle cx="10" cy="10" r="1.6" fill={IVORY} />
    </svg>
  );
}

/** Monogramma: firuza do'ppi (yuqoridan), to'rt qalampir, markazda bosh harf */
function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden>
      <rect x="14" y="14" width="132" height="132" rx="14" fill={TEAL} />
      <rect x="20" y="20" width="120" height="120" rx="10" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.4" />
      <rect x="25" y="25" width="110" height="110" rx="7" fill="none" stroke={GOLD_LIGHT} strokeWidth="0.6" opacity="0.8" />
      <Qalampir x={80} y={44} deg={180} s={0.52} line="#0B4F55" />
      <Qalampir x={116} y={80} deg={270} s={0.52} line="#0B4F55" />
      <Qalampir x={80} y={116} deg={0} s={0.52} line="#0B4F55" />
      <Qalampir x={44} y={80} deg={90} s={0.52} line="#0B4F55" />
      <path d={dotsPath([[32, 32], [128, 32], [32, 128], [128, 128]], 2.2)} fill={GOLD_LIGHT} />
      <circle cx="80" cy="80" r="19" fill={IVORY} stroke={GOLD_LIGHT} strokeWidth="1.6" />
      <text
        x="80"
        y={b ? 86.5 : 88.5}
        textAnchor="middle"
        fontSize={b ? 18 : 25}
        fontWeight="700"
        fill={TEAL}
        style={{ fontFamily: "var(--sh-display), Georgia, serif" }}
      >
        {b ? `${a}${b}` : a}
      </text>
    </svg>
  );
}

/** Taqvimda kun: oltin sakkiz qirrali yulduz */
function DayMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g className="sh-ring">
        <path d={star8(30, 30, 27)} fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="30" cy="30" r="17.5" fill="none" stroke={TILE} strokeWidth="1" />
      </g>
    </svg>
  );
}

/** Manzil: gumbazli bino, uch ravoq, tomida ikki kaptar */
function VenueArt({ className }: { className?: string }) {
  const arch = (cx: number, w: number, top: number) =>
    `M${cx - w / 2} 172V${top + 26}C${cx - w / 2} ${top + 10} ${cx - w / 4} ${top + 4} ${cx} ${top}C${cx + w / 4} ${top + 4} ${cx + w / 2} ${top + 10} ${cx + w / 2} ${top + 26}V172Z`;
  return (
    <svg className={className} viewBox="0 0 320 196" aria-hidden>
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* Gumbaz */}
        <path d="M118 72C118 34 202 34 202 72Z" fill={TILE} stroke={GOLD} strokeWidth="1.3" />
        <path d="M140 72C138 50 150 38 160 36M180 72C182 50 170 38 160 36M160 36V72" fill="none" stroke="#0B4F55" strokeWidth="1" opacity="0.7" />
        <path d="M160 36V22" stroke={GOLD} strokeWidth="1.6" />
        <circle cx="160" cy="19" r="3.4" fill="url(#sh-gold)" />
        <rect x="124" y="72" width="72" height="14" fill={IVORY} stroke={GOLD} strokeWidth="1.2" />
        <path d={dotsPath([132, 140, 148, 156, 164, 172, 180, 188].map((x) => [x, 79] as [number, number]), 1.3)} fill={TILE} />

        {/* Bino */}
        <rect x="30" y="86" width="260" height="86" fill="#F1E6CC" stroke={TEAL} strokeWidth="1.4" />
        <path d="M30 94H290" stroke={GOLD} strokeWidth="1" />
        <rect x="122" y="86" width="76" height="86" fill="url(#sh-tile)" stroke={GOLD} strokeWidth="1.2" />
        <path d={arch(160, 52, 100)} fill="#E4D5B4" stroke={GOLD} strokeWidth="1.3" />
        <path d={arch(76, 46, 112)} fill="#E4D5B4" stroke={TEAL} strokeWidth="1.3" />
        <path d={arch(244, 46, 112)} fill="#E4D5B4" stroke={TEAL} strokeWidth="1.3" />
        <path d={star8(160, 128, 7)} fill="none" stroke={TEAL} strokeWidth="1" />

        {/* Tomdagi kaptarlar */}
        <svg x="56" y="62" width="34" height="25" viewBox="0 0 60 44">
          <DoveShape />
        </svg>
        <svg x="232" y="62" width="34" height="25" viewBox="0 0 60 44">
          <g transform="translate(60 0) scale(-1 1)">
            <DoveShape />
          </g>
        </svg>

        {/* Yer */}
        <path d="M8 172H312" stroke={TEAL} strokeWidth="1.4" />
        <path d="M40 182H128M192 182H280" stroke={GOLD} strokeWidth="1" strokeDasharray="2 5" />
      </g>
    </svg>
  );
}

/** Javob qabul qilinganda: oltin-firuza tamg'a */
function Stamp({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <g filter="url(#sh-ink)">
        <circle cx="60" cy="60" r="55" fill="none" stroke={TEAL} strokeWidth="2.4" />
        <path d={star8(60, 60, 47)} fill="none" stroke={TEAL} strokeWidth="1.6" />
        <circle cx="60" cy="60" r="30" fill="none" stroke={GOLD} strokeWidth="1.2" />
        <path d={dotsPath(Array.from({ length: 8 }, (_, k) => polar(60, 60, 39, k * 45 + 22.5)), 1.8)} fill={TEAL} />
        <text x="60" y={b ? 68 : 71} textAnchor="middle" fontSize={b ? 24 : 32} fontWeight="700" fill={TEAL} style={{ fontFamily: "var(--sh-display), Georgia, serif" }}>
          {b ? `${a}${b}` : a}
        </text>
      </g>
    </svg>
  );
}

export const shahzodaDecor: DecorSet = {
  Corner,
  Divider,
  Emblem,
  Bullet,
  DayMark,
  VenueArt,
  Stamp,
  Defs: ShahzodaDefs,
};
