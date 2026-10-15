"use client";

/**
 * Anor bezaklari — hammasi kodda chizilgan original SVG:
 * butun anor (po'sti, toji, barglari), kesilgan anor (oq parda va yoqut donalar),
 * anor gullari va shoxi, anorzor ichidagi shiypon.
 */
import type { DecorSet } from "../contract";

const RED = "#A3122E";
const RED_DEEP = "#6E0A1C";
const GREEN = "#3E7A45";
const PITH = "#F7E3CF";

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

/** Biroz qirrali, pastroqqa egilgan anor shakli (Catmull-Rom → Bezier) */
function fruitOutline(cx: number, cy: number, rx: number, ry: number) {
  const n = 20;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.025 * Math.cos(6 * a) + 0.02 * Math.sin(3 * a + 0.4);
    pts.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
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
/* Umumiy <defs>                                                        */
/* ------------------------------------------------------------------ */

export function AnorDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <radialGradient id="an-skin" cx="0.36" cy="0.32" r="0.78">
          <stop offset="0" stopColor="#F2707C" />
          <stop offset="0.3" stopColor="#D02842" />
          <stop offset="0.62" stopColor="#A3122E" />
          <stop offset="1" stopColor="#5E0817" />
        </radialGradient>
        <linearGradient id="an-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A0F20" />
          <stop offset="1" stopColor="#B52038" />
        </linearGradient>
        <linearGradient id="an-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6FA867" />
          <stop offset="1" stopColor="#2F6338" />
        </linearGradient>
        <radialGradient id="an-aril" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FF8A96" />
          <stop offset="0.4" stopColor="#E0304A" />
          <stop offset="1" stopColor="#8E0C24" />
        </radialGradient>
        <filter id="an-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="an-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="17" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Anor barglari va gullari                                             */
/* ------------------------------------------------------------------ */

/** Ingichka, uchli anor bargi: (x,y) dan `deg` yo'nalishida, uzunligi len */
export function AnorLeaf({ x, y, deg, len = 70 }: { x: number; y: number; deg: number; len?: number }) {
  const w = len * 0.17;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(deg)})`}>
      <path d={`M0 0C${f(len * 0.25)} ${f(-w)} ${f(len * 0.7)} ${f(-w)} ${len} 0C${f(len * 0.7)} ${f(w)} ${f(len * 0.25)} ${f(w)} 0 0Z`} fill="url(#an-leaf)" stroke="#24502B" strokeWidth="0.8" />
      <path d={`M2 0Q${f(len * 0.5)} -1 ${f(len * 0.92)} 0`} stroke="#CFE3B8" strokeWidth="0.9" fill="none" opacity="0.7" />
    </g>
  );
}

/** Anor guli: qo'ng'iroqsimon kosacha va burishgan gulbarglar (yuqoriga qaragan) */
function Blossom({ x, y, s = 1, deg = 0 }: { x: number; y: number; s?: number; deg?: number }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${deg}) scale(${s})`}>
      <path d="M-14 -6C-18 -20 -10 -26 -4 -18C-2 -30 6 -30 6 -18C12 -26 20 -20 14 -6Z" fill="#E8394F" stroke={RED_DEEP} strokeWidth="0.8" />
      <path d="M-9 -8C-8 -16 -4 -18 0 -12C4 -18 8 -16 9 -8" fill="none" stroke="#FF9AA6" strokeWidth="0.9" />
      <path d="M-10 -6L-12 10Q0 18 12 10L10 -6Q0 -2 -10 -6Z" fill="url(#an-crown)" stroke={RED_DEEP} strokeWidth="0.8" />
      <path d="M-10 -6L-15 -12M10 -6L15 -12M0 -4L0 -10" stroke={RED_DEEP} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Butun anor (400×440)                                                 */
/* ------------------------------------------------------------------ */

export const FRUIT_BODY = fruitOutline(200, 262, 166, 158);
const CROWN =
  "M170 120C175 104 177 90 175 74L164 52L182 64L188 40L200 60L212 40L218 64L236 52L225 74C223 90 225 104 230 120Z";
