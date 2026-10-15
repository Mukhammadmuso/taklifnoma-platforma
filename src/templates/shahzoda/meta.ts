import type { TemplateMeta } from "../contract";

export const shahzodaMeta: TemplateMeta = {
  id: "shahzoda",
  name: "Shahzoda",
  description: "Fil suyagi rangidagi ganch, firuza koshin arka va do'ppi qalampiri. Bosganda arkadagi kaptarlar uchib ketadi.",
  supportedEventTypes: ["sunnat", "tugilgan_kun", "boshqa"],
  previewImage: "/templates/shahzoda/preview.svg",
  palette: {
    bg: "#F7F1E3",
    surface: "#FFFBF2",
    text: "#1F2A2E",
    accent: "#0E6466",
    accent2: "#B8913A",
    muted: "#4F5B5C",
    ground: "#0B3B40",
  },
  fonts: { heading: "Cormorant", body: "Spectral", label: "Cormorant SC" },
  sectionOrder: ["hero", "invite", "gallery", "date", "program", "notes", "venue", "gift", "rsvp", "closing"],
  defaultTexts: {
    sunnat: { closingText: "Shahzodamizning to'yida sizni kutamiz!" },
  },
  themeColor: "#0B3B40",
};
