"use client";

/**
 * Maktub bezaklari — hammasi qo'lda chizilgan original SVG:
 * girih (xotam — sakkiz qirrali yulduz) panjarasi, islimi burchaklar,
 * 3D yoritilgan lak muhr, siyoh bilan chizilgan halqa, to'yxona chizmasi.
 */
import { useId } from "react";
import type { DecorSet } from "../contract";

const GOLD = "#A57C34";
const GOLD_LIGHT = "#D9BC78";
const WAX = "#7A1426";

/* ------------------------------------------------------------------ */
/* Umumiy <defs>                                                        */
/* ------------------------------------------------------------------ */

export function MaktubDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        {/* Konvert ichki qavati: bordo fonda oltin xotam panjarasi */}
        <pattern id="mk-khatam" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="#5A0F1D" />
          <g fill="none" stroke={GOLD_LIGHT} strokeWidth="0.8" strokeOpacity="0.6" strokeLinejoin="round">
            <path d={STAR_TILE} />
            <path d={star8(0, 0, 7)} />
            <path d={star8(48, 0, 7)} />
            <path d={star8(0, 48, 7)} />
            <path d={star8(48, 48, 7)} />
            <path d="M24 3V0M24 45V48M3 24H0M45 24H48" />
          </g>
          <g fill={GOLD_LIGHT} fillOpacity="0.55">
            <circle cx="24" cy="24" r="2" />
          </g>
        </pattern>

        {/* Qog'oz donadorligi */}
        <filter id="mk-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.16 0"
            result="tint"
          />
          <feComposite in="tint" in2="SourceAlpha" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>

        {/* Lak: yuqori-chapdan tushgan yorug'lik (relyef) */}
        <filter id="mk-wax-light" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="6"
            specularConstant="0.85"
            specularExponent="24"
            lightingColor="#ffd6dc"
            result="spec"
          >
            <fePointLight x="-40" y="-60" z="180" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" />
        </filter>

        <filter id="mk-wax-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        <radialGradient id="mk-wax-body" cx="0.4" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#A82C40" />
          <stop offset="0.5" stopColor="#7A1426" />
          <stop offset="1" stopColor="#470914" />
        </radialGradient>

        <radialGradient id="mk-wax-well" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#701222" />
          <stop offset="0.85" stopColor="#5E0D1B" />
          <stop offset="1" stopColor="#4A0914" />
        </radialGradient>

        <linearGradient id="mk-well-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#36050E" />
          <stop offset="0.5" stopColor="#6C1222" />
          <stop offset="1" stopColor="#C4566A" />
        </linearGradient>

        <radialGradient id="mk-wax-gloss" cx="0.36" cy="0.3" r="0.32">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="mk-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7C5A1E" />
          <stop offset="0.38" stopColor="#C9A55A" />
          <stop offset="0.5" stopColor="#F2E0A6" />
          <stop offset="0.62" stopColor="#B48A3E" />
          <stop offset="1" stopColor="#7C5A1E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Xotam: {8/3} sakkiz qirrali yulduz (o'tkir uchli), kafel markazida */
