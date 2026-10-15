import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { pad2, tashkentParts } from "@/lib/datetime";
import { csvResponse, toCsv } from "@/lib/csv";

/** Javoblar jadvali — faqat taklifnoma egasiga */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return new Response("Avval tizimga kiring.", { status: 401 });
  const inv = await prisma.invitation.findUnique({
    where: { id },
    include: { rsvps: { orderBy: { updatedAt: "asc" }, include: { guest: { select: { name: true } } } } },
  });
  if (!inv || (inv.ownerId !== session.user.id && session.user.role !== "admin")) return new Response("Topilmadi.", { status: 404 });

  const rows = inv.rsvps.map((r) => {
    const p = tashkentParts(r.updatedAt);
    return [
      r.name,
      r.attending ? "Keladi" : "Kelmaydi",
      r.attending ? String(r.count) : "0",
      r.wish ?? "",
      r.guest ? `Shaxsiy havola: ${r.guest.name}` : "Umumiy havola",
      `${pad2(p.day)}.${pad2(p.month)}.${p.year} ${pad2(p.hour)}:${pad2(p.minute)}`,
    ];
  });
  return csvResponse(toCsv(["Ism", "Javob", "Kishi", "Tilak", "Qayerdan", "Sana (Toshkent)"], rows), `javoblar-${inv.slug}.csv`);
}
