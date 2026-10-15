import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Shaxsiy taklifnomalar, kabinet va admin qidiruv tizimlariga ochilmaydi */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/namuna/"], disallow: ["/i/", "/kabinet", "/admin", "/kirish", "/api/", "/oldindan-korish"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
