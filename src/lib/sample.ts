/**
 * Namuna (demo) ma'lumotlar — galereya va /namuna/{dizayn} sahifalari uchun.
 * Hammasi sun'iy: ismlar, manzil va karta raqami haqiqiy emas.
 */
import type { EventType } from "./dictionary";
import { fromTashkentLocal } from "./datetime";
import { toView, type InvitationView } from "./view";

type SampleSeed = Omit<Parameters<typeof toView>[0], "slug" | "templateId" | "isPaid">;

const BASE = {
  scriptMode: "lat",
  venueName: "Bog‘ishamol to‘yxonasi",
  address: "Toshkent sh., Yunusobod tumani, Bog‘ishamol ko‘chasi, 12-uy (namuna manzil)",
  googleMapsUrl: "https://maps.google.com/?q=41.3656,69.2890",
  yandexMapsUrl: "https://yandex.uz/maps/?pt=69.2890,41.3656&z=16",
  telegramUsername: "taklifnoma_namuna",
  phone: null,
  mainPhotoUrl: null,
  venuePhotoUrl: null,
  gallery: [],
  parents1: null,
  parents2: null,
  quote: null,
  venueHall: null,
  landmark: null,
  theme: null,
  bismillah: true,
  musicId: "navo",
  rsvpEnabled: true,
} as const;

const SAMPLES: Record<EventType, SampleSeed> = {
  nikoh: {
    ...BASE,
    eventType: "nikoh",
    name1: "Bekzod",
    name2: "Sevinch",
    subtitle: null,
    hosts: "Yusupovlar va Ahmedovlar oilalari",
    parents1: "Akbar va Nodira Yusupovlar",
    parents2: "Sherzod va Dilfuza Ahmedovlar",
    quote: "Bir umrga — bir yo‘l",
    venueHall: "Katta zal",
    landmark: "Mo‘ljal: Bog‘ishamol bekati yonida (namuna)",
    eventDateTime: fromTashkentLocal("2027-05-15T17:00"),
    program: [
      { time: "07:00", title: "Nahor oshi", description: "Kuyov xonadonida, erkaklar uchun", icon: "osh" },
      { time: "12:00", title: "Nikoh", description: "FHDYO bo‘limida, yaqinlar davrasida", icon: "uzuk" },
      { time: "17:00", title: "Mehmonlarni kutib olish", description: "To‘yxona ayvonida, karnay-surnay sadolari", icon: "karnay" },
      { time: "18:00", title: "Kelin-kuyov tashrifi", description: "«Yor-yor» qo‘shig‘i ostida", icon: "eshik" },
      { time: "18:30", title: "Ziyofat", description: "Milliy taomlar va ota-onalar duosi", icon: "choy" },
      { time: "20:30", title: "Raqs va musiqa", description: "Jonli ijro", icon: "musiqa" },
    ],
    notes: [
      "Kiyinish uslubi — bayramona. Oq libosni kelinga qoldiraylik.",
      "To‘yxona hovlisida bepul avtoturargoh bor.",
      "Bolalar uchun alohida o‘yin xonasi tashkil etilgan.",
    ],
    giftTitle: null,
    giftText:
      "Sizning tashrifingiz — biz uchun eng katta sovg‘a. To‘yona yubormoqchi bo‘lsangiz, karta: 8600 0000 0000 0000 (Bekzod Y.)",
  },
  fotiha: {
    ...BASE,
    eventType: "fotiha",
    name1: "Jahongir",
    name2: "Mohinur",
    subtitle: null,
    hosts: "Karimovlar oilasi",
    eventDateTime: fromTashkentLocal("2027-04-10T12:00"),
    program: [
      { time: "12:00", title: "Mehmonlarni kutib olish" },
      { time: "12:30", title: "Fotiha va duo" },
      { time: "13:00", title: "Dasturxon" },
    ],
    notes: ["Ayollar uchun ro‘mol tavsiya etiladi."],
    giftTitle: null,
    giftText: null,
  },
  sunnat: {
    ...BASE,
    eventType: "sunnat",
    name1: "Abdulloh",
    name2: null,
    subtitle: null,
    hosts: "Rahimovlar oilasi",
    eventDateTime: fromTashkentLocal("2027-09-18T11:00"),
    program: [
      { time: "06:00", title: "Nahor oshi" },
      { time: "11:00", title: "Bayram dasturxoni" },
      { time: "12:00", title: "Bolalar uchun o‘yinlar" },
    ],
    notes: [],
    giftTitle: null,
    giftText: null,
  },
  yubiley: {
    ...BASE,
    eventType: "yubiley",
    name1: "Hamida opa",
    name2: null,
    subtitle: null,
    hosts: "Farzandlari va nevaralari",
    eventDateTime: fromTashkentLocal("2027-10-02T18:00"),
    program: [
      { time: "18:00", title: "Kutib olish" },
      { time: "18:30", title: "Tabriklar" },
      { time: "19:30", title: "Bayram kechasi" },
    ],
    notes: [],
    giftTitle: null,
    giftText: null,
  },
  tugilgan_kun: {
    ...BASE,
    eventType: "tugilgan_kun",
    name1: "Laylo",
    name2: null,
    subtitle: null,
    hosts: null,
    eventDateTime: fromTashkentLocal("2027-03-20T16:00"),
    program: [],
    notes: [],
    giftTitle: null,
    giftText: null,
  },
  boshqa: {
    ...BASE,
    eventType: "boshqa",
    name1: "Oila davrasi",
    name2: null,
    subtitle: null,
    hosts: null,
    eventDateTime: fromTashkentLocal("2027-06-01T18:00"),
    program: [],
    notes: [],
    giftTitle: null,
    giftText: null,
  },
};

export function sampleView(templateId: string, eventType: EventType, guestName?: string): InvitationView {
  const seed = SAMPLES[eventType] ?? SAMPLES.nikoh;
  return toView(
    { ...seed, slug: `namuna-${templateId}`, templateId, isPaid: true },
    guestName ? { token: "namuna", name: guestName } : null,
    true,
  );
}
