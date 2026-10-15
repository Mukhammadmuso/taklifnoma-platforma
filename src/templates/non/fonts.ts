import { Alegreya, Alegreya_Sans } from "next/font/google";

/**
 * Qamrov tekshirildi (canvas o'lchov testi, 2026-10):
 *  - Alegreya, Alegreya Sans: lotin + kirill, Ғ Қ Ҳ Ў to'liq → ikkala yozuvda bir xil shrift
 * Alegreya — qo'lda yozilgandek iliq kitob shrifti (sarlavhalar kursivda),
 * Alegreya Sans — yorliqlar uchun shu oiladan.
 */
export const serif = Alegreya({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--nn-serif",
  display: "swap",
});

export const sans = Alegreya_Sans({
  weight: ["500", "700"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--nn-sans",
  display: "swap",
});
