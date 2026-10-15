/**
 * Mehmonlar ro'yxati: joylangan matnni ismlarga ajratish va shaxsiy xabar tuzish.
 * Server va brauzerda bir xil ishlaydi (kabinetda oldindan ko'rish uchun).
 */
import { cleanText } from "./sanitize";
import { EVENT_LABELS, type EventType } from "./dictionary";

export const GUEST_NAME_MAX = 80;
export const GUEST_LIMIT = 1000;
export const MESSAGE_MAX = 1000;

/** Satr boshidagi raqam va belgilarni olib tashlash: "1. ", "2)", "- ", "• ", "* " */
const LEAD = /^\s*(?:\d{1,4}\s*[.)\-:]\s*|[-–—•*·]\s*)/;
/** Satr oxiridagi telefon raqamlari: "+998 90 123-45-67", "901234567" */
const PHONE = /[\s,;:-]*\+?\d[\d\s()-]{7,}\d\s*$/;

export function normalizeName(name: string) {
  return name.toLocaleLowerCase("uz").replace(/[‘’ʻʼ`']/g, "'").replace(/\s+/g, " ").trim();
}

export type ParsedGuests = {
  names: string[];
  /** Bir xil ism ikki marta yozilgan (yoki ro'yxatda allaqachon bor) */
  duplicates: string[];
};

/** Har qatorda bitta mehmon. Bo'sh qatorlar, raqamlash va telefon raqamlari olib tashlanadi */
export function parseGuestList(text: string, existing: string[] = []): ParsedGuests {
  const seen = new Set(existing.map(normalizeName));
  const names: string[] = [];
  const duplicates: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const name = cleanText(raw.replace(LEAD, "").replace(PHONE, ""), GUEST_NAME_MAX);
    if (!name) continue;
    const key = normalizeName(name);
    if (seen.has(key)) {
      duplicates.push(name);
      continue;
    }
    seen.add(key);
    names.push(name);
  }
  return { names, duplicates };
}

/** Taklifnomaga mos boshlang'ich xabar */
export function defaultGuestMessage(eventType: EventType, name1: string, name2: string | null) {
  const names = [name1, name2].filter(Boolean).join(" va ");
  const event = EVENT_LABELS[eventType].toLocaleLowerCase("uz");
  const who = names ? `${names}ning ` : "";
  return `Assalomu alaykum, {ism}!\n\nSizni ${who}${event}ga lutfan taklif etamiz.\n\nTaklifnoma: {havola}`;
}

/** {ism} va {havola} o'rniga mehmon ismi va shaxsiy havolasi qo'yiladi */
export function renderGuestMessage(template: string, guest: { name: string; link: string }) {
  const body = template.replace(/\{ism\}/gi, guest.name).replace(/\{havola\}/gi, guest.link);
  // Shablonda {havola} bo'lmasa ham, havola albatta xabarga qo'shiladi
  return /\{havola\}/i.test(template) ? body : `${body.trim()}\n\n${guest.link}`;
}

export type GuestStatus = "new" | "opened" | "yes" | "no";

export function guestStatus(g: { openedAt: Date | string | null; rsvp: { attending: boolean } | null }): GuestStatus {
  if (g.rsvp) return g.rsvp.attending ? "yes" : "no";
  return g.openedAt ? "opened" : "new";
}

export const STATUS_LABELS: Record<GuestStatus, string> = {
  new: "Ochmagan",
  opened: "Ochgan, javob yo‘q",
  yes: "Keladi",
  no: "Kelmaydi",
};
