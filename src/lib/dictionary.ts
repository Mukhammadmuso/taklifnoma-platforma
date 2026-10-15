/**
 * Tadbir turiga qarab matn lug'ati.
 * Asl matnlar lotinda yoziladi; kirill varianti translit orqali avtomatik hosil
 * bo'ladi va kerak bo'lsa CYR_OVERRIDES da qo'lda tuzatiladi.
 */
import { latToCyr, typoLat, type Script } from "./translit";

export const EVENT_TYPES = ["nikoh", "fotiha", "sunnat", "yubiley", "tugilgan_kun", "boshqa"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type EventTexts = {
  /** Tadbir nomi: "Nikoh to'yi" */
  eventTitle: string;
  /** Sana bo'limi sarlavhasi: "To'y kuni" */
  dayTitle: string;
  /** Dastur sarlavhasi: "Kun tartibi" */
  programTitle: string;
  /** Teskari sanoq sarlavhasi: "To'yga qadar" */
  countdownTitle: string;
  /** Tadbir kuni keldi: "To'y kuni keldi!" */
  todayText: string;
  /** Tadbir o'tib ketgan */
  passedText: string;
  /** Sovg'a bo'limi: "To'yona" yoki "Tabrik uchun" */
  giftTitle: string;
  /** Standart sovg'a matni */
  giftText: string;
  /** Standart taklif matni ({names} o'rniga ismlar qo'yiladi) */
  inviteText: string;
  /** Yakuniy ibora */
  closingText: string;
  /** Telegram'ga oldindan to'ldirilgan javob */
  telegramReply: string;
};

const EVENTS: Record<EventType, EventTexts> = {
  nikoh: {
    eventTitle: "Nikoh to'yi",
    dayTitle: "To'y kuni",
    programTitle: "Kun tartibi",
    countdownTitle: "To'yga qadar",
    todayText: "To'y kuni keldi!",
    passedText: "To'yimiz o'tdi — tashrifingiz uchun rahmat!",
    giftTitle: "To'yona",
    giftText: "Sizning tashrifingiz biz uchun eng katta sovg'a.",
    inviteText:
      "Sizni farzandlarimiz {names}ning nikoh to'yi marosimiga lutfan taklif etamiz. Quvonchli kunimizni siz bilan birga nishonlashdan mamnun bo'lamiz.",
    closingText: "Sizni intizorlik bilan kutamiz!",
    telegramReply: "Assalomu alaykum! {names}ning to'yiga taklifnomani oldim.",
  },
  fotiha: {
    eventTitle: "Fotiha to'yi",
    dayTitle: "Fotiha kuni",
    programTitle: "Kun tartibi",
    countdownTitle: "Fotiha to'yiga qadar",
    todayText: "Fotiha kuni keldi!",
    passedText: "Fotiha to'yi o'tdi — tashrifingiz uchun rahmat!",
    giftTitle: "To'yona",
    giftText: "Sizning tashrifingiz biz uchun eng katta sovg'a.",
    inviteText:
      "Sizni farzandlarimiz {names}ning fotiha to'yiga lutfan taklif etamiz. Duoyingiz va ishtirokingiz biz uchun aziz.",
    closingText: "Sizni intizorlik bilan kutamiz!",
    telegramReply: "Assalomu alaykum! {names}ning fotiha to'yiga taklifnomani oldim.",
  },
  sunnat: {
    eventTitle: "Sunnat to'yi",
    dayTitle: "To'y kuni",
    programTitle: "To'y dasturi",
    countdownTitle: "To'yga qadar",
    todayText: "To'y kuni keldi!",
    passedText: "To'yimiz o'tdi — tashrifingiz uchun rahmat!",
    giftTitle: "To'yona",
    giftText: "Sizning tashrifingiz biz uchun eng katta sovg'a.",
    inviteText:
      "Sizni o'g'limiz {names}ning sunnat to'yiga lutfan taklif etamiz. Xursandchiligimizga sherik bo'lishingizdan mamnun bo'lamiz.",
    closingText: "Sizni intizorlik bilan kutamiz!",
    telegramReply: "Assalomu alaykum! {names}ning sunnat to'yiga taklifnomani oldim.",
  },
  yubiley: {
    eventTitle: "Yubiley",
    dayTitle: "Bayram kuni",
    programTitle: "Bayram dasturi",
    countdownTitle: "Bayramgacha",
    todayText: "Bugun bayram!",
    passedText: "Bayram o'tdi — tashrifingiz uchun rahmat!",
    giftTitle: "Tabrik uchun",
    giftText: "Eng qimmatli tabrik — sizning tashrifingiz va samimiy tilaklaringiz.",
    inviteText:
      "Sizni {names}ning yubiley bayramiga lutfan taklif etamiz. Qutlug' sanani siz bilan birga nishonlashni istaymiz.",
    closingText: "Sizni intizorlik bilan kutamiz!",
    telegramReply: "Assalomu alaykum! {names}ning yubileyiga taklifnomani oldim.",
  },
  tugilgan_kun: {
    eventTitle: "Tug'ilgan kun",
    dayTitle: "Bayram kuni",
    programTitle: "Bayram dasturi",
    countdownTitle: "Bayramgacha",
    todayText: "Bugun bayram!",
    passedText: "Bayram o'tdi — tashrifingiz uchun rahmat!",
    giftTitle: "Tabrik uchun",
    giftText: "Eng qimmatli sovg'a — sizning tashrifingiz.",
    inviteText:
      "Sizni {names}ning tug'ilgan kun bayramiga taklif etamiz. Kelib, quvonchimizga sherik bo'ling!",
    closingText: "Sizni kutamiz!",
    telegramReply: "Assalomu alaykum! {names}ning tug'ilgan kuniga taklifnomani oldim.",
  },
  boshqa: {
    eventTitle: "Taklifnoma",
    dayTitle: "Tadbir kuni",
    programTitle: "Tadbir dasturi",
    countdownTitle: "Tadbirgacha",
    todayText: "Tadbir kuni keldi!",
    passedText: "Tadbir o'tdi — tashrifingiz uchun rahmat!",
    giftTitle: "Tabrik uchun",
    giftText: "Sizning tashrifingiz biz uchun eng katta sovg'a.",
    inviteText: "Sizni {names} tomonidan tashkil etilayotgan tadbirga lutfan taklif etamiz.",
    closingText: "Sizni kutamiz!",
    telegramReply: "Assalomu alaykum! Taklifnomani oldim.",
  },
};

/** Barcha tadbirlar uchun umumiy matnlar */
const COMMON = {
  notesTitle: "Bilib qo'ying",
  venueTitle: "Manzil",
  rsvpTitle: "Javob xati",
  rsvpLead: "Iltimos, kelish-kelmasligingizni bildiring",
  name: "Ismingiz",
  namePlaceholder: "Ism va familiyangiz",
  attending: "Kelasizmi?",
  yes: "Albatta kelaman",
  no: "Afsuski, kela olmayman",
  count: "Necha kishi?",
  wish: "Tilaklaringiz",
  wishPlaceholder: "Samimiy tilaklaringizni yozing",
  submit: "Javobni yuborish",
  sending: "Yuborilmoqda…",
  thanksTitle: "Rahmat!",
  thanksText: "Javobingiz qabul qilindi.",
  thanksNo: "Javobingiz uchun rahmat. Sizni sog'inib qolamiz!",
  telegramReplyBtn: "Telegram orqali javob berish",
  callBtn: "Qo'ng'iroq qilish",
  addToCalendar: "Taqvimga qo'shish",
  googleCalendar: "Google Taqvim",
  appleCalendar: "iPhone / boshqa taqvim (.ics)",
  scrollDown: "Pastga suring",
  open: "Ochish uchun muhrni bosing",
  dearGuest: "Hurmatli mehmonimiz",
  dear: "Hurmatli",
  at: "soat",
  atSuffix: "da",
  days: "kun",
  hours: "soat",
  minutes: "daqiqa",
  seconds: "soniya",
  copyAddress: "Manzilni nusxalash",
  copyNumber: "Raqamni nusxalash",
  copied: "Nusxalandi",
  copyFailed: "Nusxalab bo'lmadi — qo'lda belgilang",
  googleMaps: "Google Maps",
  yandexMaps: "Yandex Xaritalar",
  musicOn: "Musiqani yoqish",
  musicOff: "Musiqani o'chirish",
  sample: "Namuna",
  respectfully: "Hurmat bilan",
  errorRequired: "Iltimos, ismingizni yozing",
  errorChoice: "Iltimos, kelasizmi yoki yo'qmi — tanlang",
  errorNetwork: "Internet bilan aloqa yo'q. Ulanishni tekshirib, qayta urinib ko'ring.",
  errorServer: "Javob yuborilmadi. Birozdan so'ng qayta urinib ko'ring.",
  errorRate: "Juda ko'p urinish. Bir daqiqadan so'ng qayta yuboring.",
  people: "kishi",
  weekdaysShort: "Du,Se,Ch,Pa,Ju,Sh,Ya",
  galleryTitle: "Baxtli lahzalar",
  photo: "Rasm",
  close: "Yopish",
  prev: "Oldingi",
  next: "Keyingi",
  directions: "Yo'lni ko'rsatish",
  mapLabel: "Xaritada manzil",
  shareTelegram: "Telegram orqali ulashish",
  copyLink: "Havolani nusxalash",
  bismillah: "Bismillahir rohmanir rohiym",
  openInvitation: "Taklifnomani ochish",
  waitingYou: "Sizni kutamiz!",
  parents1Label: "Kuyovning ota-onasi",
  parents2Label: "Kelinning ota-onasi",
} as const;

export type CommonTexts = { [K in keyof typeof COMMON]: string };

export const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];
/** Dushanbadan boshlab */
export const WEEKDAYS = ["dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba", "yakshanba"];

