import "server-only";
import { prisma } from "./db";
import { TEMPLATES } from "@/templates/registry";
import type { TemplateMeta } from "@/templates/contract";

/** Admin o'chirgan dizaynlar */
export async function disabledTemplateIds(): Promise<Set<string>> {
  try {
    const rows = await prisma.templateSetting.findMany({ where: { enabled: false }, select: { id: true } });
    return new Set(rows.map((r) => r.id));
  } catch (e) {
    // Sozlamalar o'qilmasa ham galereya ishlashi kerak — barcha dizaynlar ko'rinadi
    console.error("[template-settings]", e);
    return new Set();
  }
}

/** Galereya va yangi taklifnoma uchun: faqat yoqilgan dizaynlar (eng kamida bittasi qoladi) */
export async function enabledTemplates(keep?: string): Promise<TemplateMeta[]> {
  const off = await disabledTemplateIds();
  const list = TEMPLATES.filter((t) => !off.has(t.id) || t.id === keep);
  return list.length ? list : TEMPLATES.slice(0, 1);
}
