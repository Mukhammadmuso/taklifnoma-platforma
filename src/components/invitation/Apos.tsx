import { Fragment, type ReactNode } from "react";

const APOS_RE = /([‘’ʻʼ'])/;

/**
 * Kalligrafik shriftlarda o‘/g‘ va tutuq belgisi ko'pincha juda kichik yoki umuman yo'q.
 * Bu yordamchi ularni .inv-apos ichiga oladi — dizayn uni o'qiladigan shrift bilan chizadi.
 */
export function apos(text: string | null | undefined): ReactNode {
  if (!text) return text;
  if (!APOS_RE.test(text)) return text;
  return text.split(APOS_RE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="inv-apos">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
