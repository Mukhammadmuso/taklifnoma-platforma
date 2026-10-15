"use client";

/**
 * Chinor bezaklari — hammasi kodda chizilgan original SVG:
 * chinor bargi (besh bo'lakli, tishli), yillar halqasi (yog'och kesigi),
 * shox va barglar, chinor ostidagi so'ri va choynak.
 */
import type { CSSProperties, ReactNode } from "react";
import type { DecorSet } from "../contract";

const GREEN = "#2F5D3A";
const AMBER = "#C8892B";
const AMBER_INK = "#8A5A12";
const BARK = "#5A3A1E";

/** Barg ranglari: yozgi yashildan kuzgi qahrabo va zanggacha */
export const LEAF_COLORS = ["#3F6B35", "#5C8A3C", "#8A9A3A", "#C8892B", "#B5652A", "#8E3B1E", "#D9A441"];

/* ------------------------------------------------------------------ */
/* Yordamchilar                                                         */
/* ------------------------------------------------------------------ */

export function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(2);

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function dotsPath(points: [number, number][], r: number) {
  return points.map(([x, y]) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join("");
}

/** Notekis yopiq egri (daraxt halqasi): Catmull-Rom → Bezier */
function wobblyRing(cx: number, cy: number, base: number, amp: number, seed: number) {
  const rand = rng(seed);
  const n = 18;
  const ph = [rand() * 6, rand() * 6, rand() * 6];
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = base + amp * (Math.sin(2 * a + ph[0]) * 0.6 + Math.sin(3 * a + ph[1]) * 0.3 + Math.sin(5 * a + ph[2]) * 0.2);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.96]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

/* ------------------------------------------------------------------ */
/* Chinor bargi                                                         */
/* ------------------------------------------------------------------ */

/** Besh bo'lakli barg, har bo'lak chetida tishchalar. 100×100, bandi pastda */
const LEAF = (() => {
  const c: [number, number] = [50, 60];
  const ring: [number, number][] = [
    [150, 13], [108, 42], [80, 30], [53, 49], [26, 33], [0, 55],
    [-26, 33], [-53, 49], [-80, 30], [-108, 42], [-150, 13],
  ];
  const pts = ring.map(([a, r]) => polar(c[0], c[1], r, a));
  const out: [number, number][] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const q = pts[i];
    const mx = p[0] + (q[0] - p[0]) * 0.5;
    const my = p[1] + (q[1] - p[1]) * 0.5;
    const dx = mx - c[0];
    const dy = my - c[1];
    const len = Math.hypot(dx, dy) || 1;
    out.push([mx + (dx / len) * 3.4, my + (dy / len) * 3.4], [p[0] + (q[0] - p[0]) * 0.62, p[1] + (q[1] - p[1]) * 0.62], q);
  }
  const outline = "M" + out.map((p) => p.map(f).join(" ")).join("L") + "Z";
  const tips = [ring[1], ring[3], ring[5], ring[7], ring[9]].map(([a, r]) => polar(c[0], c[1], r - 6, a));
  const veins = tips.map(([x, y]) => `M50 64L${f(x)} ${f(y)}`).join("");
  return { outline, veins };
})();

/* ------------------------------------------------------------------ */
/* Umumiy <defs>                                                        */
/* ------------------------------------------------------------------ */

export function ChinorDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <linearGradient id="ch-leaf-shade" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#FFF6D8" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#FFF6D8" stopOpacity="0" />
          <stop offset="0.52" stopColor="#1A1205" stopOpacity="0.1" />
          <stop offset="1" stopColor="#1A1205" stopOpacity="0.26" />
        </linearGradient>
        {/* Barg rangini `color` orqali oladi: har nusxa o'z rangida */}
        <symbol id="ch-leaf" viewBox="0 0 100 100" overflow="visible">
          {/* Soya simvolning o'zida: har bargga CSS filtr berish telefonni qotirardi */}
          <path d={LEAF.outline} fill="#0A1005" opacity="0.28" transform="translate(2.5 4)" />
          <path d="M50 66L50 99" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d={LEAF.outline} fill="currentColor" stroke="rgb(30 20 5 / 0.25)" strokeWidth="0.8" strokeLinejoin="round" />
          <path d={LEAF.outline} fill="url(#ch-leaf-shade)" />
          <path d={LEAF.veins} stroke="rgb(255 244 210 / 0.5)" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </symbol>
        <radialGradient id="ch-wood" cx="0.48" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#F2DCAA" />
          <stop offset="0.7" stopColor="#E6C384" />
          <stop offset="1" stopColor="#D2A45E" />
        </radialGradient>
        <filter id="ch-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 .4  0 0 0 0 .25  0 0 0 0 .1  0 0 0 1.3 -.55" result="c" />
          <feComposite in="c" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="ch-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="13" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/** Barg nusxasi (SVG ichida): markazi (x,y), o'lchami s, burchagi deg */
