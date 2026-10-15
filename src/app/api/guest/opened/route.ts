import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Mehmon taklifnomani ochganini belgilaydi (sendBeacon matn ko'rinishida yuboradi) */
export async function POST(req: Request) {
  if (!rateLimit(`opened:${clientIp(req.headers)}`, 30, 60_000)) return new NextResponse(null, { status: 429 });
  let slug: unknown, token: unknown;
  try {
    ({ slug, token } = JSON.parse(await req.text()));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof slug !== "string" || typeof token !== "string" || !/^[A-Za-z0-9_-]{6,32}$/.test(token)) {
    return new NextResponse(null, { status: 400 });
  }
  await prisma.guest.updateMany({
    where: { token, openedAt: null, invitation: { slug, status: "published" } },
    data: { openedAt: new Date() },
  });
  return new NextResponse(null, { status: 204 });
}
