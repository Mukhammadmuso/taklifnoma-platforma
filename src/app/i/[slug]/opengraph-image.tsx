import { getPublicInvitation } from "@/lib/invitation";
import { getDictionary, MONTHS } from "@/lib/dictionary";
import { formatTime, tashkentParts } from "@/lib/datetime";
import { brandCard, invitationCard, OG_SIZE } from "@/lib/og";
import { getTemplateMeta, TEMPLATES } from "@/templates/registry";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Taklifnoma";

/** Faqat e'lon qilingan taklifnoma; mehmon ismi rasmga yozilmaydi (havola ulashilganda boshqalar ham ko'radi) */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = await getPublicInvitation(slug);
  const meta = view && getTemplateMeta(view.templateId);
  if (!view || !meta) return brandCard(TEMPLATES.map((t) => t.previewImage));
  const t = getDictionary(view.eventType, "lat");
  const p = tashkentParts(new Date(view.eventISO));
  return invitationCard({
    palette: meta.palette,
    previewImage: meta.previewImage,
    eyebrow: t.event.eventTitle,
    title: view.name2 ? `${view.name1} & ${view.name2}` : view.name1,
    date: `${p.day} ${MONTHS[p.month - 1]} ${p.year}, soat ${formatTime(p)}`,
  });
}
