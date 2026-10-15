import type { TemplateMeta } from "../contract";

export const nonMeta: TemplateMeta = {
  id: "non",
  name: "Non",
  description: "Zig'ir dasturxon, bug'doy boshoqlari va tandir noni. Nonni bosganda u ikkiga ushatiladi, ichidan bug' ko'tariladi.",
  supportedEventTypes: ["fotiha", "nikoh", "boshqa"],
  previewImage: "/templates/non/preview.svg",
  palette: {
    bg: "#F3EAD8",
    surface: "#FBF6EC",
    text: "#3A2414",
    accent: "#8A3F16",
    accent2: "#C08A36",
    muted: "#6B4E36",
    ground: "#2A1A0F",
  },
  fonts: { heading: "Alegreya", body: "Alegreya", label: "Alegreya Sans" },
  sectionOrder: ["hero", "invite", "gallery", "date", "program", "notes", "venue", "gift", "rsvp", "closing"],
  defaultTexts: {
    fotiha: { closingText: "Non-tuzimizga marhamat!" },
  },
  themeColor: "#2A1A0F",
};
