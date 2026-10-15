import { csvSafe } from "./sanitize";

/**
 * CSV: ";" ajratgich (O'zbekistondagi Excel rus/o'zbek sozlamasida shu bilan ochiladi),
 * UTF-8 BOM (kirill va o‘/g‘ harflari buzilmasligi uchun), formula in'ektsiyasidan himoya.
 */
export function toCsv(header: string[], rows: string[][]) {
  const cell = (v: string) => {
    const safe = csvSafe(v ?? "");
    return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n") + "\r\n";
}

export function csvResponse(body: string, filename: string) {
  const ascii = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ascii}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
