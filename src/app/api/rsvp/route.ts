import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cleanText } from "@/lib/sanitize";
import { rsvpInput } from "@/lib/schema";

const err = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err(400, "So'rov noto'g'ri yuborildi.");
  }
  const parsed = rsvpInput.safeParse(body);
  if (!parsed.success) return err(400, "Ma'lumotlar to'liq emas. Ismingiz va javobingizni tekshiring.");
  const input = parsed.data;

  // Honeypot to'ldirilgan — bot. Unga muvaffaqiyat ko'rsatamiz, lekin hech narsa saqlanmaydi.
  if (input.website) return NextResponse.json({ ok: true });

  const ip = clientIp(req.headers);
  if (!rateLimit(`rsvp:${ip}:${input.slug}`, 5, 60_000) || !rateLimit(`rsvp:${ip}`, 30, 3_600_000)) {
    return err(429, "Juda ko'p urinish. Bir daqiqadan so'ng qayta yuboring.");
  }

  const name = cleanText(input.name, 80);
  const wish = cleanText(input.wish ?? "", 600) || null;
  if (!name) return err(400, "Iltimos, ismingizni yozing.");

  const invitation = await prisma.invitation.findUnique({
    where: { slug: input.slug },
    select: { id: true, status: true, rsvpEnabled: true },
  });
  if (!invitation || invitation.status !== "published") return err(404, "Taklifnoma topilmadi.");
  if (!invitation.rsvpEnabled) return err(403, "Bu taklifnomada javob qabul qilinmaydi.");

  const guest = input.guestToken
    ? await prisma.guest.findFirst({ where: { token: input.guestToken, invitationId: invitation.id }, select: { id: true } })
    : null;

  const data = {
    name,
    attending: input.attending,
    count: input.attending ? input.count : 1,
    wish,
  };

  try {
    if (guest) {
      // Bitta mehmon — bitta javob: qayta yuborsa, yangilanadi
      await prisma.$transaction([
        prisma.rsvp.upsert({
          where: { guestId: guest.id },
          create: { ...data, invitationId: invitation.id, guestId: guest.id },
          update: data,
        }),
        prisma.guest.update({ where: { id: guest.id }, data: { respondedAt: new Date() } }),
      ]);
    } else {
      await prisma.rsvp.create({ data: { ...data, invitationId: invitation.id } });
    }
  } catch (e) {
    console.error("[rsvp] saqlashda xato", e);
    return err(500, "Javob saqlanmadi. Birozdan so'ng qayta urinib ko'ring.");
  }

  return NextResponse.json({ ok: true });
}
