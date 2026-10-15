import type { TemplateMeta } from "../contract";

/** Bog' va arka: rasmli premium dizayn (rasmlar — public/templates/gulshan/) */
export const gulshanMeta: TemplateMeta = {
  id: "gulshan",
  name: "Gulshan",
  description: "Koshinli arka ortidagi bog', pionlar va anorlar. Nur sochayotgan konvertdagi lak muhrni bosganda taklifnoma ochiladi.",
  supportedEventTypes: ["nikoh", "fotiha", "sunnat", "yubiley", "tugilgan_kun", "boshqa"],
  previewImage: "/templates/gulshan/preview.jpg",
  palette: {
    bg: "#F4ECDC",
    surface: "#FBF6EC",
    text: "#3B2F24",
    accent: "#9E1B2C",
    accent2: "#B08A3E",
    muted: "#6E6052",
    ground: "#2F2620",
  },
  fonts: { heading: "Pinyon Script", body: "Cormorant Garamond", label: "Cormorant Garamond" },
  sectionOrder: ["hero", "invite", "date", "program", "notes", "venue", "gift", "rsvp", "gallery", "closing"],
  defaultTexts: {
    nikoh: { countdownTitle: "To'yga qadar" },
  },
  commonTexts: {
    all: { dearGuest: "Hurmatli mehmonimiz" },
  },
  themeColor: "#2F2620",
};
