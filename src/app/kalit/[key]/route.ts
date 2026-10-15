import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startSession } from "@/lib/anon";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Maxfiy tahrirlash havolasi: boshqa qurilmada o'z taklifnomalariga qaytish */
export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const url = new URL(req.url);
  if (!rateLimit(`key:${clientIp(req.headers)}`, 20, 600_000)) {
    return new NextResponse("Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.", { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const user = /^[A-Za-z0-9_-]{20,64}$/.test(key) ? await prisma.user.findUnique({ where: { accessKey: key }, select: { id: true } }) : null;
  if (!user) return NextResponse.redirect(new URL("/kabinet?kalit=xato", url));
  await startSession(user.id);
  return NextResponse.redirect(new URL("/kabinet", url));
}