/** Translit to'g'ri chiqmaydigan holatlar uchun qo'lda tuzatishlar */
const CYR_OVERRIDES: Record<string, string> = {
  "Google Maps": "Google Maps",
  "Yandex Xaritalar": "Яндекс Хариталар",
  "Google Taqvim": "Google Тақвим",
  "iPhone / boshqa taqvim (.ics)": "iPhone / бошқа тақвим (.ics)",
};

function convert(value: string, script: Script): string {
  if (script === "lat") return typoLat(value);
  return CYR_OVERRIDES[value] ?? latToCyr(value);
}

function mapValues<T extends Record<string, string>>(obj: T, script: Script): T {
  const out = {} as Record<string, string>;
  for (const [k, v] of Object.entries(obj)) out[k] = convert(v, script);
  return out as T;
}

export type Dictionary = {
  event: EventTexts;
  common: CommonTexts;
  months: string[];
  weekdays: string[];
  weekdaysShort: string[];
};

const cache = new Map<string, Dictionary>();

export function getDictionary(eventType: EventType, script: Script): Dictionary {
  const key = `${eventType}:${script}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const common = mapValues(COMMON as unknown as CommonTexts, script);
  const weekdays = WEEKDAYS.map((d) => convert(d, script));
  const dict: Dictionary = {
    event: mapValues(EVENTS[eventType] ?? EVENTS.boshqa, script),
    common,
    months: MONTHS.map((m) => convert(m, script)),
    weekdays,
    // Lotinda: Du Se Ch Pa Ju Sh Ya; kirillda to'liq nomning 2 harfi: Ду Се Чо Па Жу Ша Як
    weekdaysShort:
      script === "cyr"
        ? weekdays.map((w) => w[0].toUpperCase() + w[1])
        : COMMON.weekdaysShort.split(","),
  };
  cache.set(key, dict);
  return dict;
}

export const EVENT_LABELS: Record<EventType, string> = {
  nikoh: "Nikoh to‘yi",
  fotiha: "Fotiha to‘yi",
  sunnat: "Sunnat to‘yi",
  yubiley: "Yubiley",
  tugilgan_kun: "Tug‘ilgan kun",
  boshqa: "Boshqa tadbir",
};
