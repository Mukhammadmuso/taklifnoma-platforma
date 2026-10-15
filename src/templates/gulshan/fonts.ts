import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";

/**
 * Pinyon Script — ismlar va sarlavhalar (faqat lotin; kirillda Cormorant Garamond kursiviga o'tadi,
 * Ғ Қ Ҳ Ў harflari shu shriftda to'liq). Cormorant Garamond — matn va yorliqlar.
 */
export const script = Pinyon_Script({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--gs-script",
  display: "swap",
});

export const serif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--gs-serif",
  display: "swap",
});
