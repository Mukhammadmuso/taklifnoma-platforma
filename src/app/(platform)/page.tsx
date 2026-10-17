import type { Metadata } from "next";
import Link from "next/link";
import { EVENT_LABELS } from "@/lib/dictionary";
import { enabledTemplates } from "@/lib/template-settings";
import { LiveDemo } from "@/components/platform/LiveDemo";
import s from "./home.module.css";

export const metadata: Metadata = {
  title: "Taklifnoma — raqamli taklifnomani o‘zingiz yarating",
  description: "To‘y, fotiha, sunnat to‘yi, yubiley va tug‘ilgan kun uchun chiroyli raqamli taklifnoma. Bir necha daqiqada yarating, Telegram orqali yuboring, javoblarni kuzating.",
};

const STEPS = [
  { t: "Dizaynni tanlang", d: "Namunani ochib ko‘ring, yoqqanida «Shu dizaynda yaratish»ni bosing." },
  { t: "Ismlar va sanani yozing", d: "Manzil, kun tartibi, musiqa — yonida telefondagi ko‘rinishi darhol yangilanadi." },
  { t: "Havolani yuboring", d: "Har mehmonga o‘z havolasi. Kim ochgani, kim kelishi va necha kishi — kabinetda." },
];

const INSIDE = [
  ["Ochilish lahzasi", "Har dizaynning o‘z ochilishi: muhr sinadi, non ushatiladi, kaptarlar uchadi. Musiqa shu bosishdan boshlanadi."],
  ["Teskari sanoq va taqvim", "Toshkent vaqti bo‘yicha kun, soat, daqiqa. Bir bosishda telefon taqvimiga qo‘shiladi."],
  ["Xarita va manzil", "Google Maps va Yandex Xaritalar tugmalari, manzilni nusxalash."],
  ["Javob formasi", "«Kelaman / kela olmayman», necha kishi va tilaklar. Natijalar faqat sizga ko‘rinadi."],
  ["Lotin va kirill", "Bir marta yozasiz — mehmon o‘zi qulay yozuvni tanlaydi."],
  ["Telegram’da chiroyli", "Havola ulashilganda dizayn, ismlar va sana tushirilgan rasm chiqadi."],
] as const;

const GUESTS = [
  ["Aziza opa", "Keladi · 3", "ok"],
  ["G‘ayrat aka", "Ochdi", "info"],
  ["Karimovlar oilasi", "Keladi · 5", "ok"],
  ["Dilnoza", "Ochmagan", ""],
] as const;

