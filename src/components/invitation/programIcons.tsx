/**
 * Kun tartibi bandlari uchun belgilar — bir xil chiziq qalinligida qo'lda chizilgan (24×24).
 * Muharrirda tanlanadi, dizayn xohlasa ko'rsatadi (standartda yashirin).
 */
export const PROGRAM_ICONS = {
  osh: { label: "Osh", d: "M3.5 14h17M5 14c.4 3.6 3.3 6 7 6s6.6-2.4 7-6M7.5 14c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5M12 9V6.5M10 5.5c.7-.9 1.3-.9 2 0s1.3.9 2 0" },
  uzuk: { label: "Nikoh, uzuklar", d: "M3.5 14.5a5 5 0 1 0 10 0a5 5 0 1 0-10 0M10.5 14.5a5 5 0 1 0 10 0a5 5 0 1 0-10 0M7 7.5l1.5-3h3L13 7.5" },
  karnay: { label: "Karnay-surnay, kutib olish", d: "M3 13.5V10.5h6l10-5v13l-10-5H3M9 10.5v3M6 13.5l1 5h2l-.5-5" },
  choy: { label: "Dasturxon, choy", d: "M5 10h11v3a5.5 5.5 0 0 1-11 0zM16 11h1.5a2.2 2.2 0 0 1 0 4.4H15.5M8.5 7h4M10.5 7V5M3 21h15" },
  eshik: { label: "Mehmonlarni kutib olish", d: "M5 21V9a7 7 0 0 1 14 0v12M3 21h18M12 3v18M10 13v2M14 13v2" },
  musiqa: { label: "Musiqa, raqs", d: "M9 18V5.5l11-2.5v13M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0M20 16a3 3 0 1 1-6 0a3 3 0 1 1 6 0M9 9.5l11-2.5" },
  kamera: { label: "Suratga tushish", d: "M3 8h4l2-3h6l2 3h4v11H3zM8 13a4 4 0 1 0 8 0a4 4 0 1 0-8 0" },
  mashina: { label: "Kortej, mashina", d: "M3 16.5V12l2.2-5h13.6L21 12v4.5M3 16.5h18M3 12h18M5.5 19a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M15.5 19a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0" },
  tort: { label: "Tort, shirinliklar", d: "M4 20.5h16M5.5 20.5v-7h13v7M5.5 16.5c2.2 1.2 4.3-1.2 6.5 0s4.3 1.2 6.5 0M12 13.5V9M12 6.5c-.8-1 0-2 0-3 0 1 .8 2 0 3" },
  sovga: { label: "Sovg'alar, sarpo", d: "M4 10.5h16v10H4zM3 7.5h18v3H3zM12 7.5v13M12 7.5C10.5 4 7 4 7.5 6.5S12 7.5 12 7.5M12 7.5C13.5 4 17 4 16.5 6.5S12 7.5 12 7.5" },
  duo: { label: "Duo, fotiha", d: "M8 20.5v-5L4.5 11V4.5c1.2 0 2 .8 2 2v3M16 20.5v-5l3.5-4.5V4.5c-1.2 0-2 .8-2 2v3M8 15.5l1.5-6c.3-1.2 2-1.2 2.3 0L12 12M16 15.5l-1.5-6c-.3-1.2-2-1.2-2.3 0L12 12" },
  yulduz: { label: "Bayram", d: "M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8zM18.5 15.5l.8 2 2 .7-2 .8-.8 2-.7-2-2-.8 2-.7z" },
} as const;

export type ProgramIconId = keyof typeof PROGRAM_ICONS;

export function isProgramIcon(id: string | undefined): id is ProgramIconId {
  return !!id && id in PROGRAM_ICONS;
}

export function ProgramIcon({ id, className, size = 24 }: { id: string | undefined; className?: string; size?: number }) {
  if (!isProgramIcon(id)) return null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PROGRAM_ICONS[id].d} />
    </svg>
  );
}
