import type { TemplateMeta } from "../contract";

export const chinorMeta: TemplateMeta = {
  id: "chinor",
  name: "Chinor",
  description: "Yashil-qahrabo chinor barglari va yillar halqasi. Bosganda barglar aylanib to'kiladi, ostidan taklifnoma ochiladi.",
  supportedEventTypes: ["yubiley", "tugilgan_kun", "boshqa"],
  previewImage: "/templates/chinor/preview.svg",
  palette: {
    bg: "#F4EEDC",
    surface: "#FBF7EC",
    text: "#24301F",
    accent: "#2F5D3A",
    accent2: "#C8892B",
    muted: "#5A6150",
    ground: "#1F2B1D",
  },
  fonts: { heading: "Lora", body: "Lora", label: "Ysabeau SC" },
  sectionOrder: ["hero", "invite", "gallery", "date", "program", "notes", "venue", "gift", "rsvp", "closing"],
  defaultTexts: {
    yubiley: { closingText: "Davramizda bo'lishingizni kutamiz!" },
  },
  themeColor: "#1F2B1D",
};
