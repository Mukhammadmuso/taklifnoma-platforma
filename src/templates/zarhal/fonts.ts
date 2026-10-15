import { Cormorant_Garamond, Montserrat } from "next/font/google";

/**
 * Qamrov tekshirildi (canvas o'lchov testi, 2026-10):
 *  - Cormorant Garamond, Montserrat: lotin + kirill, Ғ Қ Ҳ Ў to'liq
 * Cormorant Garamond — nafis, yirik ismlar va sarlavhalar; Montserrat — zamonaviy, keng oraliqli yorliqlar.
 */
export const display = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--zh-display",
  display: "swap",
});

export const label = Montserrat({
  weight: ["500", "600"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--zh-label",
  display: "swap",
});
