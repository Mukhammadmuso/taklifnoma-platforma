import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Wizard } from "@/components/editor/Wizard";
import { prisma } from "@/lib/db";
import { rowToDraft } from "@/lib/draft";
import { requireUser } from "@/lib/session";
import { enabledTemplates } from "@/lib/template-settings";

export const metadata: Metadata = { title: "Taklifnomani tahrirlash — Taklifnoma" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/kabinet/t/${id}`);
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || (inv.ownerId !== user.id && user.role !== "admin")) notFound();

  return (
    <Wizard
      id={inv.id}
      initialDraft={rowToDraft(inv)}
      initialSlug={inv.slug}
      initialStatus={inv.status === "published" ? "published" : "draft"}
      templates={await enabledTemplates(inv.templateId)}
    />
  );
}
