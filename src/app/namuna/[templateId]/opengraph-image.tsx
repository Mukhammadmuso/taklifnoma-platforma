import { brandCard, invitationCard, OG_SIZE } from "@/lib/og";
import { getTemplateMeta, TEMPLATES } from "@/templates/registry";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Namuna taklifnoma";

export default async function Image({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const meta = getTemplateMeta(templateId);
  if (!meta) return brandCard(TEMPLATES.map((t) => t.previewImage));
  return invitationCard({
    palette: meta.palette,
    previewImage: meta.previewImage,
    eyebrow: "Namuna taklifnoma",
    title: `«${meta.name}» dizayni`,
    date: meta.description.split(".")[0],
    footer: "Taklifnomangizni o‘zingiz yarating",
  });
}