const RIDGES = "M200 112C150 170 140 300 190 412M200 112C252 170 262 300 214 412M200 112C112 160 64 260 96 360M200 112C288 160 336 260 304 360";
const BLUSH = (() => {
  const rand = rng(5);
  return Array.from({ length: 6 }, () => ({
    x: 110 + rand() * 120,
    y: 300 + rand() * 90,
    rx: 30 + rand() * 30,
    ry: 18 + rand() * 18,
  }));
})();
const SPECKS = (() => {
  const rand = rng(8);
  const pts: [number, number][] = [];
  for (let i = 0; i < 70; i++) {
    const a = rand() * 360;
    const r = Math.sqrt(rand()) * 150;
    const [x, y] = polar(200, 262, r, a);
    pts.push([x, y]);
  }
  return dotsPath(pts, 1.1);
})();

/** Anorning tashqi ko'rinishi: po'st, toj, barglar */
export function Fruit({ id, leaves = true }: { id?: string; leaves?: boolean }) {
  return (
    <g id={id}>
      {leaves && (
        <g>
          <AnorLeaf x={180} y={96} deg={-158} len={118} />
          <AnorLeaf x={222} y={92} deg={-28} len={104} />
          <AnorLeaf x={190} y={92} deg={-118} len={84} />
        </g>
      )}
      <path d={CROWN} fill="url(#an-crown)" stroke={RED_DEEP} strokeWidth="1.2" strokeLinejoin="round" />
      <ellipse cx="200" cy="72" rx="16" ry="5" fill="#3E0510" />
      <path d={FRUIT_BODY} fill="url(#an-skin)" />
      <g filter="url(#an-soft)" opacity="0.32">
        {BLUSH.map((b, i) => (
          <ellipse key={i} cx={f(b.x)} cy={f(b.y)} rx={f(b.rx)} ry={f(b.ry)} fill="#E89A62" opacity="0.45" />
        ))}
      </g>
      <path d={RIDGES} fill="none" stroke="#4A0612" strokeWidth="2" opacity="0.12" />
      <path d={SPECKS} fill="#5E0817" opacity="0.35" />
      <ellipse cx="140" cy="188" rx="46" ry="30" fill="#FFF3F0" opacity="0.38" filter="url(#an-soft)" transform="rotate(-30 140 188)" />
      <ellipse cx="128" cy="180" rx="12" ry="6" fill="#FFFFFF" opacity="0.55" transform="rotate(-30 128 180)" />
      <path d="M176 118Q200 128 224 118" fill="none" stroke="#5E0817" strokeWidth="2.4" opacity="0.6" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Kesilgan anor: oq parda va donalar                                   */
/* ------------------------------------------------------------------ */

const CUT_ARILS = (() => {
  const rand = rng(31);
  const out: { x: number; y: number; deg: number; s: number }[] = [];
  for (let ring = 0; ring < 7; ring++) {
    const r = 22 + ring * 19.5;
    const n = Math.round((2 * Math.PI * r) / 20);
    for (let i = 0; i < n; i++) {
      const [x, y] = polar(200, 262, r + (rand() - 0.5) * 6, (i * 360) / n + rand() * 8);
      out.push({ x, y, deg: rand() * 180, s: 0.85 + rand() * 0.3 });
    }
  }
  return out;
})();
const CUT_SHINE = dotsPath(CUT_ARILS.map((a) => [a.x - 3, a.y - 2.5] as [number, number]), 2);
const MEMBRANES = [20, 78, 136, 196, 252, 312]
  .map((deg) => {
    const [x1, y1] = polar(200, 262, 150, deg);
    const [cx, cy] = polar(200, 262, 80, deg + 18);
    return `M200 262Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`;
  })
  .join("");

export function CutFace() {
  return (
    <g>
      <circle cx="200" cy="262" r="166" fill={RED} />
      <circle cx="200" cy="262" r="166" fill="url(#an-skin)" opacity="0.6" />
      <circle cx="200" cy="262" r="154" fill={PITH} />
      {CUT_ARILS.map((a, i) => (
        <ellipse
          key={i}
          cx={f(a.x)}
          cy={f(a.y)}
          rx={f(9.4 * a.s)}
          ry={f(7.2 * a.s)}
          transform={`rotate(${f(a.deg)} ${f(a.x)} ${f(a.y)})`}
          fill="url(#an-aril)"
        />
      ))}
      <path d={CUT_SHINE} fill="#FFFFFF" opacity="0.65" />
      <path d={MEMBRANES} fill="none" stroke={PITH} strokeWidth="6" strokeLinecap="round" opacity="0.92" />
      <circle cx="200" cy="262" r="12" fill={PITH} />
      <circle cx="200" cy="262" r="154" fill="none" stroke="#EBCBB2" strokeWidth="3" />
    </g>
  );
}

/** Bitta dona (konfetti va belgilar uchun), markazi (0,0) */
export function Aril({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M0 -11C7 -11 10 -4 10 2C10 8 5 11 0 11C-5 11 -10 8 -10 2C-10 -4 -7 -11 0 -11Z" fill="url(#an-aril)" />
      <ellipse cx="-3.4" cy="-4" rx="2.6" ry="3.4" fill="#FFFFFF" opacity="0.7" transform="rotate(-24 -3.4 -4)" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Bezaklar                                                             */
/* ------------------------------------------------------------------ */

/** Burchak: shox, barglar, gul va g'o'r anor */
function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden overflow="visible">
      <path d="M2 4C24 16 46 26 74 34M8 2C18 26 26 50 30 80" fill="none" stroke="#5B3A2A" strokeWidth="1.8" strokeLinecap="round" />
      <AnorLeaf x={40} y={22} deg={-12} len={44} />
      <AnorLeaf x={56} y={30} deg={36} len={38} />
      <AnorLeaf x={18} y={44} deg={112} len={40} />
      <AnorLeaf x={24} y={64} deg={60} len={34} />
      <Blossom x={80} y={38} s={0.9} deg={70} />
      <g transform="translate(31 92) scale(0.12) translate(-200 -262)">
        <Fruit leaves={false} />
      </g>
    </svg>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 48" aria-hidden overflow="visible">
      <path d="M12 30H96M164 30H248" stroke="#C98A93" strokeWidth="1" />
      <AnorLeaf x={118} y={28} deg={-168} len={34} />
      <AnorLeaf x={142} y={28} deg={-12} len={34} />
      <g transform="translate(130 28) scale(0.085) translate(-200 -262)">
        <Fruit leaves={false} />
      </g>
      <path d={dotsPath([[100, 30], [160, 30]], 2)} fill={RED} />
    </svg>
  );
}

function Bullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-12 -12 24 24" width="20" height="20" aria-hidden>
      <Aril s={0.95} />
    </svg>
  );
}

/** Monogramma: anor, ichida bosh harflar */
function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 400 440" aria-hidden overflow="visible">
      <Fruit />
      <text
        x="200"
        y={b ? 300 : 312}
        textAnchor="middle"
        fontSize={b ? 120 : 150}
        fontStyle="italic"
        fontWeight="500"
        fill="#FFF3EE"
        style={{ fontFamily: "var(--an-display), Georgia, serif" }}
      >
        {b ? `${a}${b}` : a}
      </text>
    </svg>
  );
}

