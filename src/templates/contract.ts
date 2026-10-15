/**
 * DIZAYN SHARTNOMASI (template contract)
 *
 * Har bir dizayn src/templates/<id>/ papkasidagi mustaqil modul:
 *   meta.ts    — server uchun xavfsiz metama'lumot (TemplateMeta): nom, ranglar, bo'limlar tartibi, standart matnlar
 *   index.tsx  — "use client" kirish nuqtasi: shriftlar, Opening, Decor va InvitationRenderer'ni ulaydi
 *
 * Public renderer FAQAT shu turlarga tayanadi. Dizayn kodi ichida taklifnoma
 * ma'lumoti yozilmaydi — hamma matn va qiymat InvitationView orqali keladi.
 */
import type { ComponentType, ReactNode } from "react";
import type { CommonTexts, Dictionary, EventTexts, EventType } from "@/lib/dictionary";
import type { Script } from "@/lib/translit";
import type { InvitationView } from "@/lib/view";

export type Palette = {
  /** Sahifa foni (varaq/qog'oz) */
  bg: string;
  /** Kartalar, formalar foni */
  surface: string;
  /** Asosiy matn */
  text: string;
  /** Asosiy urg'u rangi */
  accent: string;
  /** Ikkinchi urg'u (bezaklar, chiziqlar) */
  accent2: string;
  /** Ikkinchi darajali matn (fonda ≥4.5:1 kontrast) */
  muted?: string;
  /** Varaqdan tashqaridagi muhit (keng ekranda) */
  ground?: string;
};

export type TemplateFonts = {
  /** Sarlavha/ismlar uchun Google Font nomi (kirill + lotin tekshirilgan) */
  heading: string;
  /** Asosiy matn shrifti */
  body: string;
  /** Qo'shimcha (bosh harfli yorliqlar va h.k.) */
  label?: string;
};

export const SECTION_IDS = [
  "hero",
  "invite",
  "date",
  "program",
  "notes",
  "venue",
  "gift",
  "rsvp",
  "gallery",
  "closing",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Server tomonda ham ishlatiladigan, komponentsiz metama'lumot */
export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  supportedEventTypes: EventType[];
  /** public/ ichidagi preview rasm yo'li */
  previewImage: string;
  palette: Palette;
  fonts: TemplateFonts;
  sectionOrder: SectionId[];
  /** Tadbir turiga qarab dizaynga xos matnlar (lug'atni ustidan yozadi) */
  defaultTexts?: Partial<Record<EventType, Partial<EventTexts>>>;
  /** Telegram/brauzer theme-color */
  themeColor: string;
  /** Ixtiyoriy: umumiy matnlarni almashtirish (hamma tadbirga yoki tadbir turiga qarab) */
  commonTexts?: { all?: Partial<CommonTexts> } & Partial<Record<EventType, Partial<CommonTexts>>>;
  /** Ixtiyoriy: rang mavzulari — muharrirda tanlanadi, ildizda data-theme bo'lib keladi (birinchisi — standart) */
  themes?: { id: string; name: string; swatch: [string, string] }[];
  /** Kirish ekrani «Bismillahir rohmanir rohiym»ni ko'rsatadi (muharrirda yoqish/o'chirish chiqadi) */
  bismillah?: boolean;
};

/** Ochilish ekrani props */
export type OpeningProps = {
  view: TextView;
  t: Dictionary;
  reducedMotion: boolean;
  /** Foydalanuvchi bosgan zahoti chaqiriladi (musiqa shu yerda boshlanadi) */
  onOpen: () => void;
  /** Ochilish animatsiyasi tugaganda chaqiriladi (ekran yopiladi) */
  onDone: () => void;
};

/** Dizaynning SVG bezaklari */
export type DecorSet = {
  /** Varaq burchagi bezagi (yuqori-chap holatda chiziladi, qolganlari aks ettiriladi) */
  Corner: ComponentType<{ className?: string }>;
  /** Bo'limlar orasidagi ajratgich */
  Divider: ComponentType<{ className?: string }>;
  /** Asosiy emblema (monogramma) */
  Emblem: ComponentType<{ initials: [string, string?]; className?: string }>;
  /** Ro'yxat belgisi (Bilib qo'ying) */
  Bullet?: ComponentType<{ className?: string }>;
  /** Taqvimda tadbir kunini belgilovchi chizma */
  DayMark?: ComponentType<{ className?: string }>;
  /** Manzil rasmi bo'lmasa — chizma */
  VenueArt?: ComponentType<{ className?: string }>;
  /** Javob yuborilganda bosiladigan muhr */
  Stamp?: ComponentType<{ initials: [string, string?]; className?: string }>;
  /** Bir marta chiziladigan umumiy <defs> (gradient, pattern, filter) */
  Defs?: ComponentType;
};

/** Yozuvga (lat/cyr) o'girilgan, ko'rsatishga tayyor ma'lumot */
export type TextView = InvitationView & { script: Script };

export type SectionProps = {
  view: TextView;
  t: Dictionary;
  decor: DecorSet;
  reducedMotion: boolean;
};

export type TemplateDefinition = TemplateMeta & {
  Opening: ComponentType<OpeningProps>;
  decor: DecorSet;
  /** next/font o'zgaruvchi klasslari + dizaynning ildiz klassi */
  rootClassName: string;
  /** Ixtiyoriy: istalgan bo'limni o'z komponenti bilan almashtirish */
  sections?: Partial<Record<SectionId, ComponentType<SectionProps>>>;
  /** Ixtiyoriy: varaq ortidagi muhit (fon) */
  Backdrop?: ComponentType<{ children: ReactNode }>;
};
