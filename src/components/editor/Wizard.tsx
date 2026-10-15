"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { checkSlug, publishInvitation, saveDraft, setSlug, unpublishInvitation } from "@/app/(platform)/kabinet/actions";
import { draftToView, findIssues, isTempSlug, slugify, slugProblem, type Draft } from "@/lib/draft";
import type { TemplateMeta } from "@/templates/contract";
import { PhonePreview, type PreviewHandle } from "./PhonePreview";
import { SharePanel } from "./SharePanel";
import { InvitationNav } from "@/components/platform/InvitationNav";
import { StepBasics, StepEvent, StepMedia, StepProgram, StepReply, StepTemplate, StepVenue } from "./steps";
import s from "./editor.module.css";

const STEPS = [
  { title: "Tadbir", lead: "Qanday tadbirga taklif qilyapsiz?" },
  { title: "Dizayn", lead: "Taklifnoma ko‘rinishini tanlang. O‘ngda darhol ko‘rasiz." },
  { title: "Asosiy", lead: "Ismlar, sana va taklif matni." },
  { title: "Dastur", lead: "Kun tartibi va mehmonlar bilishi kerak bo‘lgan narsalar." },
  { title: "Manzil", lead: "Mehmonlar qayerga kelishi kerak?" },
  { title: "Rasm va musiqa", lead: "Ixtiyoriy — taklifnomani jonliroq qiladi." },
  { title: "Javob va to‘yona", lead: "Javob formasi, aloqa va sovg‘a uchun ma’lumot." },
  { title: "Havola", lead: "Mehmonlar ochadigan manzilni tanlang." },
  { title: "E’lon qilish", lead: "Tekshiring va mehmonlarga yuboring." },
] as const;

type SaveState = "saved" | "saving" | "dirty" | "error";

/** Har bosqichda telefon ko'rinishi qaysi bo'limni ko'rsatadi */
const STEP_FOCUS = ["hero", "hero", "invite", "program", "venue", "invite", "gift", "hero", "hero"];