function Leaf({ x, y, s, deg, color }: { x: number; y: number; s: number; deg: number; color: string }) {
  return <use href="#ch-leaf" x={f(x - s / 2)} y={f(y - s / 2)} width={f(s)} height={f(s)} transform={`rotate(${f(deg)} ${f(x)} ${f(y)})`} style={{ color } as CSSProperties} />;
}

/* ------------------------------------------------------------------ */
/* Yillar halqasi                                                       */
/* ------------------------------------------------------------------ */

const DISC_RINGS = Array.from({ length: 11 }, (_, i) => ({
  d: wobblyRing(100, 100, 14 + i * 7.4, 1.2 + i * 0.35, 30 + i),
  w: i % 3 === 0 ? 1.5 : 0.9,
  o: i < 6 ? 0.16 : 0.5,
}));
const DISC_BARK = wobblyRing(100, 100, 96, 2.2, 7);
const DISC_WOOD = wobblyRing(100, 100, 89, 1.6, 8);

/** Yog'och kesigi: po'stloq, halqalar; o'rtasi och — ustiga matn yoziladi */
export function RingDisc({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden>
      <path d={DISC_BARK} fill={BARK} />
      <path d={DISC_BARK} fill="#000" filter="url(#ch-grain)" opacity="0.7" />
      <path d={DISC_WOOD} fill="url(#ch-wood)" />
      <path d={DISC_WOOD} fill="#000" filter="url(#ch-grain)" opacity="0.25" />
      <g fill="none" stroke="#9C6A2E" strokeLinecap="round">
        {DISC_RINGS.map((r, i) => (
          <path key={i} d={r.d} strokeWidth={r.w} opacity={r.o} />
        ))}
      </g>
      <path d="M100 100L178 74M100 100L40 162" stroke="#7A4E22" strokeWidth="0.8" opacity="0.35" />
      <path d={DISC_WOOD} fill="none" stroke="#7A4E22" strokeWidth="1.4" opacity="0.6" />
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bezaklar                                                             */
/* ------------------------------------------------------------------ */

/** Burchak: shox va uch barg */
function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden overflow="visible">
      <path d="M2 6C30 10 60 18 96 30M10 4C14 34 22 62 30 96" fill="none" stroke={BARK} strokeWidth="2" strokeLinecap="round" />
      <Leaf x={88} y={38} s={58} deg={112} color="#5C8A3C" />
      <Leaf x={36} y={88} s={56} deg={-152} color={AMBER} />
      <Leaf x={36} y={34} s={64} deg={135} color="#3F6B35" />
    </svg>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 44" aria-hidden overflow="visible">
      <path d="M20 26C70 22 100 28 130 26C160 24 190 22 240 26" fill="none" stroke={BARK} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      <Leaf x={106} y={20} s={26} deg={-62} color="#5C8A3C" />
      <Leaf x={154} y={20} s={26} deg={62} color="#8A9A3A" />
      <Leaf x={130} y={16} s={30} deg={0} color={AMBER} />
    </svg>
  );
}

function Bullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <Leaf x={10} y={10} s={19} deg={-20} color={AMBER} />
    </svg>
  );
}

/** Monogramma: yillar halqasi o'rtasida bosh harflar */
function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <RingDisc className={className}>
      <circle cx="100" cy="100" r="44" fill="#F6E4BC" opacity="0.85" />
      <text
        x="100"
        y={b ? 113 : 117}
        textAnchor="middle"
        fontSize={b ? 38 : 48}
        fontStyle="italic"
        fontWeight="600"
        fill={GREEN}
        style={{ fontFamily: "var(--ch-serif), Georgia, serif" }}
      >
        {b ? `${a}${b}` : a}
      </text>
    </RingDisc>
  );
}

