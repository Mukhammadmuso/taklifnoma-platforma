import { Cormorant, Cormorant_SC, Spectral } from "next/font/google";

/**
 * Qamrov tekshirildi (canvas o'lchov testi, 2026-10):
 *  - Cormorant, Cormorant SC, Spectral: lotin + kirill, Ғ Қ Ҳ Ў to'liq → ikkala yozuvda bir xil
 * Cormorant — saroy kitoblaridek nafis sarlavhalar, Cormorant SC — yorliqlar,
 * Spectral — kichik o'lchamda ham o'qiladigan asosiy matn.
 */
export const display = Cormorant({
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--sh-display",
  display: "swap",
});

export const caps = Cormorant_SC({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--sh-caps",
  display: "swap",
});

export const text = Spectral({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--sh-text",
  display: "swap",
});
