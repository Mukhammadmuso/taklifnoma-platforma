"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Bosh sahifadagi jonli namuna. Iframe ichida butun taklifnoma (shriftlar, animatsiya, musiqa) ishlaydi —
 * u sahifa yuklanib bo'lgach va ko'rinishga kirgandagina ulanadi, shungacha yengil rasm turadi.
 */
export function LiveDemo({ src, poster, title, className }: { src: string; poster: string; title: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (on) return;
    let visible = false;
    let loaded = document.readyState === "complete";
    const tryStart = () => {
      if (!visible || !loaded) return;
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      if (idle) idle(() => setOn(true));
      else setTimeout(() => setOn(true), 400);
    };
    const onLoad = () => {
      loaded = true;
      tryStart();
    };
    window.addEventListener("load", onLoad, { once: true });
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        tryStart();
      },
      { rootMargin: "200px" },
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, [on]);

  return (
    <div ref={ref} className={className}>
      {on ? (
        <iframe src={src} title={title} />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`${title} — ochish`} style={{ all: "unset", display: "block", width: "100%", height: "100%", cursor: "pointer" }}>
          <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 29, display: "block" }} />
        </button>
      )}
    </div>
  );
}