/** Taqvimda kun: ikki notekis halqa */
function DayMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g className="ch-ring" fill="none" strokeLinecap="round">
        <path d={wobblyRing(30, 30, 25, 1.4, 3)} stroke={AMBER} strokeWidth="2" />
        <path d={wobblyRing(30, 30, 20.5, 1, 5)} stroke={GREEN} strokeWidth="0.9" />
      </g>
    </svg>
  );
}

/** Manzil: chinor soyasidagi so'ri, choynak va hovuz */
function VenueArt({ className }: { className?: string }) {
  const rand = rng(77);
  const canopy = Array.from({ length: 26 }, () => {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    return {
      x: 128 + Math.cos(a) * r * 104,
      y: 66 + Math.sin(a) * r * 46,
      s: 30 + rand() * 18,
      deg: rand() * 360,
      color: LEAF_COLORS[Math.floor(rand() * 4)],
    };
  });
  return (
    <svg className={className} viewBox="0 0 320 196" aria-hidden overflow="visible">
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* Hovuz */}
        <ellipse cx="62" cy="176" rx="48" ry="9" fill="#9DBBA3" stroke={GREEN} strokeWidth="1.2" />
        <path d="M34 175h18M70 178h22" stroke="#F4EEDC" strokeWidth="1" />

        {/* Tana va shoxlar */}
        <path d="M112 172C118 140 116 112 104 86M144 172C138 140 142 112 156 86M124 120C114 102 98 92 78 86M134 112C148 98 170 88 196 84" fill="none" stroke={BARK} strokeWidth="3" />
        <path d="M108 172C116 138 112 110 100 88L120 96L128 70L134 96L160 88C146 112 140 138 148 172Z" fill="#7A5634" stroke={BARK} strokeWidth="1.2" />
        <path d="M120 150C122 140 120 130 118 122M134 160C132 148 134 138 138 128" stroke="#4A2E16" strokeWidth="0.8" fill="none" opacity="0.6" />

        {/* Barglar soyaboni */}
        {canopy.map((l, i) => (
          <Leaf key={i} {...l} />
        ))}

        {/* So'ri */}
        <path d="M188 146H300V154H188Z" fill="#B98A55" stroke={BARK} strokeWidth="1.2" />
        <path d="M194 154V172M294 154V172M244 154V172" stroke={BARK} strokeWidth="2.4" />
        <path d="M188 146V122H300V146" fill="none" stroke={BARK} strokeWidth="1.4" />
        <path d="M206 122V146M224 122V146M262 122V146M282 122V146" stroke={BARK} strokeWidth="0.9" opacity="0.7" />
        <path d="M196 140H292" stroke="#C0392B" strokeWidth="4" opacity="0.55" />

        {/* Choynak va piyola */}
        <path d="M232 140C230 130 236 126 242 126C248 126 254 130 252 140Z" fill="#2F6F8F" stroke="#1E4A60" strokeWidth="1" />
        <path d="M252 132C258 130 260 128 262 124M232 132C228 132 227 136 229 139" fill="none" stroke="#1E4A60" strokeWidth="1.4" />
        <circle cx="242" cy="124" r="2" fill="#1E4A60" />
        <path d="M266 140C266 134 276 134 276 140Z" fill="#F4EEDC" stroke="#2F6F8F" strokeWidth="1" />

        {/* Yer */}
        <path d="M6 172H314" stroke={GREEN} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/** Javob qabul qilinganda: barg tasvirli dumaloq tamg'a */
function Stamp({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <g filter="url(#ch-ink)">
        <circle cx="60" cy="60" r="55" fill="none" stroke={GREEN} strokeWidth="2.4" />
        <path d={dotsPath(Array.from({ length: 30 }, (_, k) => polar(60, 60, 49, k * 12)), 1.4)} fill={GREEN} />
        <circle cx="60" cy="60" r="43" fill="none" stroke={GREEN} strokeWidth="1" />
        <use href="#ch-leaf" x="44" y="18" width="32" height="32" style={{ color: GREEN } as CSSProperties} />
        <text x="60" y="84" textAnchor="middle" fontSize={b ? 24 : 28} fontStyle="italic" fontWeight="600" fill={GREEN} style={{ fontFamily: "var(--ch-serif), Georgia, serif" }}>
          {b ? `${a}${b}` : a}
        </text>
      </g>
    </svg>
  );
}

export const chinorDecor: DecorSet = {
  Corner,
  Divider,
  Emblem,
  Bullet,
  DayMark,
  VenueArt,
  Stamp,
  Defs: ChinorDefs,
};

export { AMBER, AMBER_INK, GREEN };
