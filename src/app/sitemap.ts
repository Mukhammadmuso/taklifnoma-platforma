import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { enabledTemplates } from "@/lib/template-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const templates = await enabledTemplates();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...templates.map((t) => ({ url: `${base}/namuna/${t.id}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
