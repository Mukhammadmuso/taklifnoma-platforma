/**
 * Demo ma'lumotlar: bitta foydalanuvchi, bitta e'lon qilingan taklifnoma va 3 ta mehmon.
 * Ishga tushirish: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { sampleView } from "../src/lib/sample";
import { guestToken } from "../src/lib/tokens";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "demo@taklifnoma.local" },
    create: { email: "demo@taklifnoma.local", name: "Demo foydalanuvchi", role: "admin" },
    update: {},
  });

  const v = sampleView("maktub", "nikoh");
  const slug = "bekzod-sevinch";
  const data = {
    ownerId: owner.id,
    status: "published",
    isPaid: true,
    templateId: "maktub",
    eventType: v.eventType,
    scriptMode: "lat",
    name1: v.name1,
    name2: v.name2,
    subtitle: null,
    hosts: v.hosts,
    eventDateTime: new Date(v.eventISO),
    venueName: v.venueName,
    address: v.address,
    googleMapsUrl: v.googleMapsUrl,
    yandexMapsUrl: v.yandexMapsUrl,
    program: v.program,
    notes: v.notes,
    giftText: v.giftText,
    telegramUsername: v.telegramUsername,
    musicId: v.music?.id ?? null,
    rsvpEnabled: true,
  };
  const inv = await prisma.invitation.upsert({ where: { slug }, create: { slug, ...data }, update: data });

  const guests = ["Aziza opa", "Rustam aka", "Нодира Каримова"];
  for (const name of guests) {
    const existing = await prisma.guest.findFirst({ where: { invitationId: inv.id, name } });
    if (!existing) await prisma.guest.create({ data: { invitationId: inv.id, name, token: guestToken() } });
  }
  const all = await prisma.guest.findMany({ where: { invitationId: inv.id } });
  console.log(`\nTaklifnoma: http://localhost:3000/i/${slug}`);
  for (const g of all) console.log(`  ${g.name.padEnd(18)} http://localhost:3000/i/${slug}?g=${g.token}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
