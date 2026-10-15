import { Lora, Ysabeau_SC } from "next/font/google";

/**
 * Qamrov tekshirildi (canvas o'lchov testi, 2026-10):
 *  - Lora, Ysabeau SC: lotin + kirill, Ғ Қ Ҳ Ў to'liq → ikkala yozuvda bir xil
 * Lora — iliq, yirik o'qiladigan kitob shrifti (keksa mehmonlar uchun ham qulay),
 * Ysabeau SC — yorliqlar uchun yumshoq bosh harflar.
 */
export const serif = Lora({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--ch-serif",
  display: "swap",
});

export const caps = Ysabeau_SC({
  weight: ["600", "700"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--ch-caps",
  display: "swap",
});
