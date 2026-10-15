import { brandCard, OG_SIZE } from "@/lib/og";
import { TEMPLATES } from "@/templates/registry";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Taklifnoma — raqamli taklifnomani o‘zingiz yarating";

export default function Image() {
  return brandCard(TEMPLATES.map((t) => t.previewImage));
}
