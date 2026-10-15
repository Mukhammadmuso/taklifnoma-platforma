/** Sana va vaqt — har doim Asia/Tashkent (UTC+5, yozgi vaqt yo'q) bo'yicha */

export const TZ = "Asia/Tashkent";
const OFFSET_MIN = 5 * 60;

export type TashkentParts = {
  year: number;
  month: number; // 1..12
  day: number;
  hour: number;
  minute: number;
  /** 0 = dushanba ... 6 = yakshanba */
  weekday: number;
};

/** UTC Date → Toshkent vaqti bo'laklari */
export function tashkentParts(date: Date): TashkentParts {
  const shifted = new Date(date.getTime() + OFFSET_MIN * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: (shifted.getUTCDay() + 6) % 7,
  };
}

/** Toshkent mahalliy vaqti ("2027-06-12T17:00") → UTC Date */
export function fromTashkentLocal(local: string): Date {
  const [d, t = "00:00"] = local.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, day, h, min) - OFFSET_MIN * 60_000);
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatTime(p: TashkentParts) {
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

/** Oy jadvali: haftalar ro'yxati, har hafta 7 katak (dushanbadan), bo'sh katak = null */
export function monthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Ikki sana bir xil Toshkent kunimi */
export function sameTashkentDay(a: Date, b: Date) {
  const pa = tashkentParts(a);
  const pb = tashkentParts(b);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

/** Google Calendar / ICS uchun UTC format: 20270612T120000Z */
export function icsStamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
