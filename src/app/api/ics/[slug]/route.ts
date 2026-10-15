import { getDictionary } from "@/lib/dictionary";
import { buildIcs } from "@/lib/ics";
import { getPublicInvitation } from "@/lib/invitation";
import { sampleView } from "@/lib/sample";
import { siteUrl } from "@/lib/site";
import { toScript } from "@/lib/translit";
import { getTemplateMeta } from "@/templates/registry";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let view = null;
  let pageUrl = `${siteUrl()}/i/${slug}`;
  if (slug.startsWith("namuna-")) {
    const meta = getTemplateMeta(slug.slice("namuna-".length));
    if (meta) {
      view = sampleView(meta.id, meta.supportedEventTypes[0]);
      pageUrl = `${siteUrl()}/namuna/${meta.id}`;
    }
  } else {
    view = await getPublicInvitation(slug);
  }
  if (!view) return new Response("Taklifnoma topilmadi", { status: 404 });

  const t = getDictionary(view.eventType, view.scriptMode);
  const names = view.name2 ? `${view.name1} & ${view.name2}` : view.name1;
  const ics = buildIcs({
    uid: `${slug}@taklifnoma`,
    title: toScript(`${names} — ${t.event.eventTitle}`, view.scriptMode),
    start: new Date(view.eventISO),
    location: [view.venueName, view.address].filter(Boolean).join(", "),
    description: pageUrl,
    url: pageUrl,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="taklifnoma-${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
