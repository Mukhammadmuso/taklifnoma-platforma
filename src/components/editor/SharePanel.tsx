"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useCopy } from "@/components/invitation/hooks";
import s from "./editor.module.css";

export function SharePanel({ slug, title }: { slug: string; title: string }) {
  const [url, setUrl] = useState(`/i/${slug}`);
  const [qr, setQr] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);
  const [copyState, copy] = useCopy();

  useEffect(() => {
    const full = `${window.location.origin}/i/${slug}`;
    setUrl(full);
    QRCode.toDataURL(full, { margin: 1, width: 296, color: { dark: "#1c1b19", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQrError(true));
  }, [slug]);

  const text = `${title} — taklifnoma`;
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  return (
    <div className={s.share}>
      <div className="p-field">
        <label className="p-label" htmlFor="share-url">
          Taklifnoma havolasi
        </label>
        <div className={s.shareLink}>
          <input id="share-url" className="p-input" value={url} readOnly onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="p-btn" onClick={() => copy(url)}>
            {copyState === "copied" ? "Nusxalandi" : "Nusxalash"}
          </button>
        </div>
        {copyState === "failed" && <p className="p-error">Nusxalab bo‘lmadi — havolani qo‘lda belgilang.</p>}
      </div>
      <div className="p-row">
        <a className="p-btn p-btn--primary" href={tg} target="_blank" rel="noopener noreferrer">
          Telegramda ulashish
        </a>
        <a className="p-btn" href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        <a className="p-btn p-btn--ghost" href={`/i/${slug}`} target="_blank" rel="noopener">
          Ochib ko‘rish
        </a>
      </div>
      <div className={s.qr}>
        {qr ? (
          <img src={qr} alt={`QR kod: ${url}`} />
        ) : (
          <div className={s.thumb} style={{ width: 148, height: 148 }} aria-hidden />
        )}
        <div>
          <p className="p-label">QR kod</p>
          <p className="p-hint">{qrError ? "QR kod yaratilmadi." : "Bosma taklifnomaga yoki ekranga qo‘ying — kamera bilan ochiladi."}</p>
          {qr && (
            <a className="p-btn p-btn--sm" style={{ marginTop: 8 }} href={qr} download={`taklifnoma-${slug}-qr.png`}>
              Yuklab olish
            </a>
          )}
        </div>
      </div>
      <p className="p-hint">
        Har bir mehmonga ismi bilan murojaat qiladigan shaxsiy havolalar — «Mehmonlar» bo‘limida (keyingi bosqichda qo‘shiladi).
      </p>
    </div>
  );
}
