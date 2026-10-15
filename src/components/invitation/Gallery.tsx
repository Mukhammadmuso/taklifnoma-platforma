"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SectionProps } from "@/templates/contract";
import { apos } from "./Apos";

/**
 * «Baxtli lahzalar» — rasm galereyasi. Rasm bosilganda to'liq ekranda ochiladi:
 * strelkalar, klaviatura (← → Esc) va barmoq bilan surish ishlaydi.
 */
export function GallerySection({ view, t, decor }: SectionProps) {
  const photos = view.gallery;
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("close", onClose);
    };
  }, [step]);

  if (!photos.length) return null;

  return (
    <section className="inv-section inv-section--gallery" data-section="gallery">
      <h2 className="inv-title">{apos(t.common.galleryTitle)}</h2>
      <ul className="inv-gallery" data-count={Math.min(photos.length, 5)}>
        {photos.map((src, i) => (
          <li key={src}>
            <button type="button" className="inv-gallery__item" onClick={() => open(i)} aria-label={`${t.common.photo} ${i + 1}`}>
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="inv-lightbox"
        aria-label={t.common.galleryTitle}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {index !== null && (
          <>
            <img className="inv-lightbox__img" src={photos[index]} alt={`${t.common.photo} ${index + 1}`} />
            <p className="inv-lightbox__count" aria-live="polite">
              {index + 1} / {photos.length}
            </p>
            <button type="button" className="inv-lightbox__btn inv-lightbox__close" onClick={close} aria-label={t.common.close}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {photos.length > 1 && (
              <>
                <button type="button" className="inv-lightbox__btn inv-lightbox__prev" onClick={() => step(-1)} aria-label={t.common.prev}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" className="inv-lightbox__btn inv-lightbox__next" onClick={() => step(1)} aria-label={t.common.next}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </>
        )}
      </dialog>
      <decor.Divider className="inv-divider" />
    </section>
  );
}
