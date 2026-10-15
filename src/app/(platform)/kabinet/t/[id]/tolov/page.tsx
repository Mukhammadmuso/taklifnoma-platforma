import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationNav } from "@/components/platform/InvitationNav";
import { prisma } from "@/lib/db";
import { checkoutAvailable, clickCheckoutUrl, paymeCheckoutUrl, priceUzs } from "@/lib/payments";
import { requireUser } from "@/lib/session";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "«Namuna» belgisini olib tashlash — Taklifnoma" };

const som = (n: number) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} so‘m`;

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/kabinet/t/${id}/tolov`);
  const inv = await prisma.invitation.findUnique({
    where: { id },
    include: { _count: { select: { guests: true, rsvps: true } } },
  });
  if (!inv || (inv.ownerId !== user.id && user.role !== "admin")) notFound();

  const title = [inv.name1, inv.name2].filter(Boolean).join(" & ") || "Nomsiz qoralama";
  const price = priceUzs();
  const back = `${siteUrl()}/kabinet/t/${inv.id}/tolov`;
  const click = clickCheckoutUrl(inv.id, back);
  const payme = paymeCheckoutUrl(inv.id, back);
  const online = checkoutAvailable("click") || checkoutAvailable("payme");
  const support = process.env.SUPPORT_TELEGRAM?.replace(/^@/, "").replace(/[^A-Za-z0-9_]/g, "");

  return (
    <main className="p-main">
      <p className="p-muted" style={{ marginBottom: 4 }}>
        <Link href="/kabinet">← Taklifnomalarim</Link>
      </p>
      <h1 className="p-h1">{title}</h1>
      <div style={{ marginTop: 14 }}>
        <InvitationNav id={inv.id} active="edit" guests={inv._count.guests} replies={inv._count.rsvps} />
      </div>

      <section className="p-card" style={{ padding: 22, maxWidth: 640 }} aria-labelledby="pay-title">
        <h2 id="pay-title" className="p-h2">
          «Namuna» belgisi
        </h2>

        {inv.isPaid ? (
          <p className="p-alert p-alert--ok" style={{ marginTop: 12 }}>
            Belgi olib tashlangan — mehmonlar taklifnomani belgisiz ko‘radi. Rahmat!
          </p>
        ) : (
          <>
            <p className="p-lead" style={{ marginTop: 8 }}>
              Taklifnoma yaratish va yuborish bepul. E’lon qilingan sahifaning pastki burchagida kichik «Namuna» belgisi turadi. To‘lovdan keyin u olib tashlanadi — boshqa hech narsa o‘zgarmaydi.
            </p>
            <p style={{ marginTop: 14 }}>
              <strong>Narx: </strong>
              {price ? som(price) : "tez orada e’lon qilinadi"}
            </p>

            {online ? (
              <div className="p-row" style={{ marginTop: 18 }}>
                {click && (
                  <a className="p-btn p-btn--primary" href={click}>
                    Click orqali to‘lash
                  </a>
                )}
                {payme && (
                  <a className="p-btn p-btn--primary" href={payme}>
                    Payme orqali to‘lash
                  </a>
                )}
              </div>
            ) : (
              <p className="p-alert p-alert--info" style={{ marginTop: 18 }}>
                Click va Payme orqali onlayn to‘lov tez orada ulanadi.{" "}
                {support ? (
                  <>
                    Hozir belgini olib tashlamoqchi bo‘lsangiz, Telegram orqali yozing:{" "}
                    <a href={`https://t.me/${support}?text=${encodeURIComponent(`Assalomu alaykum! «Namuna» belgisini olib tashlamoqchiman: ${siteUrl()}/i/${inv.slug}`)}`} target="_blank" rel="noopener noreferrer">
                      @{support}
                    </a>
                  </>
                ) : (
                  "Hozircha belgini administrator olib tashlaydi."
                )}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