function starPolygon(cx: number, cy: number, R: number, r: number) {
  const pts = Array.from({ length: 16 }, (_, k) => {
    const a = (k * Math.PI) / 8 - Math.PI / 2;
    const rad = k % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join("L")}Z`;
}

const STAR_TILE = starPolygon(24, 24, 21, 10.5) + starPolygon(24, 24, 12, 7);

/* ------------------------------------------------------------------ */
/* Lak muhr                                                             */
/* ------------------------------------------------------------------ */

/** Lak qoldig'ining notekis chetlari: silliq yopiq egri chiziq (Catmull-Rom → Bezier) */
function waxOutline(cx = 100, cy = 100, base = 84): string {
  const n = 28;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = base + 4.6 * Math.sin(5 * a + 0.6) + 2.8 * Math.sin(9 * a + 1.9) + 1.6 * Math.sin(13 * a + 0.3);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

const WAX_PATH = waxOutline();

/** Muhr yorilish chizig'i (siniq chiziq) */
const CRACK = "M106 4 L97 40 L110 70 L93 104 L108 138 L96 170 L103 198";
const CLIP_LEFT = `M-10 -10 L106 -10 ${CRACK.replace("M", "L")} L103 210 L-10 210 Z`;
const CLIP_RIGHT = `M210 -10 L106 -10 ${CRACK.replace("M", "L")} L103 210 L210 210 Z`;

function SealFace({ initials }: { initials: [string, string?] }) {
  const [a, b] = initials;
  const beads = Array.from({ length: 20 }, (_, i) => {
    const ang = (i / 20) * Math.PI * 2;
    return [100 + 52 * Math.cos(ang), 100 + 52 * Math.sin(ang)];
  });
  const letters = b ? (
    <>
      <text x="84" y="112" fontSize="58">{a}</text>
      <text x="117" y="128" fontSize="58">{b}</text>
    </>
  ) : (
    <text x="100" y="122" fontSize="72">{a}</text>
  );
  return (
    <>
      <path d={WAX_PATH} fill="url(#mk-wax-body)" filter="url(#mk-wax-light)" />
      {/* Bosilgan chuqurcha */}
      <circle cx="100" cy="100" r="61" fill="url(#mk-wax-well)" />
      <circle cx="100" cy="100" r="61" fill="none" stroke="url(#mk-well-rim)" strokeWidth="3.2" />
      <circle cx="100" cy="100" r="46" fill="none" stroke="#A33246" strokeOpacity="0.6" strokeWidth="0.9" />
      <g fill="#9A2638">
        {beads.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="1.9" />
        ))}
      </g>
      {/* Monogramma: soya + yorug' qirra + asosiy qatlam = bo'rtma harflar */}
      <g
        textAnchor="middle"
        style={{ fontFamily: "var(--mk-script), var(--mk-body), serif" }}
        aria-hidden
      >
        <g fill="#33040C" transform="translate(-1.1 -1.1)" opacity="0.85">
          {letters}
        </g>
        <g fill="#D9788A" transform="translate(1 1)" opacity="0.85">
          {letters}
        </g>
        <g fill="#A3293E">{letters}</g>
      </g>
      <ellipse cx="78" cy="66" rx="46" ry="30" fill="url(#mk-wax-gloss)" />
    </>
  );
}

export function WaxSeal({
  initials,
  className,
  broken = false,
}: {
  initials: [string, string?];
  className?: string;
  /** Opening uchun: ikki bo'lakka ajraladigan qilib chizadi */
  broken?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  if (!broken) {
    return (
      <svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false">
        <path d={WAX_PATH} fill="#1E0207" opacity="0.45" filter="url(#mk-wax-shadow)" transform="translate(3 7)" />
        <SealFace initials={initials} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false" overflow="visible">
      <defs>
        <clipPath id={`${uid}-l`}>
          <path d={CLIP_LEFT} />
        </clipPath>
        <clipPath id={`${uid}-r`}>
          <path d={CLIP_RIGHT} />
        </clipPath>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path
        className="mk-seal__shadow"
        d={WAX_PATH}
        fill="#1E0207"
        opacity="0.45"
        filter="url(#mk-wax-shadow)"
        transform="translate(3 7)"
      />
      <g className="mk-seal__half mk-seal__half--l" clipPath={`url(#${uid}-l)`}>
        <SealFace initials={initials} />
      </g>
      <g className="mk-seal__half mk-seal__half--r" clipPath={`url(#${uid}-r)`}>
        <SealFace initials={initials} />
      </g>
      <g className="mk-seal__crack">
        <path d={CRACK} fill="none" stroke="#FFE3A6" strokeWidth="6" filter={`url(#${uid}-glow)`} />
        <path d={CRACK} fill="none" stroke="#FFF6DD" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Ornamentlar                                                          */
/* ------------------------------------------------------------------ */

/** Sakkiz qirrali yulduz (ikki kvadrat) */
function star8(cx: number, cy: number, r: number) {
  const s = r * Math.SQRT1_2;
  return `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z M${cx - s} ${cy - s}H${cx + s}V${cy + s}H${cx - s}Z`;
}

export function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden focusable="false">
      <g fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 120V30C10 18 18 10 30 10H120" strokeWidth="1.2" />
        <path d="M17 120V35C17 25 25 17 35 17H120" strokeWidth="0.6" />
        <path d={star8(34, 34, 7.5)} strokeWidth="0.9" />
        {/* Islimi jingalaklari */}
        <path d="M42 34C54 34 58 26 66 26C74 26 76 33 71 36C67 38.5 63 35 65 32" strokeWidth="1" />
        <path d="M34 42C34 54 26 58 26 66C26 74 33 76 36 71C38.5 67 35 63 32 65" strokeWidth="1" />
        <path d="M66 26C80 26 86 22 96 22" strokeWidth="0.8" />
        <path d="M26 66C26 80 22 86 22 96" strokeWidth="0.8" />
      </g>
      <g fill={GOLD}>
        <circle cx="34" cy="34" r="1.8" fill={WAX} />
        <path d="M96 22C100 17 107 17 110 20C106 24 100 25 96 22Z" />
        <path d="M22 96C17 100 17 107 20 110C24 106 25 100 22 96Z" />
        <path d="M48 38C51 42 55 44 58 43C56 40 52 38 48 38Z" />
        <path d="M38 48C42 51 44 55 43 58C40 56 38 52 38 48Z" />
        <circle cx="116" cy="13.5" r="1.1" />
        <circle cx="13.5" cy="116" r="1.1" />
      </g>
    </svg>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" width="240" height="24" className={className} aria-hidden focusable="false">
      <g fill={GOLD}>
        <rect x="14" y="11.6" width="80" height="0.8" />
        <rect x="146" y="11.6" width="80" height="0.8" />
        <circle cx="8" cy="12" r="1.2" />
        <circle cx="232" cy="12" r="1.2" />
        <path d="M96 12L103 8.6L110 12L103 15.4Z" />
        <path d="M130 12L137 8.6L144 12L137 15.4Z" />
      </g>
      <path d={star8(120, 12, 9)} fill="none" stroke={GOLD} strokeWidth="0.9" />
      <circle cx="120" cy="12" r="2.6" fill={WAX} />
    </svg>
  );
}

export function Bullet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" className={className} aria-hidden focusable="false">
      <path d={star8(10, 10, 7)} fill="none" stroke={GOLD} strokeWidth="1" />
      <circle cx="10" cy="10" r="1.8" fill={WAX} />
    </svg>
  );
}

