"use client";

/**
 * Non bezaklari — hammasi kodda chizilgan original SVG:
 * tandir noni (gardishi, kunjut va sedana, o'rtasida chekich naqshi),
 * bug'doy boshoqlari, chekich gul-tamg'asi, hovli darvozasi va tandir.
 */
import type { DecorSet } from "../contract";

const CRUST = "#8A3F16";
const CRUST_DEEP = "#5E2A0E";
const WHEAT = "#C08A36";
const WHEAT_DEEP = "#8A5A1C";

/* ------------------------------------------------------------------ */
/* Yordamchilar                                                         */
/* ------------------------------------------------------------------ */

/** Takrorlanadigan tasodifiy sonlar: server va brauzerda bir xil rasm */
function rng(seed: number) {
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

/** Ko'p kichik doirani bitta path'ga yig'ish (yuzlab element o'rniga bitta) */
function dotsPath(points: [number, number][], r: number) {
  return points.map(([x, y]) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join("");
}

/** Burilgan ellipslarni bitta path'ga yig'ish (kunjut donlari) */
function seedsPath(seeds: { x: number; y: number; rx: number; ry: number; deg: number }[]) {
  return seeds
    .map(({ x, y, rx, ry, deg }) => {
      const a = (deg * Math.PI) / 180;
      const dx = rx * Math.cos(a);
      const dy = rx * Math.sin(a);
      return `M${f(x - dx)} ${f(y - dy)}A${rx} ${ry} ${deg.toFixed(1)} 1 0 ${f(x + dx)} ${f(y + dy)}A${rx} ${ry} ${deg.toFixed(1)} 1 0 ${f(x - dx)} ${f(y - dy)}Z`;
    })
    .join("");
}

function ring(cx: number, cy: number, r: number, n: number, offsetDeg = 0): [number, number][] {
  return Array.from({ length: n }, (_, i) => polar(cx, cy, r, offsetDeg + (i * 360) / n));
}

/** Qo'lda yoyilgan xamir: biroz notekis aylana (Catmull-Rom → Bezier) */
function doughOutline(cx: number, cy: number, base: number, seed: number) {
  const rand = rng(seed);
  const n = 24;
  const ph = [rand() * 6, rand() * 6, rand() * 6];
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = base + 1.4 * Math.sin(3 * a + ph[0]) + 0.9 * Math.sin(5 * a + ph[1]) + 0.6 * Math.sin(8 * a + ph[2]);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
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

export function NonDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        {/* Tandirda qizargan gardish: ichkarisi oltin, cheti to'q */}
        <radialGradient id="nn-crust" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.56" stopColor="#E9B15C" />
          <stop offset="0.66" stopColor="#DD9C47" />
          <stop offset="0.8" stopColor="#C97C31" />
          <stop offset="0.9" stopColor="#A95B1F" />
          <stop offset="0.965" stopColor="#86410F" />
          <stop offset="1" stopColor="#5C290A" />
        </radialGradient>

        {/* Nonning o'rtasi: yupqa, och oltin */}
        <radialGradient id="nn-top" cx="0.46" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#F4D99C" />
          <stop offset="0.65" stopColor="#ECC47C" />
          <stop offset="1" stopColor="#D79F55" />
        </radialGradient>

        {/* Yuqori-chapdan tushgan yorug'lik */}
        <linearGradient id="nn-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.3" />
          <stop offset="0.42" stopColor="#FFF4D6" stopOpacity="0" />
          <stop offset="0.6" stopColor="#3A1500" stopOpacity="0" />
          <stop offset="1" stopColor="#3A1500" stopOpacity="0.34" />
        </linearGradient>

        <linearGradient id="nn-lip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE9B8" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#FFE9B8" stopOpacity="0" />
        </linearGradient>

        {/* Gardish bo'rtmasi: xira alfa ustida yaltirash */}
        <filter id="nn-bake" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b" />
          <feSpecularLighting in="b" surfaceScale="5" specularConstant="0.75" specularExponent="16" lightingColor="#FFE6BC" result="s">
            <fePointLight x="70" y="30" z="240" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="si" />
          <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3="0.6" k4="0" />
        </filter>

        {/* Pishgan xamir g'ovakligi */}
        <filter id="nn-tex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 .36  0 0 0 0 .17  0 0 0 0 .05  0 0 0 1.5 -.6" result="c" />
          <feComposite in="c" in2="SourceAlpha" operator="in" />
        </filter>

        <filter id="nn-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        {/* Siyoh tamg'a: chetlari notekis bosilgan */}
        <filter id="nn-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Non                                                                  */
/* ------------------------------------------------------------------ */

const C = 200;
const OUTER = 186;
const INNER = 113;
export const LOAF_PATH = doughOutline(C, C, OUTER, 21);
const RIM_PATH = `${LOAF_PATH}M${C - INNER} ${C}a${INNER} ${INNER} 0 1 0 ${2 * INNER} 0a${INNER} ${INNER} 0 1 0 ${-2 * INNER} 0Z`;

/** Chekich naqshi: ikki halqa, 12 barg, initsiallar atrofida halqa */
const DOCK_POINTS = (() => {
  const pts: [number, number][] = [...ring(C, C, 102, 46, 4), ...ring(C, C, 94, 40), ...ring(C, C, 36, 18, 10)];
  for (let k = 0; k < 12; k++) {
    const th = k * 30;
    for (const side of [-1, 1]) {
      const p0 = polar(C, C, 44, th + side * 12);
      const p1 = polar(C, C, 70, th + side * 15);
      const p2 = polar(C, C, 86, th);
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
        const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
        pts.push([x, y]);
      }
    }
    pts.push(polar(C, C, 86, th), polar(C, C, 62, th));
  }
  return pts;
})();
const DOCK_DARK = dotsPath(DOCK_POINTS, 2);
const DOCK_LIGHT = dotsPath(
  DOCK_POINTS.map(([x, y]) => [x + 0.8, y + 0.9] as [number, number]),
  2.1,
);

/** Gardishdagi kunjut (oq) va sedana (qora) donlari */
function rimSeeds(count: number, seed: number) {
  const rand = rng(seed);
  const sesame: { x: number; y: number; rx: number; ry: number; deg: number }[] = [];
  const nigella: typeof sesame = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * 360;
    const r = INNER + 9 + Math.sqrt(rand()) * (OUTER - INNER - 22);
    const [x, y] = polar(C, C, r, a);
    const item = { x, y, rx: 2.9 + rand() * 0.9, ry: 1.3 + rand() * 0.35, deg: rand() * 180 };
    if (rand() < 0.14) nigella.push({ ...item, rx: item.rx * 0.6, ry: item.ry * 0.85 });
    else sesame.push(item);
  }
  return {
    sesame: seedsPath(sesame),
    shadow: seedsPath(sesame.map((s) => ({ ...s, x: s.x + 0.9, y: s.y + 1.2 }))),
    nigella: seedsPath(nigella),
  };
}

const SEEDS = rimSeeds(360, 5);

/** Tandir devoridan qolgan to'q dog'lar */
const BLISTERS = (() => {
  const rand = rng(9);
  return Array.from({ length: 16 }, () => {
    const [x, y] = polar(C, C, OUTER - 14 - rand() * 30, rand() * 360);
    return { x, y, rx: 6 + rand() * 9, ry: 4 + rand() * 5, deg: rand() * 180, o: 0.18 + rand() * 0.2 };
  });
})();

/**
 * Butun non (400×400 birlik). Ochilish sahnasida bir marta <defs> ichida chiziladi
 * va ikki yarmi <use> orqali qayta ishlatiladi.
 */
export function Loaf({ initials, id }: { initials: [string, string?]; id?: string }) {
  const [a, b] = initials;
  const letters = b ? (
    <>
      <text x={C - 14} y={C + 11} fontSize="34">
        {a}
      </text>
      <text x={C + 14} y={C + 11} fontSize="34">
        {b}
      </text>
    </>
  ) : (
    <text x={C} y={C + 13} fontSize="40">
      {a}
    </text>
  );
  return (
    <g id={id}>
      {/* Gardish */}
      <path d={RIM_PATH} fillRule="evenodd" fill="url(#nn-crust)" filter="url(#nn-bake)" />
      <path d={RIM_PATH} fillRule="evenodd" fill="#000" filter="url(#nn-tex)" opacity="0.55" />
      <g filter="url(#nn-soft)">
        {BLISTERS.map((p, i) => (
          <ellipse key={i} cx={f(p.x)} cy={f(p.y)} rx={f(p.rx)} ry={f(p.ry)} transform={`rotate(${f(p.deg)} ${f(p.x)} ${f(p.y)})`} fill="#5C2508" opacity={f(p.o)} />
        ))}
      </g>

      {/* O'rtasi */}
      <circle cx={C} cy={C} r={INNER} fill="url(#nn-top)" />
      <circle cx={C} cy={C} r={INNER} fill="#000" filter="url(#nn-tex)" opacity="0.3" />
      <circle cx={C} cy={C} r={INNER - 3} fill="none" stroke="#6E3410" strokeOpacity="0.38" strokeWidth="9" filter="url(#nn-soft)" />
      <circle cx={C} cy={C} r={INNER + 2} fill="none" stroke="url(#nn-lip)" strokeWidth="2.4" />

      {/* Chekich izlari: chuqurcha = yorug' qirra + soya */}
      <path d={DOCK_LIGHT} fill="#FFF1CF" opacity="0.6" />
      <path d={DOCK_DARK} fill="#8C4E1C" opacity="0.72" />

      {/* Initsiallar — xamirga bosilgan */}
      <g textAnchor="middle" fontStyle="italic" fontWeight="700" style={{ fontFamily: "var(--nn-serif), Georgia, serif" }} aria-hidden>
        <g fill="#FFF0C8" opacity="0.8" transform="translate(1.1 1.3)">
          {letters}
        </g>
        <g fill="#6E3612" opacity="0.85" transform="translate(-0.7 -0.8)">
          {letters}
        </g>
        <g fill="#B8732C">{letters}</g>
      </g>

      {/* Kunjut va sedana */}
      <path d={SEEDS.shadow} fill="#4A1E06" opacity="0.38" />
      <path d={SEEDS.sesame} fill="#F8EACB" />
      <path d={SEEDS.nigella} fill="#2B1B14" />

      {/* Umumiy yorug'lik */}
      <path d={LOAF_PATH} fill="url(#nn-light)" />
    </g>
  );
}

/**
 * Haqiqiy non surati (loaf.webp), xamir chetining o'ziga xos shakliga (LOAF_PATH) kesilgan,
 * ustiga bosh harflar bosilgan. Opening'dagi split (yorilish) mexanikasi o'zgarishsiz qoladi —
 * faqat chizilgan Loaf o'rniga shu rasm <use> orqali ikki marta (chap/o'ng yarmi) ko'rsatiladi.
 */
export function PhotoLoaf({ initials, id }: { initials: [string, string?]; id?: string }) {
  const [a, b] = initials;
  const letters = b ? (
    <>
      <text x={C - 14} y={C + 11} fontSize="30">
        {a}
      </text>
      <text x={C + 14} y={C + 11} fontSize="30">
        {b}
      </text>
    </>
  ) : (
    <text x={C} y={C + 13} fontSize="36">
      {a}
    </text>
  );
  return (
    <g id={id} clipPath="url(#nn-loaf-clip)">
      <image
        href="/templates/non/loaf.webp"
        x={C - OUTER}
        y={C - OUTER}
        width={OUTER * 2}
        height={OUTER * 2}
        preserveAspectRatio="xMidYMid slice"
      />
      <g textAnchor="middle" fontStyle="italic" fontWeight="700" style={{ fontFamily: "var(--nn-serif), Georgia, serif" }} aria-hidden>
        <g fill="#2B1B14" opacity="0.55" transform="translate(1 1.3)">
          {letters}
        </g>
        <g fill="#FFF1CF">{letters}</g>
      </g>
      <path d={LOAF_PATH} fill="url(#nn-light)" opacity="0.5" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Bug'doy boshog'i                                                     */
/* ------------------------------------------------------------------ */

/** Boshoq +x yo'nalishida: poyasi (0,0) dan (len,0) gacha */
function WheatEar({ x, y, deg, len = 56, grains = 6, color = WHEAT, line = WHEAT_DEEP }: { x: number; y: number; deg: number; len?: number; grains?: number; color?: string; line?: string }) {
  const start = len * 0.34;
  const step = (len - start) / grains;
  const items: { gx: number; side: number }[] = [];
  for (let i = 0; i < grains; i++) {
    items.push({ gx: start + i * step, side: -1 }, { gx: start + i * step + step / 2, side: 1 });
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg})`}>
      <path d={`M0 0Q${len * 0.5} ${-1.2} ${len} 0`} fill="none" stroke={line} strokeWidth="1.1" strokeLinecap="round" />
      <g fill="none" stroke={line} strokeWidth="0.55" strokeLinecap="round" opacity="0.8">
        {items.map(({ gx, side }, i) => (
          <path key={i} d={`M${f(gx + 4.4)} ${f(side * 4.6)}L${f(gx + 16)} ${f(side * 9.5)}`} />
        ))}
        <path d={`M${len + 6} 0L${len + 19} 0`} />
      </g>
      {items.map(({ gx, side }, i) => (
        <g key={i} transform={`translate(${f(gx + 1.6)} ${f(side * 3)}) rotate(${side * 30})`}>
          <ellipse rx="4.6" ry="2.3" fill={color} stroke={line} strokeWidth="0.6" />
          <path d="M-3 0H3" stroke={line} strokeWidth="0.45" opacity="0.7" />
        </g>
      ))}
      <ellipse cx={len + 2.4} cy="0" rx="4.2" ry="2.1" fill={color} stroke={line} strokeWidth="0.6" />
    </g>
  );
}

/** Kichik chekich guli: markaziy nuqta atrofida doira-nuqtalar */
function Rosette({ x, y, r = 7, n = 8, dot = 1.5, color = CRUST }: { x: number; y: number; r?: number; n?: number; dot?: number; color?: string }) {
  return (
    <g fill={color}>
      <path d={dotsPath(ring(x, y, r, n), dot)} />
      <circle cx={x} cy={y} r={dot * 1.35} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Bezaklar                                                             */
/* ------------------------------------------------------------------ */

/** Dasturxon burchagi: kesishgan ikki boshoq va chekich guli */
function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <WheatEar x={10} y={22} deg={-4} len={70} grains={7} />
      <WheatEar x={22} y={10} deg={94} len={70} grains={7} />
      <WheatEar x={16} y={16} deg={45} len={40} grains={4} color="#D9AE62" />
      <Rosette x={16} y={16} r={6.5} n={8} dot={1.4} />
    </svg>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 40" aria-hidden>
      <path d="M8 20H52M208 20H252" stroke={WHEAT} strokeWidth="1.3" strokeDasharray="5 4" strokeLinecap="round" />
      <WheatEar x={116} y={20} deg={180} len={46} grains={5} />
      <WheatEar x={144} y={20} deg={0} len={46} grains={5} />
      <Rosette x={130} y={20} r={7} n={8} dot={1.5} />
    </svg>
  );
}

function Bullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <g transform="translate(10 10) rotate(-38)">
        <ellipse rx="7" ry="3.6" fill={WHEAT} stroke={WHEAT_DEEP} strokeWidth="0.9" />
        <path d="M-4.6 0H4.6" stroke={WHEAT_DEEP} strokeWidth="0.8" />
      </g>
    </svg>
  );
}

/** Monogramma: chekich tamg'asi va bug'doy gulchambari */
function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  // Chap shox: pastdan (196°) yuqori-chapga (304°), o'ng shox — ko'zgu aksi
  const wreath = Array.from({ length: 9 }, (_, i) => {
    const t = 200 + i * 12.5;
    const [x, y] = polar(80, 80, 66, t);
    return { x, y, deg: t };
  });
  const [sx, sy] = polar(80, 80, 66, 194);
  const [ex, ey] = polar(80, 80, 66, 306);
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden>
      {[1, -1].map((m) => (
        <g key={m} transform={m === -1 ? "translate(160 0) scale(-1 1)" : undefined}>
          <path d={`M${f(sx)} ${f(sy)}A66 66 0 0 1 ${f(ex)} ${f(ey)}`} fill="none" stroke={WHEAT_DEEP} strokeWidth="1" strokeLinecap="round" />
          {wreath.map((w, i) => (
            <g key={i} transform={`translate(${f(w.x)} ${f(w.y)}) rotate(${f(w.deg)})`}>
              <ellipse cx="2" cy="-3.6" rx="5.4" ry="2.5" fill={WHEAT} stroke={WHEAT_DEEP} strokeWidth="0.6" transform="rotate(-28)" />
              <ellipse cx="2" cy="3.6" rx="5.4" ry="2.5" fill={WHEAT} stroke={WHEAT_DEEP} strokeWidth="0.6" transform="rotate(28)" />
            </g>
          ))}
          <ellipse cx={f(ex)} cy={f(ey)} rx="5" ry="2.4" fill={WHEAT} stroke={WHEAT_DEEP} strokeWidth="0.6" transform={`rotate(306 ${f(ex)} ${f(ey)}) translate(4 0)`} />
        </g>
      ))}
      <path d={dotsPath(ring(80, 80, 52, 36), 1.7)} fill={CRUST} />
      <circle cx="80" cy="80" r="45" fill="none" stroke={WHEAT} strokeWidth="1" />
      <path d={dotsPath(ring(80, 80, 39, 28, 6), 1.2)} fill={CRUST} opacity="0.75" />
      <g textAnchor="middle" fontStyle="italic" fontWeight="500" fill={CRUST} style={{ fontFamily: "var(--nn-serif), Georgia, serif" }}>
        {b ? (
          <>
            <text x="64" y="90" fontSize="34">
              {a}
            </text>
            <text x="96" y="90" fontSize="34">
              {b}
            </text>
            <circle cx="80" cy="81" r="1.8" fill={WHEAT} />
          </>
        ) : (
          <text x="80" y="93" fontSize="40">
            {a}
          </text>
        )}
      </g>
    </svg>
  );
}

/** Taqvimda kun: chekich nuqtalari halqasi */
function DayMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g className="nn-ring">
        <circle cx="30" cy="30" r="25" fill="none" stroke={CRUST} strokeWidth="2.6" strokeDasharray="0 5.5" strokeLinecap="round" />
        <circle cx="30" cy="30" r="20.5" fill="none" stroke={WHEAT} strokeWidth="0.9" />
      </g>
    </svg>
  );
}

/** Manzil chizmasi: hovli darvozasi, devor, tut daraxti va tandir */
function VenueArt({ className }: { className?: string }) {
  const doorPanels = (x: number) => (
    <g>
      <rect x={x} y="88" width="34" height="80" fill="#DDBB82" stroke={CRUST} strokeWidth="1.3" />
      {[94, 122, 148].map((py, i) => (
        <rect key={i} x={x + 5} y={py} width="24" height={i === 1 ? 20 : 22} fill="none" stroke={CRUST} strokeWidth="0.9" rx="1" />
      ))}
      <circle cx={x + 17} cy="132" r="2.2" fill={CRUST} />
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 320 196" aria-hidden>
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* Devor */}
        <path d="M14 104H112V172H14ZM208 104H306V172H208Z" fill="#EAD8B4" stroke={CRUST} strokeWidth="1.4" />
        <path d="M14 104h98M208 104h98" stroke={CRUST} strokeWidth="3" />
        <path d="M30 124h22M68 140h26M226 122h20M262 146h24" stroke={WHEAT_DEEP} strokeWidth="0.9" opacity="0.6" />

        {/* Tut daraxti */}
        <path d="M58 172C60 150 54 132 64 108" fill="none" stroke={CRUST_DEEP} strokeWidth="3" />
        <path d="M62 120C52 112 46 104 42 96" fill="none" stroke={CRUST_DEEP} strokeWidth="1.6" />
        <path
          d="M24 92c-8-8-2-24 12-22 2-14 22-18 30-6 10-10 30-4 30 10 12 2 14 20 2 24 2 12-14 18-22 10-8 8-24 6-26-4-14 4-26-4-26-12z"
          fill="#E3C584"
          stroke={CRUST}
          strokeWidth="1.3"
        />
        <path d={dotsPath([[40, 84], [56, 76], [72, 88], [84, 78], [62, 96], [46, 98], [82, 98]], 1.6)} fill={CRUST} opacity="0.7" />

        {/* Darvoza */}
        <path d="M112 172V84C112 52 132 38 160 36C188 38 208 52 208 84V172" fill="#EAD8B4" stroke={CRUST} strokeWidth="1.6" />
        <path d="M122 88C122 62 138 50 160 48C182 50 198 62 198 88Z" fill="#F4E6C6" stroke={CRUST} strokeWidth="1.2" />
        <Rosette x={160} y={70} r={8} n={10} dot={1.5} />
        {doorPanels(125)}
        {doorPanels(161)}

        {/* Tandir */}
        <path d="M236 172C234 142 244 122 262 120C280 122 290 142 288 172Z" fill="#E1B97A" stroke={CRUST} strokeWidth="1.4" />
        <ellipse cx="262" cy="122" rx="9" ry="3" fill={CRUST_DEEP} />
        <path d="M242 152C254 156 270 156 284 152M240 164C254 168 270 168 286 164" fill="none" stroke={CRUST} strokeWidth="0.8" opacity="0.6" />
        <path d="M258 112c-4-6 4-10 0-16s4-10 0-16M268 110c-3-5 3-8 0-13" fill="none" stroke={WHEAT} strokeWidth="1.2" opacity="0.8" />

        {/* Yer */}
        <path d="M6 172H314" stroke={CRUST} strokeWidth="1.4" />
        <path d="M30 182H120M160 182H290" stroke={WHEAT} strokeWidth="1" strokeDasharray="5 5" />
      </g>
    </svg>
  );
}

/** Javob qabul qilinganda: non tamg'asi (chekich) izi */
function Stamp({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <g filter="url(#nn-ink)" fill={CRUST}>
        <circle cx="60" cy="60" r="55" fill="none" stroke={CRUST} strokeWidth="2.6" />
        <path d={dotsPath(ring(60, 60, 48, 34), 1.8)} />
        <circle cx="60" cy="60" r="41" fill="none" stroke={CRUST} strokeWidth="1.1" />
        {Array.from({ length: 12 }, (_, k) => (
          <path key={k} d={dotsPath([polar(60, 60, 35, k * 30), polar(60, 60, 30, k * 30 + 6), polar(60, 60, 30, k * 30 - 6)], 1.3)} />
        ))}
        <text x="60" y="70" textAnchor="middle" fontSize={b ? 26 : 32} fontStyle="italic" fontWeight="700" style={{ fontFamily: "var(--nn-serif), Georgia, serif" }}>
          {b ? `${a}·${b}` : a}
        </text>
      </g>
    </svg>
  );
}

export const nonDecor: DecorSet = {
  Corner,
  Divider,
  Emblem,
  Bullet,
  DayMark,
  VenueArt,
  Stamp,
  Defs: NonDefs,
};
