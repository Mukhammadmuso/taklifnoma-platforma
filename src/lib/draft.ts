/**
 * Muharrirdagi taklifnoma qoralamasi: brauzer va server uchun umumiy tur, tekshiruv va o'girish.
 */
import { z } from "zod";
import { EVENT_TYPES, type EventType } from "./dictionary";
import { fromTashkentLocal, pad2, tashkentParts } from "./datetime";
import { getTrack } from "./music";
import type { Script } from "./translit";
import { asGallery, type InvitationView, type ProgramItem } from "./view";

export type Draft = {
  templateId: string;
  eventType: EventType;
  scriptMode: Script;
  name1: string;
  name2: string;
  subtitle: string;
  hosts: string;
  parents1: string;
  parents2: string;
  quote: string;
  /** "2027-05-15" (Toshkent) */
  date: string;
  /** "17:00" */
  time: string;
  venueName: string;
  address: string;
  venueHall: string;
  landmark: string;
  googleMapsUrl: string;
  yandexMapsUrl: string;
  program: ProgramItem[];
  notes: string[];
  giftTitle: string;
  giftText: string;
  telegramUsername: string;
  phone: string;
  mainPhotoUrl: string;
  venuePhotoUrl: string;
  musicId: string;
  rsvpEnabled: boolean;
  gallery: string[];
  theme: string;
  bismillah: boolean;
};

export const LIMITS = {
  name: 60,
  subtitle: 1200,
  hosts: 160,
  venueName: 120,
  address: 300,
  url: 600,
  programItems: 20,
  programTitle: 80,
  programDesc: 200,
  notes: 10,
  note: 240,
  giftTitle: 40,
  giftText: 600,
} as const;

const str = (max: number) => z.string().max(max).default("");

