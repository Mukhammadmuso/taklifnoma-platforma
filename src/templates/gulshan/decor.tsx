"use client";

/**
 * Gulshan bezaklari: oltin jingalak ajratgich (SVG, original chizma).
 * Asosiy illyustratsiyalar — public/templates/gulshan/ dagi rasmlar (foydalanuvchi tomonidan tayyorlangan).
 */
import type { DecorSet } from "../contract";

const GOLD = "#B08A3E";
export const ASSETS = {
  hero: "/templates/gulshan/hero.webp",
  bouquet: "/templates/gulshan/bouquet.webp",
  venue: "/templates/gulshan/venue.webp",
  /** Nikoh/fotihada: kelin-kuyov arka tomon ketayotgani */
  closingCouple: "/templates/gulshan/closing.webp",
  /** Sunnat to'yida: bola arka tomon ketayotgani */
  closingSunnat: "/templates/gulshan/closing-sunnat.webp",
  /** Qolgan tadbirlarda: odamsiz bog' va arka */
  closingNeutral: "/templates/gulshan/closing-neutral.webp",
  envelope: "/templates/gulshan/envelope-front.webp",
  seal: "/templates/gulshan/seal.webp",
  glow: "/templates/gulshan/inside-glow.webp",
  frame: "/templates/gulshan/photo-frame.webp",
};

/** Ajratgich: markazda kichik toj-gul, ikki tomonda ko'zgudek jingalaklar va barglar */
function Divider({ className }: { className?: string }) {
  const half = (
    <g fill="none" stroke={GOLD} strokeLinecap="round" strokeLinejoin="round">
      <path d="M118 30C104 30 98 20 88 20C78 20 75 31 83 33C90 35 92 26 86 25" strokeWidth="1.3" />
      <path d="M118 30C104 31 97 39 86 40C76 41 72 35 74 31" strokeWidth="1" />
      <path d="M86 20C74 13 60 16 52 24C46 30 36 31 30 27" strokeWidth="1.1" />
      <path d="M58 21c-3-5 0-9 5-9-1 4-2 7-5 9zM46 27c-4-3-4-8 0-10 1 4 1 7 0 10zM70 16c-2-5 1-8 6-8-1 4-3 6-6 8z" fill={GOLD} fillOpacity="0.35" strokeWidth="0.8" />
      <path d="M30 27C22 23 14 26 8 30" strokeWidth="0.8" opacity="0.8" />
      <circle cx="6" cy="30.5" r="1.6" fill={GOLD} stroke="none" />
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 260 48" aria-hidden>
      {half}
      <g transform="translate(260 0) scale(-1 1)">{half}</g>
      <g fill="none" stroke={GOLD} strokeWidth="1.1" strokeLinejoin="round">
        <path d="M130 34c-6-3-9-9-6-15 3 3 5 7 6 15zM130 34c6-3 9-9 6-15-3 3-5 7-6 15zM130 34c-2-6-2-13 0-19 2 6 2 13 0 19z" fill={GOLD} fillOpacity="0.25" />
        <path d="M121 36h18" />
        <circle cx="130" cy="11" r="2" fill={GOLD} />
      </g>
    </svg>
  );
}

/**
 * Lak muhr: haqiqiy rasm (seal.webp, harfsiz) + ustiga bosh harflar.
 * SVG ichida <image> sifatida qo'yiladi — shunda className orqali istalgan joyda (ochilish tugmasi,
 * javob muhri) bir xil nisbatda kattalashadi, alohida o'lcham hisoblash shart emas.
 */
export function WaxSeal({ initials, className }: { initials: [string, string?]; className?: string }) {
  const [a, b] = initials;
  const label = b ? `${a} & ${b}` : a;
  const y = b ? 57 : 60;
  const size = b ? 20 : 25;
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <image href={ASSETS.seal} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
      <text x="50" y={y} textAnchor="middle" fontSize={size} fill="#F3DE9C" style={{ fontFamily: "var(--gs-script), var(--gs-serif), serif" }}>
        {label}
      </text>
      <text
        x="50"
        y={y}
        textAnchor="middle"
        fontSize={size}
        fill="none"
        stroke="#7A5A22"
        strokeWidth="0.35"
        style={{ fontFamily: "var(--gs-script), var(--gs-serif), serif" }}
      >
        {label}
      </text>
    </svg>
  );
}

/** Taqvimda kun — kichik lak muhr rangidagi halqa (raqam ustiga yoziladi) */
function DayMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden>
      <g className="gs-seal">
        <circle cx="30" cy="30" r="23" fill="#9E1B2C" />
        <circle cx="30" cy="30" r="23" fill="url(#gs-daymark)" />
        <circle cx="30" cy="30" r="18.5" fill="none" stroke="#E2C67F" strokeWidth="1" opacity="0.85" />
      </g>
      <defs>
        <radialGradient id="gs-daymark" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Emblem({ initials, className }: { initials: [string, string?]; className?: string }) {
  return <WaxSeal initials={initials} className={className} />;
}

function Bullet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
      <path d="M10 4c3 3 3 9 0 12-3-3-3-9 0-12z" fill={GOLD} fillOpacity="0.4" stroke={GOLD} strokeWidth="1" />
    </svg>
  );
}

/** To'yxona rasmi (o'z surati yuklanmagan bo'lsa) */
function VenueArt({ className }: { className?: string }) {
  return <img className={className} src={ASSETS.venue} alt="" width={1117} height={726} loading="lazy" decoding="async" />;
}

function Corner() {
  return null;
}

export const gulshanDecor: DecorSet = { Corner, Divider, Emblem, Bullet, DayMark, VenueArt, Stamp: WaxSeal };