export default async function HomePage() {
  const templates = await enabledTemplates();
  const featured = templates[0];
  const support = process.env.SUPPORT_TELEGRAM?.replace(/^@/, "").replace(/[^A-Za-z0-9_]/g, "");

  return (
    <main className={s.page}>
      {/* ---------- Hero: oltin soat atmosferasi, markazda jonli taklifnoma ---------- */}
      <section className={s.hero}>
        <div className={s.heroText}>
          <h1 className={s.title}>Taklifnomangizni o‘zingiz yarating</h1>
          <p className={s.lead}>
            To‘y, fotiha, yubiley yoki tug‘ilgan kun uchun jonli raqamli taklifnoma — bir necha daqiqada. Havolasini mehmonlarga yuborasiz, javoblarni shu yerda kuzatasiz.
          </p>
          <div className={s.ctaRow}>
            <Link href="/kabinet/yangi" className="p-btn p-btn--primary animate-flip">
              Boshlash — bepul
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <a href="#dizaynlar" className="p-btn p-btn--ghost animate-flip">
              Dizaynlarni ko’rish
            </a>
          </div>
        </div>

        <figure className={s.stage}>
          {/* Mahsulot lavhalari jonli taklifnoma ustida suzadi — kabinetda nima ko'rinishini ko'rsatadi */}
          <div className={`${s.float} ${s.floatLeft}`} aria-hidden>
            <div className={s.floatRow}>
              <span className={s.avatar}>AO</span>
              <div>
                <p className={s.floatName}>Aziza opa</p>
                <p className={s.floatMuted}>taklifnomani ochdi · hozirgina</p>
              </div>
            </div>
            <p className={s.floatBadge}>Keladi · 3 kishi</p>
          </div>

          <LiveDemo
            className={s.phone}
            src={`/namuna/${featured.id}?mehmon=${encodeURIComponent("Aziza opa")}&ichki=1`}
            poster={featured.previewImage}
            title={`${featured.name} dizayni — jonli namuna`}
          />

          <div className={`${s.float} ${s.floatRight}`} aria-hidden>
            <p className={s.floatMuted}>Javoblar</p>
            <p className={s.floatNum}>48</p>
            <p className={s.floatMuted}>kishi keladi</p>
            <div className={s.floatBars}>
              <span style={{ width: "82%" }} />
              <span style={{ width: "14%" }} />
            </div>
          </div>
          <figcaption className={s.caption}>Bu haqiqiy taklifnoma — bosib, ochib ko‘ring.</figcaption>
        </figure>
      </section>

      {/* ---------- Qanday ishlaydi ---------- */}
      <section className={s.section} aria-labelledby="qanday">
        <h2 id="qanday" className={s.h2}>
          Uch qadamda tayyor
        </h2>
        <ol className={s.steps}>
          {STEPS.map((st, i) => (
            <li key={st.t}>
              <span className={s.stepNum} aria-hidden>
                {i + 1}
              </span>
              <p className={s.stepTitle}>{st.t}</p>
              <p className={s.stepText}>{st.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Dizaynlar ---------- */}
      <section className={s.section} id="dizaynlar" aria-labelledby="diz-title">
        <div className={s.sectionHead}>
          <h2 id="diz-title" className={s.h2}>
            Dizaynlar
          </h2>
          <p className={s.sectionLead}>Har birining o‘z ochilishi, o‘z ranglari va bezaklari. Barcha grafika qo‘lda chizilgan, yangilari muntazam qo‘shiladi.</p>
        </div>
        <ul className={s.gallery}>
          {templates.map((t) => (
            <li key={t.id} className={s.card}>
              <a href={`/namuna/${t.id}`} className={s.cardImg} style={{ background: t.palette.ground }} tabIndex={-1} aria-hidden>
                <img src={t.previewImage} alt="" width={300} height={400} loading="lazy" decoding="async" />
              </a>
              <div className={s.cardBody}>
                <h3 className={s.cardName}>{t.name}</h3>
                <p className={s.cardTypes}>{t.supportedEventTypes.map((e) => EVENT_LABELS[e]).join(" · ")}</p>
                <p className={s.cardDesc}>{t.description}</p>
                <div className={s.cardActions}>
                  <Link className="p-btn p-btn--sm p-btn--lilac animate-flip" href={`/kabinet/yangi?dizayn=${t.id}`}>
                    Shuni tanlash
                  </Link>
                  <a className={`${s.more} animate-flip`} href={`/namuna/${t.id}`}>
                    Namunani ko’rish →
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- To'q band: mehmonlar ---------- */}
      <section className={s.lagoon} aria-labelledby="mehmon-title">
        <div className={s.lagoonInner}>
          <div className={s.collage} aria-hidden>
            <span className={`${s.sheet} ${s.sheetA}`} />
            <span className={`${s.sheet} ${s.sheetB}`} />
            <span className={`${s.sheet} ${s.sheetC}`} />
            <div className={s.guestCard}>
              {GUESTS.map(([n, st, k]) => (
                <p key={n} className={s.guestRow}>
                  <span>{n}</span>
                  <span className={`${s.guestBadge} ${k ? s[`badge_${k}`] : ""}`}>{st}</span>
                </p>
              ))}
            </div>
          </div>
          <div className={s.lagoonText}>
            <h2 id="mehmon-title" className={s.lagoonTitle}>
              Har bir mehmonga — o‘z havolasi
            </h2>
            <p className={s.lagoonLead}>
              Ro‘yxatni bir marta joylaysiz. Har kimning taklifnomasi «Hurmatli Aziza opa» deb ochiladi, Telegram yoki WhatsApp’ga bir bosishda yuboriladi. Kim ochgani, kim kelishi va necha kishi ekani kabinetda ko‘rinadi, ro‘yxatni Excel’ga yuklab olasiz.
            </p>
            <Link href="/kabinet/yangi" className={`${s.outlineBtn} animate-flip`}>
              Taklifnoma yaratish
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Ichida nimalar bor ---------- */}
      <section className={s.section} aria-labelledby="ichida">
        <h2 id="ichida" className={s.h2}>
          Taklifnomada nimalar bor
        </h2>
        <dl className={s.inside}>
          {INSIDE.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- Narx: atmosfera band ---------- */}
      <section className={s.glow} aria-labelledby="narx">
        <div className={s.glowInner}>
          <div>
            <h2 id="narx" className={s.h2}>
              Yaratish bepul
            </h2>
            <p className={s.sectionLead}>
              Taklifnoma yaratish, tahrirlash va mehmonlarga yuborish — bepul. E’lon qilingan sahifada kichik «Namuna» belgisi turadi; uni olib tashlash narxi tez orada e’lon qilinadi.
            </p>
          </div>
          <Link href="/kabinet/yangi" className={`${s.whiteBtn} animate-flip`}>
            Boshlash
          </Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <p className={s.footerName}>Taklifnoma</p>
            <p className={s.footerMuted}>Raqamli taklifnomalar — Toshkent vaqti bilan, o‘zbek tilida, lotin va kirillda.</p>
          </div>
          <nav aria-label="Dizaynlar">
            <p className={s.footerHead}>Dizaynlar</p>
            {templates.map((t) => (
              <a key={t.id} href={`/namuna/${t.id}`}>
                {t.name}
              </a>
            ))}
          </nav>
          <nav aria-label="Platforma">
            <p className={s.footerHead}>Platforma</p>
            <Link href="/kabinet/yangi">Taklifnoma yaratish</Link>
            <Link href="/kabinet">Taklifnomalarim</Link>
          </nav>
          {support && (
            <nav aria-label="Yordam">
              <p className={s.footerHead}>Yordam</p>
              <a href={`https://t.me/${support}`} target="_blank" rel="noopener noreferrer">
                Telegram: @{support}
              </a>
            </nav>
          )}
        </div>
        <p className={s.copy}>© {new Date().getFullYear()} Taklifnoma</p>
      </footer>
    </main>
  );
}