export function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  const petals = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden focusable="false">
      <g fill="none" stroke={GOLD} strokeLinejoin="round">
        <path d={star8(80, 80, 74)} strokeWidth="0.9" />
        <circle cx="80" cy="80" r="56" strokeWidth="1.1" />
        <circle cx="80" cy="80" r="51" strokeWidth="0.5" />
      </g>
      <g fill={GOLD}>
        {petals.map((deg) => (
          <path key={deg} d="M80 19.5L82 23.5L80 27.5L78 23.5Z" transform={`rotate(${deg} 80 80)`} />
        ))}
      </g>
      <g
        textAnchor="middle"
        fill={WAX}
        style={{ fontFamily: "var(--mk-script), var(--mk-body), serif" }}
      >
        {b ? (
          <>
            <text x="64" y="90" fontSize="48">
              {a}
            </text>
            <text x="80" y="88" fontSize="20" fill={GOLD}>
              &amp;
            </text>
            <text x="97" y="104" fontSize="48">
              {b}
            </text>
          </>
        ) : (
          <text x="80" y="100" fontSize="60">
            {a}
          </text>
        )}
      </g>
    </svg>
  );
}

/** Taqvimda kunni o'rab olgan, qo'lda chizilgan siyoh halqa */
export function DayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 52" className={className} aria-hidden focusable="false" preserveAspectRatio="none">
      <path
        className="mk-ring"
        pathLength={1}
        d="M45 9.5C35 2.5 13 4 7 18.5C1.5 32 14 46.5 31 46.5C48 46.5 57.5 34 53.5 21C50.5 11 40 5.5 26 8.5"
        fill="none"
        stroke={WAX}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Pishtoqli to'yxona — oltin chiziqli chizma (manzil rasmi bo'lmaganda) */