export function Wizard({
  id,
  initialDraft,
  initialSlug,
  initialStatus,
  templates,
}: {
  id: string;
  initialDraft: Draft;
  initialSlug: string;
  initialStatus: "draft" | "published";
  templates: TemplateMeta[];
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [slug, setSlugState] = useState(initialSlug);
  const [status, setStatus] = useState(initialStatus);
  const [step, setStep] = useState(() => (initialDraft.name1 ? 2 : 0));
  const [save, setSave] = useState<{ state: SaveState; error?: string }>({ state: "saved" });
  const [mobilePreview, setMobilePreview] = useState(false);
  const preview = useRef<PreviewHandle>(null);
  const mobilePreviewRef = useRef<PreviewHandle>(null);
  const formTop = useRef<HTMLHeadingElement>(null);

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSave({ state: "dirty" });
  }, []);

  /* ---------- Avto-saqlash ---------- */
  const latest = useRef(draft);
  latest.current = draft;
  const saving = useRef(false);

  const flush = useCallback(async () => {
    if (saving.current) return;
    saving.current = true;
    setSave({ state: "saving" });
    const snapshot = latest.current;
    const res = await saveDraft(id, snapshot).catch(() => ({ ok: false as const, error: "Internet bilan aloqa yo‘q. O‘zgarishlar saqlanmadi." }));
    saving.current = false;
    if (!res.ok) setSave({ state: "error", error: res.error });
    else setSave({ state: latest.current === snapshot ? "saved" : "dirty" });
  }, [id]);

  useEffect(() => {
    if (save.state !== "dirty") return;
    const t = setTimeout(flush, 900);
    return () => clearTimeout(t);
  }, [draft, save.state, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save.state === "dirty" || save.state === "saving" || save.state === "error") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save.state]);

  /* ---------- Ko'rinish ---------- */
  const placeholder = useMemo(
    () => (draft.scriptMode === "cyr" ? { name1: "Исм", name2: "Исм" } : { name1: "Ism", name2: "Ism" }),
    [draft.scriptMode],
  );
  const view = useMemo(() => draftToView(draft, slug, placeholder), [draft, slug, placeholder]);
  const issues = useMemo(() => findIssues(draft, slug), [draft, slug]);
  const issueSteps = new Set(issues.map((i) => i.step));

  const go = (n: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
    requestAnimationFrame(() => formTop.current?.focus({ preventScroll: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const title = [draft.name1, draft.name2].filter(Boolean).join(" & ") || "Yangi taklifnoma";

  // Yon ustundagi jonli ko'rinish faqat keng ekranda ulanadi: telefonda yashirin iframe ham butun taklifnomani yuklab, protsessorni band qilardi
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 980px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className={s.shell}>
      <div className={s.formCol}>
        <div className={s.topline}>
          <Link href="/kabinet" className={s.back}>
            ← Taklifnomalarim
          </Link>
          <span className={s.save} data-state={save.state} role="status" aria-live="polite">
            <span className={s.dot} aria-hidden />
            {save.state === "saved" && "Saqlandi"}
            {save.state === "saving" && "Saqlanmoqda…"}
            {save.state === "dirty" && "O‘zgarishlar bor"}
            {save.state === "error" && (
              <>
                {save.error}{" "}
                <button type="button" className="p-btn p-btn--sm p-btn--ghost" onClick={flush}>
                  Qayta urinish
                </button>
              </>
            )}
          </span>
        </div>

        <InvitationNav id={id} active="edit" />

        <ol className={s.steps} aria-label="Bosqichlar">
          {STEPS.map((st, i) => (
            <li key={st.title}>
              <button
                type="button"
                className={s.stepBtn}
                aria-current={i === step ? "step" : undefined}
                data-issue={issueSteps.has(i) && i < step ? true : undefined}
                onClick={() => go(i)}
              >
                <span className={s.stepNum}>{i + 1}</span>
                {st.title}
              </button>
            </li>
          ))}
        </ol>

        <section className={`p-card ${s.panel}`} aria-labelledby="step-title">
          <h1 id="step-title" className={s.panelTitle} tabIndex={-1} ref={formTop}>
            {STEPS[step].title}
          </h1>
          <p className={s.panelLead}>{STEPS[step].lead}</p>

          {step === 0 && <StepEvent draft={draft} update={update} />}
          {step === 1 && <StepTemplate draft={draft} update={update} templates={templates} />}
          {step === 2 && <StepBasics draft={draft} update={update} />}
          {step === 3 && <StepProgram draft={draft} update={update} />}
          {step === 4 && <StepVenue draft={draft} update={update} />}
          {step === 5 && <StepMedia draft={draft} update={update} />}
          {step === 6 && <StepReply draft={draft} update={update} />}
          {step === 7 && <StepSlug id={id} draft={draft} slug={slug} status={status} onSaved={setSlugState} />}
          {step === 8 && (
            <StepPublish
              id={id}
              slug={slug}
              status={status}
              title={title}
              issues={issues}
              unsaved={save.state !== "saved"}
              flush={flush}
              goTo={go}
              onStatus={setStatus}
            />
          )}

          <div className={s.nav}>
            <button type="button" className="p-btn p-btn--ghost" onClick={() => go(step - 1)} disabled={step === 0}>
              ← Orqaga
            </button>
            {step < STEPS.length - 1 && (
              <button type="button" className="p-btn p-btn--primary" onClick={() => go(step + 1)}>
                Keyingi →
              </button>
            )}
          </div>
        </section>
      </div>

      <aside className={s.previewCol} aria-label="Telefondagi ko‘rinishi">
        <div className={s.phone}>
          {wide && <PhonePreview ref={preview} view={view} focus={step === 6 && !draft.giftText ? "rsvp" : STEP_FOCUS[step]} />}
        </div>
        <div className={s.previewTools}>
          <button type="button" className="p-btn p-btn--sm p-btn--ghost" onClick={() => preview.current?.replay()}>
            Ochilishni ko‘rish
          </button>
          {templates.find((t) => t.id === draft.templateId) && (
            <a className="p-btn p-btn--sm p-btn--ghost" href={`/namuna/${draft.templateId}?tur=${draft.eventType}`} target="_blank" rel="noopener">
              Namunani ochish
            </a>
          )}
        </div>
      </aside>

      <div className={s.mobileBar}>
        <button type="button" className="p-btn" onClick={() => setMobilePreview(true)}>
          Ko‘rish
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="p-btn p-btn--primary" onClick={() => go(step + 1)}>
            Keyingi →
          </button>
        ) : (
          <button type="button" className="p-btn p-btn--ghost" onClick={() => go(step - 1)}>
            ← Orqaga
          </button>
        )}
      </div>

      {mobilePreview && (
        <div className={s.sheet} role="dialog" aria-modal="true" aria-label="Telefondagi ko‘rinishi">
          <div className={s.sheetBar}>
            <button type="button" className="p-btn p-btn--sm" style={{ color: "#fff" }} onClick={() => mobilePreviewRef.current?.replay()}>
              Ochilishni ko‘rish
            </button>
            <button type="button" className="p-btn p-btn--sm" style={{ color: "#fff" }} onClick={() => setMobilePreview(false)} autoFocus>
              Yopish ✕
            </button>
          </div>
          <PhonePreview ref={mobilePreviewRef} view={view} focus={STEP_FOCUS[step]} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Havola                                                            */
/* ------------------------------------------------------------------ */

function StepSlug({
  id,
  draft,
  slug,
  status,
  onSaved,
}: {
  id: string;
  draft: Draft;
  slug: string;
  status: "draft" | "published";
  onSaved: (slug: string) => void;
}) {
  const fid = useId();
  const [value, setValue] = useState(isTempSlug(slug) ? "" : slug);
  const [check, setCheck] = useState<{ state: "idle" | "checking" | "ok" | "bad"; message?: string }>({ state: "idle" });
  const [pending, start] = useTransition();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const year = draft.date.slice(0, 4);
  const suggestions = Array.from(
    new Set(
      [slugify(draft.name1, draft.name2), slugify(draft.name1, draft.name2, year), slugify(draft.name1, draft.name2, "toy")].filter(
        (x) => x && !slugProblem(x),
      ),
    ),
  );

  useEffect(() => {
    if (!value || value === slug) {
      setCheck({ state: "idle" });
      return;
    }
    const local = slugProblem(value);
    if (local) {
      setCheck({ state: "bad", message: local });
      return;
    }
    setCheck({ state: "checking" });
    const t = setTimeout(async () => {
      const res = await checkSlug(id, value).catch(() => ({ ok: false as const, error: "Tekshirib bo‘lmadi — internetni tekshiring." }));
      setCheck(res.ok ? { state: "ok", message: "Bo‘sh — band qilish mumkin." } : { state: "bad", message: res.error });
    }, 450);
    return () => clearTimeout(t);
  }, [value, id, slug]);

  const submit = () =>
    start(async () => {
      setSavedMsg(null);
      const res = await setSlug(id, value);
      if (!res.ok) setCheck({ state: "bad", message: res.error });
      else {
        onSaved(res.slug);
        setCheck({ state: "idle" });
        setSavedMsg("Havola saqlandi.");
      }
    });

  return (
    <>
      {status === "published" && !isTempSlug(slug) && (
        <p className="p-alert p-alert--warn" style={{ marginBottom: 16 }}>
          Taklifnoma allaqachon e’lon qilingan. Havolani o‘zgartirsangiz, eski havola ishlamay qoladi — mehmonlarga yangisini yuborishingiz kerak bo‘ladi.
        </p>
      )}
      <div className="p-field">
        <label className="p-label" htmlFor={`${fid}-slug`}>
          Havola
        </label>
        <div className={s.slugBox}>
          <span className={s.slugPrefix}>…/i/</span>
          <input
            id={`${fid}-slug`}
            value={value}
            maxLength={48}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="bekzod-sevinch"
            aria-invalid={check.state === "bad" || undefined}
            aria-describedby={`${fid}-msg`}
            onChange={(e) => setValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          />
        </div>
        <p
          id={`${fid}-msg`}
          className={check.state === "bad" ? "p-error" : "p-hint"}
          style={check.state === "ok" ? { color: "var(--p-ok)" } : undefined}
          role={check.state === "bad" ? "alert" : undefined}
        >
          {check.state === "checking" && "Tekshirilmoqda…"}
          {(check.state === "ok" || check.state === "bad") && check.message}
          {check.state === "idle" && (savedMsg ?? "Faqat kichik lotin harflari, raqam va tire. Masalan: bekzod-sevinch-2027")}
        </p>
      </div>
      {suggestions.length > 0 && (
        <div className={s.chips} style={{ marginTop: 12 }} aria-label="Takliflar">
          {suggestions.map((sg) => (
            <button key={sg} type="button" className={s.chip} onClick={() => setValue(sg)}>
              {sg}
            </button>
          ))}
        </div>
      )}
      <button type="button" className="p-btn p-btn--primary" style={{ marginTop: 18 }} disabled={check.state !== "ok" || pending} onClick={submit}>
        {pending ? "Saqlanmoqda…" : "Havolani band qilish"}
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 9. E'lon qilish                                                      */
/* ------------------------------------------------------------------ */

function StepPublish({
  id,
  slug,
  status,
  title,
  issues,
  unsaved,
  flush,
  goTo,
  onStatus,
}: {
  id: string;
  slug: string;
  status: "draft" | "published";
  title: string;
  issues: ReturnType<typeof findIssues>;
  unsaved: boolean;
  flush: () => Promise<void>;
  goTo: (n: number) => void;
  onStatus: (s: "draft" | "published") => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const publish = () =>
    start(async () => {
      setError(null);
      if (unsaved) await flush();
      const res = await publishInvitation(id).catch(() => ({ ok: false as const, error: "Internet bilan aloqa yo‘q. Qayta urinib ko‘ring." }));
      if (!res.ok) setError(res.error);
      else onStatus("published");
    });

  const unpublish = () =>
    start(async () => {
      const res = await unpublishInvitation(id).catch(() => ({ ok: false as const, error: "Bajarilmadi." }));
      if (!res.ok) setError(res.error);
      else onStatus("draft");
    });

  if (status === "published") {
    return (
      <>
        <p className="p-alert p-alert--ok" style={{ marginBottom: 18 }}>
          Taklifnoma e’lon qilindi! Havolani mehmonlarga yuboring. Keyingi o‘zgarishlar avtomatik saqlanadi va sahifada darhol ko‘rinadi.
        </p>
        <SharePanel slug={slug} title={title} />
        <div className="p-card" style={{ marginTop: 18, padding: 16 }}>
          <p className="p-label">Har bir mehmonga shaxsiy havola</p>
          <p className="p-hint" style={{ marginTop: 4 }}>
            Ro‘yxatni bir marta joylang — har kimga «Hurmatli …» deb ochiladigan alohida havola tayyor bo‘ladi, kim ochgani va kim javob bergani ko‘rinadi.
          </p>
          <div className="p-row" style={{ marginTop: 12 }}>
            <Link href={`/kabinet/t/${id}/mehmonlar`} className="p-btn p-btn--primary">
              Mehmonlar ro‘yxatini tuzish
            </Link>
            <Link href={`/kabinet/t/${id}/javoblar`} className="p-btn p-btn--ghost">
              Javoblarni ko‘rish
            </Link>
            <Link href={`/kabinet/t/${id}/tolov`} className="p-btn p-btn--ghost">
              «Namuna» belgisi haqida
            </Link>
          </div>
        </div>
        {error && <p className="p-alert p-alert--error" style={{ marginTop: 14 }}>{error}</p>}
        <button type="button" className="p-btn p-btn--ghost p-btn--danger" style={{ marginTop: 20 }} disabled={pending} onClick={unpublish}>
          E’londan olish (havola vaqtincha ishlamaydi)
        </button>
      </>
    );
  }

  return (
    <>
      {issues.length > 0 ? (
        <>
          <p className="p-label" style={{ marginBottom: 10 }}>
            E’lon qilishdan oldin to‘ldiring:
          </p>
          <ul className={s.issues}>
            {issues.map((i, k) => (
              <li key={k}>
                <button type="button" onClick={() => goTo(i.step)}>
                  <span>{i.message}</span>
                  <span aria-hidden>Tuzatish →</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="p-alert p-alert--info" style={{ marginBottom: 18 }}>
          Hammasi tayyor. O‘ngdagi ko‘rinishni yana bir bor tekshiring va e’lon qiling.
        </p>
      )}
      {error && (
        <p className="p-alert p-alert--error" role="alert" style={{ marginBottom: 14 }}>
          {error}
        </p>
      )}
      <button type="button" className="p-btn p-btn--primary p-btn--block" disabled={issues.length > 0 || pending} onClick={publish}>
        {pending ? "E’lon qilinmoqda…" : "E’lon qilish"}
      </button>
      <p className="p-hint" style={{ marginTop: 10 }}>
        E’londan keyin ham istalgan vaqtda tahrirlash mumkin.
      </p>
    </>
  );
}