/** Taqvimda kun: donalar halqasi */
function DayMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g className="an-ring">
        {Array.from({ length: 12 }, (_, k) => {
          const [x, y] = polar(30, 30, 25, k * 30);
          return (
            <g key={k} transform={`translate(${f(x)} ${f(y)}) rotate(${k * 30})`}>
              <Aril s={0.28} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Manzil: anorzor ichidagi shiypon */
function VenueArt({ className }: { className?: string }) {
  const bush = (cx: number, cy: number, w: number, seed: number) => {
    const rand = rng(seed);
    return (
      <g>
        <path d={`M${cx - 2} 172V${cy + 14}`} stroke="#5B3A2A" strokeWidth="3" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = rand() * 360;
          const r = Math.sqrt(rand()) * w;
          const [x, y] = polar(cx, cy, r, a);
          return <AnorLeaf key={i} x={x} y={y * 0.9 + cy * 0.1} deg={rand() * 360} len={20 + rand() * 10} />;
        })}
        {Array.from({ length: 4 }, (_, i) => {
          const [x, y] = polar(cx, cy, w * 0.6, 40 + i * 80 + rand() * 30);
          return (
            <g key={i} transform={`translate(${f(x)} ${f(y)}) scale(0.04) translate(-200 -262)`}>
              <Fruit leaves={false} />
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <svg className={className} viewBox="0 0 320 196" aria-hidden overflow="visible">
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* Shiypon */}
        <path d="M100 172H220V162H100Z" fill="#E9CFC3" stroke={RED_DEEP} strokeWidth="1.2" />
        <path d="M116 80C116 52 204 52 204 80Z" fill={RED} stroke={RED_DEEP} strokeWidth="1.3" />
        <path d="M140 80C140 62 152 54 160 52M180 80C180 62 168 54 160 52" stroke="#E8394F" strokeWidth="1" fill="none" />
        <path d="M160 52V40" stroke="#B8913A" strokeWidth="1.6" />
        <circle cx="160" cy="37" r="3.6" fill="#D8B45A" />
        <path d="M106 80H214L208 92H112Z" fill="#F4DCD3" stroke={RED_DEEP} strokeWidth="1.2" />
        <path d="M118 92V162M160 92V162M202 92V162" stroke="#7A4A35" strokeWidth="4" />
        <path d="M118 108Q139 96 160 108Q181 96 202 108" fill="none" stroke="#7A4A35" strokeWidth="1.6" />
        <path d="M160 92V118" stroke="#7A4A35" strokeWidth="1" />
        <path d="M152 118H168L166 132H154Z" fill="#E8394F" stroke={RED_DEEP} strokeWidth="1" />
        <path d="M118 142H202" stroke="#7A4A35" strokeWidth="1.6" />
        <path d="M128 142V160M140 142V160M180 142V160M192 142V160" stroke="#7A4A35" strokeWidth="0.9" />

        {/* Anor butalari */}
        {bush(56, 118, 40, 3)}
        {bush(266, 122, 38, 9)}

        {/* Yer */}
        <path d="M6 172H314" stroke={GREEN} strokeWidth="1.4" />
        <path d="M40 182H130M190 182H280" stroke="#C98A93" strokeWidth="1" strokeDasharray="2 5" />
      </g>
    </svg>
  );
}

/** Javob qabul qilinganda: anor tamg'asi */
function Stamp({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <g filter="url(#an-ink)">
        <circle cx="60" cy="60" r="55" fill="none" stroke={RED} strokeWidth="2.4" />
        <circle cx="60" cy="60" r="47" fill="none" stroke={RED} strokeWidth="1" />
        <path d={dotsPath(Array.from({ length: 24 }, (_, k) => polar(60, 60, 51, k * 15)), 1.3)} fill={RED} />
        <path d="M48 32L52 24L56 30L60 22L64 30L68 24L72 32Z" fill={RED} />
        <text x="60" y={b ? 74 : 78} textAnchor="middle" fontSize={b ? 28 : 34} fontStyle="italic" fontWeight="500" fill={RED} style={{ fontFamily: "var(--an-display), Georgia, serif" }}>
          {b ? `${a}${b}` : a}
        </text>
      </g>
    </svg>
  );
}

export const anorDecor: DecorSet = {
  Corner,
  Divider,
  Emblem,
  Bullet,
  DayMark,
  VenueArt,
  Stamp,
  Defs: AnorDefs,
};
