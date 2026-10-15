/**
 * DIZAYNLAR RO'YXATI
 *
 * Yangi dizayn qo'shish:
 *   1) src/templates/<id>/ papkasini yarating (meta.ts + index.tsx, maktub/ namuna sifatida)
 *   2) Quyidagi TEMPLATES ro'yxatiga va loaders.tsx dagi VIEWS ga bittadan qator qo'shing.
 * Boshqa hech qayerga tegish shart emas.
 */
import type { TemplateMeta } from "./contract";
import { maktubMeta } from "./maktub/meta";
import { nonMeta } from "./non/meta";
import { shahzodaMeta } from "./shahzoda/meta";
import { chinorMeta } from "./chinor/meta";
import { anorMeta } from "./anor/meta";
import { zarhalMeta } from "./zarhal/meta";
import { gulshanMeta } from "./gulshan/meta";

/** Metama'lumot (serverda ham, galereyada ham ishlatiladi) */
export const TEMPLATES: TemplateMeta[] = [gulshanMeta, zarhalMeta, maktubMeta, nonMeta, shahzodaMeta, chinorMeta, anorMeta];

export function getTemplateMeta(id: string): TemplateMeta | null {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