export function VenueArt({ className }: { className?: string }) {
  const arch = (c: number) =>
    `M${c - 8} 150V125C${c - 8} 117 ${c - 3} 113 ${c} 110C${c + 3} 113 ${c + 8} 117 ${c + 8} 125V150`;
  const wingArches = [58, 80, 102, 198, 220, 242];
  const dots = Array.from({ length: 11 }, (_, i) => 120 + i * 6);
  return (
    <svg viewBox="0 0 300 160" className={className} aria-hidden focusable="false">
      <g fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1" vectorEffect="non-scaling-stroke">
        <path d="M6 150H294" />
        {/* Sarvlar */}
        <path d="M18 150C13 136 15 118 19 104C23 118 25 136 20 150" />
        <path d="M282 150C277 136 279 118 283 104C287 118 289 136 284 150" />
        {/* Guldastalar */}
        <path d="M30 150V86H42V150M28 86H44M30 86C30 78 34 74 36 71C38 74 42 78 42 86" />
        <path d="M258 150V86H270V150M256 86H272M258 86C258 78 262 74 264 71C266 74 270 78 270 86" />
        {/* Qanotlar */}
        <path d="M42 150V96H115M185 96H258V150M42 104H115M185 104H258" />
        {wingArches.map((c) => (
          <path key={c} d={arch(c)} />
        ))}
        {/* Pishtoq */}
        <path d="M115 150V62H185V150M115 70H185" />
        <path d="M131 150V102C131 86 141 77 150 71C159 77 169 86 169 102V150" />
        <path d="M138 150V104C138 92 145 85 150 81C155 85 162 92 162 104V150" strokeWidth="0.7" />
        {/* Gumbaz */}
        <path d="M127 62V52H173V62" />
        <path d="M125 52C125 30 139 18 150 12C161 18 175 30 175 52" />
        <path d="M150 12V52M137 51C138 36 143 25 150 12M163 51C162 36 157 25 150 12" strokeWidth="0.6" />
        <path d="M150 12V6" />
      </g>
      <g fill={GOLD}>
        <circle cx="150" cy="4.5" r="1.8" />
        {dots.map((x) => (
          <circle key={x} cx={x} cy="66" r="0.9" />
        ))}
      </g>
      <circle cx="150" cy="118" r="2.4" fill={WAX} />
    </svg>
  );
}

/**
 * Javob yuborilgandagi tamg'a — haqiqiy lak muhr surati (seal.webp), ustiga bosh harflar.
 * Statik joy (animatsiyasiz), shuning uchun Opening/Emblem'dagi chizilgan WaxSeal'ga tegmaydi.
 */
export function Stamp({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  const label = b ? `${a} & ${b}` : a;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <image href="/templates/maktub/seal.webp" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
      <text x="50" y={b ? 57 : 60} textAnchor="middle" fontSize={b ? 19 : 24} fill="#D9BC78" style={{ fontFamily: "var(--mk-script), var(--mk-body), serif" }}>
        {label}
      </text>
      <text
        x="50"
        y={b ? 57 : 60}
        textAnchor="middle"
        fontSize={b ? 19 : 24}
        fill="none"
        stroke="#4A0914"
        strokeWidth="0.35"
        style={{ fontFamily: "var(--mk-script), var(--mk-body), serif" }}
      >
        {label}
      </text>
    </svg>
  );
}

export const maktubDecor: DecorSet = {
  Corner,
  Divider,
  Emblem,
  Bullet,
  DayMark,
  VenueArt,
  Stamp,
  Defs: MaktubDefs,
};
