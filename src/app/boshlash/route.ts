import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAnonymousUser } from "@/lib/anon";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const safeNext = (v: string | null) => (v && v.startsWith("/") && !v.startsWith("//") ? v : "/kabinet");

/** Kabinetga kirish: hisob bo'lmasa — ro'yxatdan o'tmasdan yashirin hisob ochiladi */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"));
  const session = await auth();
  if (!session?.user?.id) {
    if (!rateLimit(`anon:${clientIp(req.headers)}`, 30, 3_600_000)) {
      return new NextResponse("Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.", { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    await createAnonymousUser();
  }
  return NextResponse.redirect(new URL(next, url));
}
