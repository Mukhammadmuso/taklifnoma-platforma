/**
 * Fon musiqasi kutubxonasi.
 * Fayllar public/music/ papkasiga qo'yiladi (masalan public/music/navo.mp3).
 * Fayl hali qo'yilmagan bo'lsa, pleyer jimgina yashirinadi va konsolga ogohlantirish chiqadi.
 */
export type MusicTrack = { id: string; title: string; src: string; mood: string };

export const MUSIC_LIBRARY: MusicTrack[] = [
  { id: "navo", title: "Navo", src: "/music/navo.mp3", mood: "Mayin dutor, sokin" },
  { id: "bahor", title: "Bahor", src: "/music/bahor.mp3", mood: "Yengil fortepiano" },
  { id: "yor-yor", title: "Yor-yor (cholg'u)", src: "/music/yor-yor.mp3", mood: "An'anaviy, to'y" },
  { id: "kuy", title: "Kuy", src: "/music/kuy.mp3", mood: "Rubob, quvnoq" },
  { id: "shom", title: "Shom", src: "/music/shom.mp3", mood: "Skripka, romantik" },
  { id: "bayram", title: "Bayram", src: "/music/bayram.mp3", mood: "Quvnoq, bolalar bayrami uchun" },
  { id: "cholgikushi", title: "Cho‘lg‘ikushi", src: "/music/cholgikushi.m4a", mood: "Pianino, lirik (Sardor Tairov)" },
];

export function getTrack(id: string | null | undefined): MusicTrack | null {
  if (!id) return null;
  return MUSIC_LIBRARY.find((t) => t.id === id) ?? null;
}
