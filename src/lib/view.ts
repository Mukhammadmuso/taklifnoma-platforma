/**
 * InvitationView — public sahifaga uzatiladigan ma'lumot.
 * Bazadagi yozuvdan faqat ko'rsatish uchun keraklilari olinadi
 * (ownerId, mehmonlar ro'yxati, boshqa javoblar HECH QACHON kirmaydi).
 */
import type { EventType } from "./dictionary";
import { getTrack, type MusicTrack } from "./music";
import type { Script } from "./translit";

export type ProgramItem = { time: string; title: string; description?: string; icon?: string };

export type InvitationView = {
  slug: string;
  templateId: string;
  eventType: EventType;
  scriptMode: Script;
  isPaid: boolean;
  /** Namuna sahifa: javoblar bazaga yozilmaydi */
  isSample: boolean;
  name1: string;
  name2: string | null;
  subtitle: string | null;
  hosts: string | null;
  parents1: string | null;
  parents2: string | null;
  quote: string | null;
  /** ISO, UTC */
  eventISO: string;
  venueName: string | null;
  address: string | null;
  venueHall: string | null;
  landmark: string | null;
  googleMapsUrl: string | null;
  yandexMapsUrl: string | null;
  program: ProgramItem[];
  notes: string[];
  giftTitle: string | null;
  giftText: string | null;
  telegramUsername: string | null;
  phone: string | null;
  mainPhotoUrl: string | null;
  venuePhotoUrl: string | null;
  music: MusicTrack | null;
  rsvpEnabled: boolean;
  /** Galereya rasmlari (faqat o'zimizga yuklangan fayllar) */
  gallery: string[];
  /** Dizaynning rang mavzusi */
  theme: string | null;
  /** Kirish ekranida «Bismillahir rohmanir rohiym» */
  bismillah: boolean;
  /** Shaxsiy havola orqali kirgan mehmon */
  guest: { token: string; name: string } | null;
};

type InvitationRow = {
  slug: string;
  templateId: string;
  eventType: string;
  scriptMode: string;
  isPaid: boolean;
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

function asProgram(value: unknown): ProgramItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((p): p is ProgramItem => !!p && typeof p === "object" && typeof (p as ProgramItem).title === "string")
    .map((p) => ({ time: String(p.time ?? ""), title: p.title, description: p.description || undefined, icon: typeof p.icon === "string" && /^[a-z-]{2,20}$/.test(p.icon) ? p.icon : undefined }));
}

function asNotes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((n): n is string => typeof n === "string" && n.trim().length > 0);
}

/** Galereya: faqat o'z serverimizdagi fayllar, 12 tagacha */
export function asGallery(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((u): u is string => typeof u === "string" && /^\/api\/files\/[A-Za-z0-9_./-]+$/.test(u) && !u.includes("..")).slice(0, GALLERY_MAX);
}

export const GALLERY_MAX = 12;

const blank = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);

export function toView(row: InvitationRow, guest: { token: string; name: string } | null, isSample = false): InvitationView {
  return {
    slug: row.slug,
    templateId: row.templateId,
    eventType: row.eventType as EventType,
    scriptMode: row.scriptMode === "cyr" ? "cyr" : "lat",
    isPaid: row.isPaid,
    isSample,
    name1: row.name1,
    name2: blank(row.name2),
    subtitle: blank(row.subtitle),
    hosts: blank(row.hosts),
    parents1: blank(row.parents1),
    parents2: blank(row.parents2),
    quote: blank(row.quote),
    eventISO: row.eventDateTime.toISOString(),
    venueName: blank(row.venueName),
    address: blank(row.address),
    venueHall: blank(row.venueHall),
    landmark: blank(row.landmark),
    googleMapsUrl: blank(row.googleMapsUrl),
    yandexMapsUrl: blank(row.yandexMapsUrl),
    program: asProgram(row.program),
    notes: asNotes(row.notes),
    giftTitle: blank(row.giftTitle),
    giftText: blank(row.giftText),
    telegramUsername: blank(row.telegramUsername)?.replace(/^@/, "") ?? null,
    phone: blank(row.phone),
    mainPhotoUrl: blank(row.mainPhotoUrl),
    venuePhotoUrl: blank(row.venuePhotoUrl),
    music: getTrack(row.musicId),
    rsvpEnabled: row.rsvpEnabled,
    gallery: asGallery(row.gallery),
    theme: blank(row.theme ?? null),
    bismillah: row.bismillah ?? true,
    guest,
  };
}

/** Ismlardan monogramma harflari */
export function initialsOf(name1: string, name2: string | null): [string, string?] {
  const first = (s: string) => Array.from(s.trim())[0]?.toUpperCase() ?? "";
  return name2 ? [first(name1), first(name2)] : [first(name1)];
}
