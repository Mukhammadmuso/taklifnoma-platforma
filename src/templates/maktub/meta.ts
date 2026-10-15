import type { TemplateMeta } from "../contract";

export const maktubMeta: TemplateMeta = {
  id: "maktub",
  name: "Maktub",
  description: "Krem qog'oz, bordo lak muhr va oltin chiziqlar. Muhrni bosganda konvert ochilib, xat chiqadi.",
  supportedEventTypes: ["nikoh", "fotiha", "yubiley", "boshqa"],
  previewImage: "/templates/maktub/preview.svg",
  palette: {
    bg: "#F4ECDD",
    surface: "#FAF5EA",
    text: "#2B1B16",
    accent: "#7A1426",
    accent2: "#A57C34",
    muted: "#5E4A40",
    ground: "#3A0A14",
  },
  fonts: { heading: "Great Vibes", body: "EB Garamond", label: "Forum" },
  sectionOrder: ["hero", "invite", "gallery", "date", "program", "notes", "venue", "gift", "rsvp", "closing"],
  defaultTexts: {
    nikoh: { closingText: "Sizni intizorlik bilan kutamiz!" },
  },
  themeColor: "#3A0A14",
};
