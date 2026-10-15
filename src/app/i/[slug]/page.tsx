import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/lib/invitation";
import { getDictionary } from "@/lib/dictionary";
import { toScript } from "@/lib/translit";
import { tashkentParts } from "@/lib/datetime";
import { getTemplateMeta } from "@/templates/registry";
import { TemplateView } from "@/templates/loaders";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ g?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { g } = await searchParams;
  const view = await getPublicInvitation(slug, g);
  if (!view) return { title: "Taklifnoma topilmadi" };
  const t = getDictionary(view.eventType, view.scriptMode);
  const names = view.name2 ? `${view.name1} & ${view.name2}` : view.name1;
  const d = tashkentParts(new Date(view.eventISO));
  // «Sunnat to'yi — Abdulloh | 18 sentabr 2027»
  const title = toScript(`${t.event.eventTitle} — ${names} | ${d.day} ${t.months[d.month - 1]} ${d.year}`, view.scriptMode);
  const description = view.guest
    ? toScript(`Hurmatli ${view.guest.name}, sizga taklifnoma bor.`, view.scriptMode)
    : toScript("Sizga taklifnoma bor. Ochish uchun bosing.", view.scriptMode);
  const meta = getTemplateMeta(view.templateId);
  return {
    title,
    description,
    robots: { index: false, follow: false },
    // Rasm: shu papkadagi opengraph-image.tsx (PNG) avtomatik ulanadi
    openGraph: { title, description, type: "website", siteName: "Taklifnoma" },
    twitter: { card: "summary_large_image", title, description },
    other: meta ? { "theme-color": meta.themeColor } : undefined,
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { g } = await searchParams;
  const view = await getPublicInvitation(slug, g);
  if (!view) notFound();
  return <TemplateView templateId={view.templateId} view={view} />;
}
