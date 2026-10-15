"use client";

import { useState } from "react";
import { useCopy } from "@/components/invitation/hooks";

/** Ro'yxatdan o'tmagan hisobga boshqa qurilmadan qaytish havolasi */
export function AccessKey({ link }: { link: string }) {
  const [state, copy] = useCopy();
  const [shown, setShown] = useState(false);
  return (
    <section className="p-card" style={{ padding: 20, marginTop: 28 }} aria-labelledby="kalit-title">
      <h2 id="kalit-title" className="p-h2">
        Boshqa qurilmadan ochish
      </h2>
      <p className="p-lead" style={{ marginTop: 6 }}>
        Taklifnomalaringiz shu brauzerda saqlanadi. Boshqa telefon yoki kompyuterdan tahrirlash uchun quyidagi shaxsiy havolani saqlab qo‘ying — uni hech kimga bermang.
      </p>
      <div className="p-row" style={{ marginTop: 14 }}>
        <button type="button" className="p-btn p-btn--lilac" onClick={() => copy(link)}>
          {state === "copied" ? "Nusxalandi" : state === "failed" ? "Nusxalab bo‘lmadi" : "Havolani nusxalash"}
        </button>
        <a className="p-btn p-btn--ghost" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Taklifnomalarimni tahrirlash havolasi (maxfiy)")}`} target="_blank" rel="noopener noreferrer">
          O‘zimga Telegram’da yuborish
        </a>
        <button type="button" className="p-btn p-btn--ghost" onClick={() => setShown((v) => !v)} aria-expanded={shown}>
          {shown ? "Yashirish" : "Ko‘rsatish"}
        </button>
      </div>
      {shown && (
        <p className="p-hint" style={{ marginTop: 10, overflowWrap: "anywhere" }}>
          {link}
        </p>
      )}
    </section>
  );
}
