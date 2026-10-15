import { EB_Garamond, Forum, Great_Vibes } from "next/font/google";

/**
 * Qamrov tekshirildi (canvas o'lchov testi, 2026-10):
 *  - Great Vibes: lotin to'liq, kirillda Ғ Қ Ҳ YO'Q → faqat lotin yozuvida ishlatiladi
 *  - Kirill yozuvida sarlavha va ismlar EB Garamond kursivida (rasmiy, to'liq qamrov);
 *    monogrammada Great Vibes, yo'q harf bo'lsa EB Garamond'ga o'tadi
 *  - EB Garamond, Forum: lotin + kirill to'liq
 */
export const script = Great_Vibes({
  weight: "400",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--mk-script",
  display: "swap",
});

export const body = EB_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--mk-body",
  display: "swap",
});

export const label = Forum({
  weight: "400",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--mk-label",
  display: "swap",
});
