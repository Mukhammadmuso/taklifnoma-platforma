import type { TemplateMeta } from "../contract";

/** Bismillah bilan ochiladigan premium milliy dizayn: oltin naqsh, pardalar, rang mavzulari */
export const zarhalMeta: TemplateMeta = {
  id: "zarhal",
  name: "Zarhal",
  description: "Bismillah bilan ochiladigan premium taklifnoma: oltin islimi naqshlar, pardalar ochilib oltin zarralar sochiladi. To‘rt rang mavzusi.",
  supportedEventTypes: ["sunnat", "nikoh", "fotiha", "tugilgan_kun", "yubiley", "boshqa"],
  previewImage: "/templates/zarhal/preview.svg",
  palette: {
    bg: "#FBF7EE",
    surface: "#FFFDF8",
    text: "#1E2622",
    accent: "#0E3B33",
    accent2: "#B8913A",
    muted: "#55605A",
    ground: "#0A2B25",
  },
  fonts: { heading: "Cormorant Garamond", body: "Cormorant Garamond", label: "Montserrat" },
  sectionOrder: ["hero", "date", "invite", "program", "notes", "venue", "gift", "rsvp", "gallery", "closing"],
  defaultTexts: {
    sunnat: { programTitle: "To'y dasturi", todayText: "Bugun bizning quvonchli kunimiz!" },
    nikoh: { programTitle: "To'y dasturi", todayText: "Bugun bizning quvonchli kunimiz!" },
    fotiha: { todayText: "Bugun bizning quvonchli kunimiz!" },
    tugilgan_kun: { todayText: "Bugun bizning quvonchli kunimiz!" },
    yubiley: { todayText: "Bugun bizning quvonchli kunimiz!" },
    boshqa: { todayText: "Bugun bizning quvonchli kunimiz!" },
  },
  commonTexts: {
    all: {
      dearGuest: "Hurmatli aziz mehmon",
      rsvpTitle: "Tashrifingizni tasdiqlang",
      submit: "Javob yuborish",
      galleryTitle: "Baxtli lahzalar",
    },
    sunnat: { venueTitle: "To'y manzili", attending: "To'yga kelasizmi?", count: "Necha kishi bo'lib kelasiz?" },
    nikoh: { venueTitle: "To'y manzili", attending: "To'yga kelasizmi?", count: "Necha kishi bo'lib kelasiz?" },
  },
  themes: [
    { id: "zumrad", name: "Zumrad", swatch: ["#0E3B33", "#B8913A"] },
    { id: "lojuvard", name: "Lojuvard", swatch: ["#18305E", "#C29A45"] },
    { id: "yoqut", name: "Yoqut", swatch: ["#5A1426", "#C49A4A"] },
    { id: "tun", name: "Tun", swatch: ["#1C1B2E", "#C9A24E"] },
  ],
  bismillah: true,
  themeColor: "#0A2B25",
};
