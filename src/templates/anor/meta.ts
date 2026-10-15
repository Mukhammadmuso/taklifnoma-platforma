import type { TemplateMeta } from "../contract";

export const anorMeta: TemplateMeta = {
  id: "anor",
  name: "Anor",
  description: "Pushti fon, anor qizili va barg yashili. Anorni bosganda u ikkiga ochilib, yoqut donalari sochiladi.",
  supportedEventTypes: ["nikoh", "fotiha", "boshqa"],
  previewImage: "/templates/anor/preview.svg",
  palette: {
    bg: "#FBEEEA",
    surface: "#FFF8F6",
    text: "#3B1520",
    accent: "#A3122E",
    accent2: "#3E7A45",
    muted: "#6E4650",
    ground: "#3D0B18",
  },
  fonts: { heading: "Noto Serif Display", body: "Source Serif 4", label: "Arsenal" },
  sectionOrder: ["hero", "invite", "gallery", "date", "program", "notes", "venue", "gift", "rsvp", "closing"],
  defaultTexts: {
    nikoh: { closingText: "Baxtimizga sherik bo'ling!" },
  },
  themeColor: "#3D0B18",
};
