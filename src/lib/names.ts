import type { EventType } from "./dictionary";

/** Tadbir turiga qarab ism maydonlari yorlig'i (ikkinchisi bo'lmasa — bitta ism) */
export const NAME_LABELS: Record<EventType, [string, string | null]> = {
  nikoh: ["Kuyovning ismi", "Kelinning ismi"],
  fotiha: ["Kuyovning ismi", "Kelinning ismi"],
  sunnat: ["O‘g‘lingizning ismi", null],
  yubiley: ["Yubilyarning ismi", "Ikkinchi ism (masalan, turmush o‘rtog‘i)"],
  tugilgan_kun: ["Kimning tug‘ilgan kuni", null],
  boshqa: ["Tadbir nomi yoki tashkilotchi", "Ikkinchi nom"],
};
