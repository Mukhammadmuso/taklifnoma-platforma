import { Inter } from "next/font/google";

/**
 * Platforma shrifti: Inter (o'zgaruvchan vazn). Yirik sarlavhalar 460 vaznda — yengil, ishonchli ovoz.
 * Qamrov tekshirildi: lotin + kirill, Ғ Қ Ҳ Ў to'liq.
 */
export const sans = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--p-font-sans",
  display: "swap",
});
