import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Palette } from "@/templates/contract";
import { toScript } from "./translit";

/**
 * Havola rasmi (og:image) — Telegram, WhatsApp va boshqalar SVG'ni ko'rsatmaydi, shuning uchun PNG.
 * next/og ichidagi shrift faqat lotin harflarini biladi — matn har doim lotin yozuvida chiziladi
 * (kirillda yozilgan ismlar ham lotinga o'giriladi), aks holda harflar o'rniga kvadratlar chiqadi.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const lat = (s: string) => toScript(s, "lat");

/** public/ ichidagi dizayn preview SVG'si data-URI ko'rinishida */
async function previewUri(previewImage: string) {
  try {
    const file = path.join(process.cwd(), "public", previewImage.replace(/^\//, ""));
    const svg = await readFile(file);
    const mime = previewImage.endsWith(".jpg") || previewImage.endsWith(".jpeg") ? "image/jpeg" : previewImage.endsWith(".png") ? "image/png" : "image/svg+xml";
    return `data:${mime};base64,${svg.toString("base64")}`;
  } catch (e) {
    console.error("[og] preview o'qilmadi", previewImage, e);
    return null;
  }
}

/** Taklifnoma kartasi: chapda dizayn, o'ngda tadbir, ismlar va sana */
export async function invitationCard(opts: {
  palette: Palette;
  previewImage: string;
  eyebrow: string;
  title: string;
  date?: string;
  footer?: string;
}) {
  const img = await previewUri(opts.previewImage);
  const { palette } = opts;
  const title = lat(opts.title);
  const size = title.length > 26 ? 60 : title.length > 16 ? 72 : 88;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: palette.ground ?? palette.accent }}>
        {img && <img src={img} width={473} height={630} alt="" style={{ objectFit: "cover" }} />}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "56px 64px",
            background: palette.bg,
            color: palette.text,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: palette.accent }}>{lat(opts.eyebrow)}</div>
          <div style={{ display: "flex", width: 64, height: 3, background: palette.accent2, margin: "26px 0 30px" }} />
          <div style={{ display: "flex", fontSize: size, lineHeight: 1.06, letterSpacing: -1 }}>{title}</div>
          {opts.date && <div style={{ display: "flex", marginTop: 30, fontSize: 34, color: palette.muted ?? palette.text }}>{lat(opts.date)}</div>}
          <div style={{ display: "flex", marginTop: "auto", fontSize: 24, color: palette.muted ?? palette.text }}>{lat(opts.footer ?? "Taklifnomani ochish uchun bosing")}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

/** Platforma kartasi: bosh sahifa va topilmagan taklifnomalar uchun */
export async function brandCard(previews: string[]) {
  const imgs = (await Promise.all(previews.slice(0, 3).map(previewUri))).filter(Boolean) as string[];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f5f5f2", color: "#1c1b19" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 0 64px 72px" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#0e6b70", letterSpacing: 4, textTransform: "uppercase" }}>Taklifnoma</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 68, lineHeight: 1.05, letterSpacing: -2 }}>Taklifnomangizni o‘zingiz yarating</div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "#58534d", lineHeight: 1.35 }}>
            To‘y, fotiha, yubiley — jonli raqamli taklifnoma bir necha daqiqada
          </div>
        </div>
        <div style={{ width: 560, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              width={228}
              height={304}
              alt=""
              style={{
                position: "absolute",
                left: 30 + i * 150,
                top: i === 1 ? 140 : 180,
                borderRadius: 18,
                boxShadow: "0 24px 50px rgba(28,27,25,0.28)",
                transform: `rotate(${(i - 1) * 6}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
