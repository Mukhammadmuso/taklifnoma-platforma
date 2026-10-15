import { Arsenal, Noto_Serif_Display, Source_Serif_4 } from "next/font/google";

/**
 * Qamrov tekshirildi (canvas o'lchov testi, 2026-10):
 *  - Noto Serif Display, Source Serif 4, Arsenal: lotin + kirill, Ғ Қ Ҳ Ў to'liq
 * Noto Serif Display — yuqori kontrastli nafis sarlavhalar (kursivda ismlar),
 * Source Serif 4 — asosiy matn, Arsenal — yorliqlar.
 */
export const display = Noto_Serif_Display({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--an-display",
  display: "swap",
});

export const text = Source_Serif_4({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--an-text",
  display: "swap",
});

export const label = Arsenal({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--an-label",
  display: "swap",
});