/** Saqlashda tekshiruv: yumshoq (qoralama to'liq bo'lmasligi mumkin), lekin uzunlik va tur qat'iy */
export const draftSchema = z.object({
  templateId: z.string().regex(/^[a-z0-9-]{2,40}$/),
  eventType: z.enum(EVENT_TYPES),
  scriptMode: z.enum(["lat", "cyr"]),
  name1: str(LIMITS.name),
  name2: str(LIMITS.name),
  subtitle: str(LIMITS.subtitle),
  hosts: str(LIMITS.hosts),
  parents1: str(LIMITS.hosts),
  parents2: str(LIMITS.hosts),
  quote: str(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  venueName: str(LIMITS.venueName),
  address: str(LIMITS.address),
  venueHall: str(80),
  landmark: str(200),
  googleMapsUrl: str(LIMITS.url),
  yandexMapsUrl: str(LIMITS.url),
  program: z
    .array(
      z.object({
        time: z.string().max(10),
        title: z.string().max(LIMITS.programTitle),
        description: z.string().max(LIMITS.programDesc).optional(),
        icon: z.string().regex(/^[a-z-]{0,20}$/).optional(),
      }),
    )
    .max(LIMITS.programItems),
  notes: z.array(z.string().max(LIMITS.note)).max(LIMITS.notes),
  giftTitle: str(LIMITS.giftTitle),
  giftText: str(LIMITS.giftText),
  telegramUsername: str(40),
  phone: str(30),
  mainPhotoUrl: str(300),
  venuePhotoUrl: str(300),
  musicId: str(40),
  rsvpEnabled: z.boolean(),
  gallery: z.array(z.string().max(300)).max(12).default([]),
  theme: z.string().max(20).default(""),
  bismillah: z.boolean().default(true),
});

/* ------------------------------------------------------------------ */
/* Havola (slug)                                                        */
/* ------------------------------------------------------------------ */

export const RESERVED_SLUGS = new Set([
  "admin", "api", "login", "kirish", "chiqish", "logout", "register", "kabinet", "i", "namuna", "namunalar",
  "oldindan-korish", "preview", "static", "public", "uploads", "files", "auth", "javob", "javoblar",
  "narx", "narxlar", "yordam", "help", "about", "haqida", "terms", "privacy", "shartlar", "maxfiylik",
  "dizayn", "dizaynlar", "yangi", "new", "settings", "sozlamalar", "taklifnoma", "taklifnomalar", "www",
  "mail", "support", "test", "demo", "null", "undefined",
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 48;

/** Havolani tekshiradi; muammo bo'lsa o'zbekcha sabab qaytaradi */
export function slugProblem(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `Havola kamida ${SLUG_MIN} belgidan iborat bo'lsin.`;
  if (slug.length > SLUG_MAX) return `Havola ${SLUG_MAX} belgidan oshmasin.`;
  if (!/^[a-z0-9-]+$/.test(slug)) return "Faqat kichik lotin harflari, raqamlar va tire (-) ishlatiladi.";
  if (slug.startsWith("-") || slug.endsWith("-")) return "Havola tire bilan boshlanmasin va tugamasin.";
  if (slug.includes("--")) return "Ketma-ket ikki tire ishlatilmasin.";
  if (RESERVED_SLUGS.has(slug) || slug.startsWith("q-")) return "Bu so'z band — boshqasini tanlang.";
  return null;
}

/** Ismlardan havola taklifi: "Bekzod", "Sevinch" → "bekzod-sevinch" */
export function slugify(...parts: string[]): string {
  const map: Record<string, string> = { "ʻ": "", "‘": "", "’": "", "'": "", "`": "", "ʼ": "" };
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[ʻ‘’'`ʼ]/g, (c) => map[c] ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX);
}

/** Qoralama uchun vaqtinchalik havola (foydalanuvchi o'zinikini tanlamaguncha) */
export function isTempSlug(slug: string) {
  return slug.startsWith("q-");
}

/* ------------------------------------------------------------------ */
/* Bazadagi yozuv ↔ qoralama ↔ ko'rinish                                */
/* ------------------------------------------------------------------ */

type Row = {
  templateId: string;
  eventType: string;
  scriptMode: string;
  name1: string;
  name2: string | null;
  subtitle: string | null;
  hosts: string | null;
  eventDateTime: Date;
  venueName: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  yandexMapsUrl: string | null;
  program: unknown;
  notes: unknown;
  giftTitle: string | null;
  giftText: string | null;
  telegramUsername: string | null;
  phone: string | null;
  mainPhotoUrl: string | null;
  venuePhotoUrl: string | null;
  musicId: string | null;
  rsvpEnabled: boolean;
  gallery?: unknown;
  theme?: string | null;
  bismillah?: boolean;
  parents1?: string | null;
  parents2?: string | null;
  quote?: string | null;
  venueHall?: string | null;
  landmark?: string | null;
};

export function rowToDraft(row: Row): Draft {
  const p = tashkentParts(row.eventDateTime);
  return {
    templateId: row.templateId,
    eventType: (EVENT_TYPES as readonly string[]).includes(row.eventType) ? (row.eventType as EventType) : "nikoh",
    scriptMode: row.scriptMode === "cyr" ? "cyr" : "lat",
    name1: row.name1 ?? "",
    name2: row.name2 ?? "",
    subtitle: row.subtitle ?? "",
    hosts: row.hosts ?? "",
    parents1: row.parents1 ?? "",
    parents2: row.parents2 ?? "",
    quote: row.quote ?? "",
    date: `${p.year}-${pad2(p.month)}-${pad2(p.day)}`,
    time: `${pad2(p.hour)}:${pad2(p.minute)}`,
    venueName: row.venueName ?? "",
    address: row.address ?? "",
    venueHall: row.venueHall ?? "",
    landmark: row.landmark ?? "",
    googleMapsUrl: row.googleMapsUrl ?? "",
    yandexMapsUrl: row.yandexMapsUrl ?? "",
    program: Array.isArray(row.program) ? (row.program as ProgramItem[]) : [],
    notes: Array.isArray(row.notes) ? (row.notes as string[]) : [],
    giftTitle: row.giftTitle ?? "",
    giftText: row.giftText ?? "",
    telegramUsername: row.telegramUsername ?? "",
    phone: row.phone ?? "",
    mainPhotoUrl: row.mainPhotoUrl ?? "",
    venuePhotoUrl: row.venuePhotoUrl ?? "",
    musicId: row.musicId ?? "",
    rsvpEnabled: row.rsvpEnabled,
    gallery: asGallery(row.gallery),
    theme: row.theme ?? "",
    bismillah: row.bismillah ?? true,
  };
}

const orNull = (s: string) => (s.trim() ? s.trim() : null);

/** Qoralama → bazaga yoziladigan maydonlar */
export function draftToRow(d: Draft) {
  return {
    templateId: d.templateId,
    eventType: d.eventType,
    scriptMode: d.scriptMode,
    name1: d.name1.trim(),
    name2: orNull(d.name2),
    subtitle: orNull(d.subtitle),
    hosts: orNull(d.hosts),
    parents1: orNull(d.parents1),
    parents2: orNull(d.parents2),
    quote: orNull(d.quote),
    eventDateTime: fromTashkentLocal(`${d.date}T${d.time}`),
    venueName: orNull(d.venueName),
    address: orNull(d.address),
    venueHall: orNull(d.venueHall),
    landmark: orNull(d.landmark),
    googleMapsUrl: orNull(d.googleMapsUrl),
    yandexMapsUrl: orNull(d.yandexMapsUrl),
    program: d.program
      .filter((p) => p.title.trim())
      .map((p) => ({ time: p.time.trim(), title: p.title.trim(), description: p.description?.trim() || undefined, icon: p.icon || undefined })),
    notes: d.notes.map((n) => n.trim()).filter(Boolean),
    giftTitle: orNull(d.giftTitle),
    giftText: orNull(d.giftText),
    telegramUsername: orNull(d.telegramUsername.replace(/^@/, "")),
    phone: orNull(d.phone),
    mainPhotoUrl: orNull(d.mainPhotoUrl),
    venuePhotoUrl: orNull(d.venuePhotoUrl),
    musicId: orNull(d.musicId),
    rsvpEnabled: d.rsvpEnabled,
    gallery: asGallery(d.gallery),
    theme: orNull(d.theme),
    bismillah: d.bismillah,
  };
}

/** Jonli ko'rinish uchun: qoralama → InvitationView (namuna rejimida, javoblar yuborilmaydi) */
export function draftToView(d: Draft, slug: string, placeholderNames: { name1: string; name2?: string }): InvitationView {
  const row = draftToRow(d);
  return {
    slug,
    templateId: d.templateId,
    eventType: d.eventType,
    scriptMode: d.scriptMode,
    isPaid: true,
    isSample: true,
    name1: row.name1 || placeholderNames.name1,
    name2: row.name2 ?? (d.eventType === "nikoh" || d.eventType === "fotiha" ? placeholderNames.name2 ?? null : null),
    subtitle: row.subtitle,
    hosts: row.hosts,
    parents1: row.parents1,
    parents2: row.parents2,
    quote: row.quote,
    eventISO: (/^\d{4}-\d{2}-\d{2}$/.test(d.date) && /^\d{2}:\d{2}$/.test(d.time)
      ? row.eventDateTime
      : new Date()
    ).toISOString(),
    venueName: row.venueName,
    address: row.address,
    venueHall: row.venueHall,
    landmark: row.landmark,
    googleMapsUrl: row.googleMapsUrl,
    yandexMapsUrl: row.yandexMapsUrl,
    program: row.program,
    notes: row.notes,
    giftTitle: row.giftTitle,
    giftText: row.giftText,
    telegramUsername: row.telegramUsername,
    phone: row.phone,
    mainPhotoUrl: row.mainPhotoUrl,
    venuePhotoUrl: row.venuePhotoUrl,
    music: getTrack(row.musicId),
    rsvpEnabled: row.rsvpEnabled,
    gallery: row.gallery,
    theme: row.theme,
    bismillah: row.bismillah,
    guest: null,
  };
}

/* ------------------------------------------------------------------ */
/* E'lon qilishdan oldingi tekshiruv                                     */
/* ------------------------------------------------------------------ */

export type Issue = { step: number; message: string };

const URL_RE = /^https:\/\/[^\s]+$/i;

export function findIssues(d: Draft, slug: string): Issue[] {
  const issues: Issue[] = [];
  if (!d.name1.trim()) issues.push({ step: 2, message: "Ism kiritilmagan." });
  if ((d.eventType === "nikoh" || d.eventType === "fotiha") && !d.name2.trim())
    issues.push({ step: 2, message: "Ikkinchi ism kiritilmagan." });
  const when = fromTashkentLocal(`${d.date}T${d.time}`);
  if (Number.isNaN(when.getTime())) issues.push({ step: 2, message: "Sana yoki vaqt noto'g'ri." });
  else if (when.getTime() < Date.now() - 24 * 3600_000) issues.push({ step: 2, message: "Tadbir sanasi o'tib ketgan." });
  if (!d.venueName.trim() && !d.address.trim()) issues.push({ step: 4, message: "Manzil kiritilmagan." });
  for (const [label, url] of [
    ["Google Maps", d.googleMapsUrl],
    ["Yandex", d.yandexMapsUrl],
  ] as const) {
    if (url.trim() && !URL_RE.test(url.trim())) issues.push({ step: 4, message: `${label} havolasi https:// bilan boshlanishi kerak.` });
  }
  if (d.telegramUsername.trim() && !/^@?[A-Za-z0-9_]{5,32}$/.test(d.telegramUsername.trim()))
    issues.push({ step: 6, message: "Telegram username noto'g'ri (5–32 lotin harf, raqam yoki _)." });
  if (d.phone.trim() && !/^\+?[\d\s()-]{7,20}$/.test(d.phone.trim()))
    issues.push({ step: 6, message: "Telefon raqami noto'g'ri." });
  if (isTempSlug(slug)) issues.push({ step: 7, message: "Taklifnoma havolasi tanlanmagan." });
  return issues;
}

/** Matnda karta raqami bormi (ochiq sahifada ko'rinishi haqida ogohlantirish uchun) */
export function hasCardNumber(text: string) {
  return /(?:\d[ -]?){15,18}\d/.test(text);
}

export function defaultDate(): { date: string; time: string } {
  const p = tashkentParts(new Date(Date.now() + 60 * 24 * 3600_000));
  return { date: `${p.year}-${pad2(p.month)}-${pad2(p.day)}`, time: "17:00" };
}
