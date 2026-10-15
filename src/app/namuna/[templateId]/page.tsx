import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EVENT_TYPES, type EventType } from "@/lib/dictionary";
import { sampleView } from "@/lib/sample";
import { getTemplateMeta } from "@/templates/registry";
import { TemplateView } from "@/templates/loaders";
import { SampleCta } from "@/components/sample/SampleCta";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ tur?: string; mehmon?: string; yozuv?: string; ichki?: string; mavzu?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params;
  const meta = getTemplateMeta(templateId);
  if (!meta) return { title: "Dizayn topilmadi" };
  return {
    title: `${meta.name} — namuna taklifnoma`,
    description: meta.description,
    openGraph: { title: `${meta.name} — namuna taklifnoma`, description: meta.description, siteName: "Taklifnoma" },
    other: { "theme-color": meta.themeColor },
  };
}

/** Dizayn namunasi: ?tur=fotiha (tadbir turi), ?mehmon=Ism (shaxsiy murojaat), ?yozuv=cyr */
export default async function SamplePage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { tur, mehmon, yozuv, ichki, mavzu } = await searchParams;
  const meta = getTemplateMeta(templateId);
  if (!meta) notFound();
  const eventType: EventType =
    tur && (EVENT_TYPES as readonly string[]).includes(tur) ? (tur as EventType) : meta.supportedEventTypes[0];
  const view = sampleView(meta.id, eventType, mehmon?.slice(0, 60));
  if (yozuv === "cyr") view.scriptMode = "cyr";
  if (mavzu && meta.themes?.some((th) => th.id === mavzu)) view.theme = mavzu;
  return (
    <>
      <TemplateView templateId={meta.id} view={view} />
      {/* Bosh sahifa ichidagi jonli namunada (ichki=1) panel kerak emas */}
      {ichki !== "1" && <SampleCta templateId={meta.id} name={meta.name} eventType={eventType} />}
    </>
  );
}
