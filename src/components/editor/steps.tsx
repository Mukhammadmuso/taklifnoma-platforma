"use client";

import { NAME_LABELS } from "@/lib/names";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { EVENT_LABELS, EVENT_TYPES, getDictionary, type EventType } from "@/lib/dictionary";
import { hasCardNumber, LIMITS, type Draft } from "@/lib/draft";
import { MUSIC_LIBRARY } from "@/lib/music";
import { toScript } from "@/lib/translit";
import { uploadImage } from "@/lib/image-client";
import { GALLERY_MAX } from "@/lib/view";
import { PROGRAM_ICONS } from "@/components/invitation/programIcons";
import type { TemplateMeta } from "@/templates/contract";
import s from "./editor.module.css";

export type StepProps = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
};

/* ------------------------------------------------------------------ */
/* Kichik qismlar                                                       */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  children,
  id,
  optional,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  id: string;
  optional?: boolean;
}) {
  return (
    <div className="p-field">
      <label className="p-label" htmlFor={id}>
        {label} {optional && <small>(ixtiyoriy)</small>}
      </label>
      {children}
      {error ? (
        <p className="p-error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="p-hint">{hint}</p>
      )}
    </div>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const UP = "M12 19V5M6 11l6-6 6 6";
const DOWN = "M12 5v14M6 13l6 6 6-6";
const TRASH = "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13";

/* ------------------------------------------------------------------ */
/* 1. Tadbir turi                                                        */
/* ------------------------------------------------------------------ */

const EVENT_HINTS: Record<EventType, string> = {
  nikoh: "Kelin va kuyov to‘yi",
  fotiha: "Fotiha, non sindirish",
  sunnat: "O‘g‘il to‘yi, bolalar bayrami",
  yubiley: "Yubiley, muborak sana",
  tugilgan_kun: "Tug‘ilgan kun bayrami",
  boshqa: "Ochilish, uchrashuv va boshqalar",
};

export function StepEvent({ draft, update }: StepProps) {
  return (
    <div className="p-options" role="radiogroup" aria-label="Tadbir turi">
      {EVENT_TYPES.map((e) => (
        <button
          key={e}
          type="button"
          role="radio"
          aria-checked={draft.eventType === e}
          className="p-option"
          onClick={() => update({ eventType: e })}
        >
          <strong>{EVENT_LABELS[e]}</strong>
          <span>{EVENT_HINTS[e]}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Dizayn                                                            */
/* ------------------------------------------------------------------ */

export function StepTemplate({ draft, update, templates }: StepProps & { templates: TemplateMeta[] }) {
  const fits = templates.filter((t) => t.supportedEventTypes.includes(draft.eventType));
  const others = templates.filter((t) => !t.supportedEventTypes.includes(draft.eventType));
  const card = (t: TemplateMeta) => (
    <button
      key={t.id}
      type="button"
      role="radio"
      aria-checked={draft.templateId === t.id}
      className={`p-option ${s.tplCard}`}
      onClick={() => update({ templateId: t.id })}
    >
      <span className={s.tplSwatch} style={{ background: t.palette.ground ?? t.palette.bg }} aria-hidden>
        <i style={{ background: t.palette.bg }} />
        <i style={{ background: t.palette.accent }} />
        <i style={{ background: t.palette.accent2 }} />
      </span>
      <strong>{t.name}</strong>
      <span>{t.description}</span>
    </button>
  );
  return (
    <>
      <div className="p-options" role="radiogroup" aria-label="Dizayn" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {fits.map(card)}
      </div>
      {fits.length === 0 && <p className="p-alert p-alert--info">Bu tadbir turi uchun maxsus dizayn hali yo‘q — quyidagilardan birini tanlang.</p>}
      {others.length > 0 && (
        <>
          <p className="p-label" style={{ margin: "22px 0 10px" }}>
            Boshqa dizaynlar
          </p>
          <div className="p-options" role="radiogroup" aria-label="Boshqa dizaynlar" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {others.map(card)}
          </div>
        </>
      )}
      <TemplateOptions draft={draft} update={update} template={templates.find((t) => t.id === draft.templateId)} />
      <p className="p-hint" style={{ marginTop: 14 }}>
        Yangi dizaynlar muntazam qo‘shib boriladi. Dizaynni keyin ham almashtirsa bo‘ladi — ma’lumotlar saqlanib qoladi.
      </p>
    </>
  );
}

/** Tanlangan dizaynning sozlamalari: rang mavzusi va Bismillah */
function TemplateOptions({ draft, update, template }: StepProps & { template?: TemplateMeta }) {
  if (!template || (!template.themes && !template.bismillah)) return null;
  const current = template.themes?.find((th) => th.id === draft.theme)?.id ?? template.themes?.[0]?.id;
  return (
    <div className={s.tplOptions}>
      {template.themes && (
        <>
          <p className="p-label">Rang mavzusi</p>
          <div className={s.themes} role="radiogroup" aria-label="Rang mavzusi">
            {template.themes.map((th) => (
              <button key={th.id} type="button" role="radio" aria-checked={current === th.id} className={s.theme} onClick={() => update({ theme: th.id })}>
                <span className={s.themeSwatch} style={{ background: `linear-gradient(135deg, ${th.swatch[0]} 55%, ${th.swatch[1]} 55%)` }} aria-hidden />
                {th.name}
              </button>
            ))}
          </div>
        </>
      )}
      {template.bismillah && (
        <label className={s.check} style={{ marginTop: 16 }}>
          <input type="checkbox" checked={draft.bismillah} onChange={(e) => update({ bismillah: e.target.checked })} />
          <span>
            Kirish ekranida «Bismillahir rohmanir rohiym» yozuvi
          </span>
        </label>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Asosiy ma'lumotlar                                                 */
/* ------------------------------------------------------------------ */



/** Yozuv almashtirilganda barcha matnlarni yangi yozuvga o'giradi (keyin qo'lda tuzatsa bo'ladi) */
export function convertDraftScript(d: Draft, target: "lat" | "cyr"): Partial<Draft> {
  const c = (t: string) => (t ? toScript(t, target) : t);
  return {
    scriptMode: target,
    name1: c(d.name1),
    name2: c(d.name2),
    subtitle: c(d.subtitle),
    hosts: c(d.hosts),
    parents1: c(d.parents1),
    parents2: c(d.parents2),
    quote: c(d.quote),
    venueName: c(d.venueName),
    venueHall: c(d.venueHall),
    address: c(d.address),
    landmark: c(d.landmark),
    program: d.program.map((p) => ({ ...p, title: c(p.title), description: p.description ? c(p.description) : p.description })),
    notes: d.notes.map(c),
    giftTitle: c(d.giftTitle),
    giftText: c(d.giftText),
  };
}

export function StepBasics({ draft, update }: StepProps) {
  const id = useId();
  const [l1, l2] = NAME_LABELS[draft.eventType];
  const needs2 = draft.eventType === "nikoh" || draft.eventType === "fotiha";
  const t = getDictionary(draft.eventType, draft.scriptMode);
  const names = draft.name2 ? `${draft.name1 || "…"} ${draft.scriptMode === "cyr" ? "ва" : "va"} ${draft.name2}` : draft.name1 || "…";
  const defaultText = t.event.inviteText.replace("{names}", names);
  const custom = draft.subtitle.trim().length > 0;

  return (
    <>
      <div className="p-field">
        <span className="p-label" id={`${id}-script`}>
          Taklifnoma yozuvi
        </span>
        <div className="p-options" role="radiogroup" aria-labelledby={`${id}-script`} style={{ gridTemplateColumns: "1fr 1fr" }}>
          {(["lat", "cyr"] as const).map((sc) => (
            <button
              key={sc}
              type="button"
              role="radio"
              aria-checked={draft.scriptMode === sc}
              className="p-option"
              onClick={() => sc !== draft.scriptMode && update(convertDraftScript(draft, sc))}
            >
              <strong>{sc === "lat" ? "Lotin" : "Кирилл"}</strong>
              <span>{sc === "lat" ? "O‘zbekcha lotin" : "Ўзбекча кирилл"}</span>
            </button>
          ))}
        </div>
        <p className="p-hint">Bir marta yozing — matnlar avtomatik o‘giriladi, kerak bo‘lsa qo‘lda tuzating. Mehmonlar ham sahifada yozuvni almashtira oladi.</p>
      </div>

      <div className="p-grid-2" style={{ marginTop: 18 }}>
        <Field id={`${id}-n1`} label={l1}>
          <input id={`${id}-n1`} className="p-input" value={draft.name1} maxLength={LIMITS.name} autoComplete="off" onChange={(e) => update({ name1: e.target.value })} />
        </Field>
        {l2 && (
          <Field id={`${id}-n2`} label={l2} optional={!needs2}>
            <input id={`${id}-n2`} className="p-input" value={draft.name2} maxLength={LIMITS.name} autoComplete="off" onChange={(e) => update({ name2: e.target.value })} />
          </Field>
        )}
      </div>

      <div className="p-grid-2">
        <Field id={`${id}-date`} label="Sana">
          <input id={`${id}-date`} type="date" className="p-input" value={draft.date} onChange={(e) => update({ date: e.target.value })} />
        </Field>
        <Field id={`${id}-time`} label="Boshlanish vaqti" hint="Toshkent vaqti bilan">
          <input id={`${id}-time`} type="time" className="p-input" value={draft.time} step={300} onChange={(e) => update({ time: e.target.value })} />
        </Field>
      </div>

      <Field
        id={`${id}-text`}
        label="Taklif matni"
        hint={custom ? "O‘z matningiz. Namuna matnga qaytish mumkin." : "Tadbir turiga mos namuna matn — xohlasangiz o‘zgartiring."}
      >
        <textarea
          id={`${id}-text`}
          className="p-textarea"
          rows={5}
          maxLength={LIMITS.subtitle}
          value={custom ? draft.subtitle : defaultText}
          onChange={(e) => update({ subtitle: e.target.value === defaultText ? "" : e.target.value })}
        />
      </Field>
      {custom && (
        <button type="button" className="p-btn p-btn--sm p-btn--ghost" style={{ marginTop: 6 }} onClick={() => update({ subtitle: "" })}>
          Namuna matnga qaytarish
        </button>
      )}

      {needs2 && (
        <div className="p-grid-2" style={{ marginTop: 18 }}>
          <Field id={`${id}-p1`} label="Kuyovning ota-onasi" optional hint="Masalan: Akmal va Dilnoza Karimovlar">
            <input id={`${id}-p1`} className="p-input" value={draft.parents1} maxLength={LIMITS.hosts} onChange={(e) => update({ parents1: e.target.value })} />
          </Field>
          <Field id={`${id}-p2`} label="Kelinning ota-onasi" optional>
            <input id={`${id}-p2`} className="p-input" value={draft.parents2} maxLength={LIMITS.hosts} onChange={(e) => update({ parents2: e.target.value })} />
          </Field>
        </div>
      )}

      <Field id={`${id}-hosts`} label={needs2 ? "Umumiy imzo" : "Imzo (taklif qiluvchi)"} optional hint="Masalan: «Karimovlar va Rahimovlar oilalari». Taklifnoma oxirida ko‘rinadi.">
        <input id={`${id}-hosts`} className="p-input" value={draft.hosts} maxLength={LIMITS.hosts} onChange={(e) => update({ hosts: e.target.value })} />
      </Field>

      <Field id={`${id}-quote`} label="Shior qatori" optional hint="Taklif matnidan keyin kursivda chiqadi. Masalan: «Ikki qalb — bir taqdir».">
        <input id={`${id}-quote`} className="p-input" value={draft.quote} maxLength={120} onChange={(e) => update({ quote: e.target.value })} />
      </Field>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Dastur va «Bilib qo'ying»                                          */
/* ------------------------------------------------------------------ */

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function StepProgram({ draft, update }: StepProps) {
  const id = useId();
  const setItem = (i: number, patch: Partial<Draft["program"][number]>) =>
    update({ program: draft.program.map((p, k) => (k === i ? { ...p, ...patch } : p)) });

  return (
    <>
      <h3 className="p-label" style={{ marginBottom: 10 }}>
        Kun tartibi <small>(ixtiyoriy — bo‘sh qolsa, sahifada ko‘rinmaydi)</small>
      </h3>
      <ol className={s.list}>
        {draft.program.map((p, i) => (
          <li key={i} className={s.listItem}>
            <input
              className="p-input"
              type="time"
              aria-label={`${i + 1}-band vaqti`}
              value={p.time}
              onChange={(e) => setItem(i, { time: e.target.value })}
            />
            <div className={s.listItemFields}>
              <input
                className="p-input"
                placeholder="Nima bo‘ladi? (masalan: Nahor oshi)"
                aria-label={`${i + 1}-band nomi`}
                maxLength={LIMITS.programTitle}
                value={p.title}
                onChange={(e) => setItem(i, { title: e.target.value })}
              />
              <input
                className="p-input"
                placeholder="Izoh (ixtiyoriy)"
                aria-label={`${i + 1}-band izohi`}
                maxLength={LIMITS.programDesc}
                value={p.description ?? ""}
                onChange={(e) => setItem(i, { description: e.target.value })}
              />
              <select className="p-select" aria-label={`${i + 1}-band belgisi`} value={p.icon ?? ""} onChange={(e) => setItem(i, { icon: e.target.value || undefined })}>
                <option value="">Belgisiz</option>
                {Object.entries(PROGRAM_ICONS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={s.itemTools}>
              <button type="button" className={s.iconBtn} aria-label="Yuqoriga" disabled={i === 0} onClick={() => update({ program: move(draft.program, i, -1) })}>
                <Icon d={UP} />
              </button>
              <button type="button" className={s.iconBtn} aria-label="Pastga" disabled={i === draft.program.length - 1} onClick={() => update({ program: move(draft.program, i, 1) })}>
                <Icon d={DOWN} />
              </button>
              <button type="button" className={s.iconBtn} aria-label="O‘chirish" onClick={() => update({ program: draft.program.filter((_, k) => k !== i) })}>
                <Icon d={TRASH} />
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="p-btn"
        disabled={draft.program.length >= LIMITS.programItems}
        onClick={() => {
          const last = draft.program[draft.program.length - 1]?.time;
          update({ program: [...draft.program, { time: last || draft.time, title: "", description: "" }] });
        }}
      >
        + Band qo‘shish
      </button>

      <h3 className="p-label" style={{ margin: "28px 0 10px" }} id={`${id}-notes`}>
        Bilib qo‘ying <small>(dress code, avtoturargoh, bolalar va h.k.)</small>
      </h3>
      <ul className={s.list} aria-labelledby={`${id}-notes`}>
        {draft.notes.map((n, i) => (
          <li key={i} className={`${s.listItem} ${s["listItem--note"]}`}>
            <input
              className="p-input"
              aria-label={`${i + 1}-eslatma`}
              maxLength={LIMITS.note}
              value={n}
              placeholder="Masalan: To‘yxona hovlisida bepul avtoturargoh bor"
              onChange={(e) => update({ notes: draft.notes.map((x, k) => (k === i ? e.target.value : x)) })}
            />
            <button type="button" className={s.iconBtn} aria-label="O‘chirish" onClick={() => update({ notes: draft.notes.filter((_, k) => k !== i) })}>
              <Icon d={TRASH} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="p-btn" disabled={draft.notes.length >= LIMITS.notes} onClick={() => update({ notes: [...draft.notes, ""] })}>
        + Eslatma qo‘shish
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Manzil                                                            */
/* ------------------------------------------------------------------ */

const urlError = (u: string) => (u.trim() && !/^https:\/\/\S+$/i.test(u.trim()) ? "Havola https:// bilan boshlanishi kerak." : null);

export function StepVenue({ draft, update }: StepProps) {
  const id = useId();
  return (
    <>
      <Field id={`${id}-vn`} label="To‘yxona / joy nomi">
        <input id={`${id}-vn`} className="p-input" value={draft.venueName} maxLength={LIMITS.venueName} placeholder="Masalan: Navro‘z to‘yxonasi" onChange={(e) => update({ venueName: e.target.value })} />
      </Field>
      <Field id={`${id}-hall`} label="Zal" optional hint="Masalan: Katta zal">
        <input id={`${id}-hall`} className="p-input" value={draft.venueHall} maxLength={80} onChange={(e) => update({ venueHall: e.target.value })} />
      </Field>
      <Field id={`${id}-addr`} label="Manzil" hint="Shahar, tuman, ko‘cha, uy.">
        <textarea id={`${id}-addr`} className="p-textarea" rows={2} style={{ minHeight: 72 }} maxLength={LIMITS.address} value={draft.address} onChange={(e) => update({ address: e.target.value })} />
      </Field>
      <Field id={`${id}-lm`} label="Mo‘ljal" optional hint="Masalan: Mo‘ljal: Chilonzor metro bekati yonida">
        <input id={`${id}-lm`} className="p-input" value={draft.landmark} maxLength={200} onChange={(e) => update({ landmark: e.target.value })} />
      </Field>
      <Field
        id={`${id}-gm`}
        label="Google Maps havolasi"
        optional
        error={urlError(draft.googleMapsUrl)}
        hint="Google Maps'da joyni toping → «Ulashish» → «Havolani nusxalash»."
      >
        <input id={`${id}-gm`} className="p-input" inputMode="url" value={draft.googleMapsUrl} placeholder="https://maps.app.goo.gl/…" onChange={(e) => update({ googleMapsUrl: e.target.value.trim() })} />
      </Field>
      <Field id={`${id}-ym`} label="Yandex Xaritalar havolasi" optional error={urlError(draft.yandexMapsUrl)} hint="Yandex Xaritalar'da joyni toping → «Ulashish» → havolani nusxalang.">
        <input id={`${id}-ym`} className="p-input" inputMode="url" value={draft.yandexMapsUrl} placeholder="https://yandex.uz/maps/…" onChange={(e) => update({ yandexMapsUrl: e.target.value.trim() })} />
      </Field>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Rasm va musiqa                                                     */
/* ------------------------------------------------------------------ */

function ImageInput({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (url: string) => void }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="p-field">
      <span className="p-label" id={`${id}-l`}>
        {label} <small>(ixtiyoriy)</small>
      </span>
      <div className={s.upload}>
        <div className={s.thumb} style={value ? { backgroundImage: `url(${value})` } : undefined} role="img" aria-label={value ? "Yuklangan rasm" : "Rasm yo‘q"} />
        <div className="p-row">
          <button type="button" className="p-btn" disabled={busy} onClick={() => input.current?.click()} aria-describedby={`${id}-l`}>
            {busy ? "Yuklanmoqda…" : value ? "Almashtirish" : "Rasm tanlash"}
          </button>
          {value && !busy && (
            <button type="button" className="p-btn p-btn--ghost p-btn--danger" onClick={() => onChange("")}>
              Olib tashlash
            </button>
          )}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            onChange(await uploadImage(file));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Rasm yuklanmadi.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {error ? <p className="p-error" role="alert">{error}</p> : <p className="p-hint">{hint}</p>}
    </div>
  );
}

/** «Baxtli lahzalar» galereyasi: bir nechta rasmni birdan yuklash, tartiblash, o'chirish */
function GalleryInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(value);
  latest.current = value;
  const room = GALLERY_MAX - value.length;

  const add = async (files: File[]) => {
    setError(null);
    const list = files.slice(0, room);
    if (files.length > room) setError(`Galereyaga ${GALLERY_MAX} tagacha rasm qo‘shiladi.`);
    let next = [...latest.current];
    for (let i = 0; i < list.length; i++) {
      setBusy(`Yuklanmoqda: ${i + 1} / ${list.length}`);
      try {
        next = [...next, await uploadImage(list[i])];
        onChange(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rasm yuklanmadi.");
      }
    }
    setBusy(null);
  };

  return (
    <div className="p-field" style={{ marginTop: 22 }}>
      <span className="p-label">
        Galereya — «Baxtli lahzalar» <small>(ixtiyoriy, {value.length}/{GALLERY_MAX})</small>
      </span>
      {value.length > 0 && (
        <ul className={s.gallery}>
          {value.map((src, i) => (
            <li key={src}>
              <span className={s.galleryImg} style={{ backgroundImage: `url(${src})` }} role="img" aria-label={`${i + 1}-rasm`} />
              <span className={s.galleryTools}>
                <button type="button" className={s.iconBtn} disabled={i === 0} onClick={() => onChange(move(value, i, -1))} aria-label={`${i + 1}-rasmni oldinga surish`}>
                  <Icon d="M15 18l-6-6 6-6" />
                </button>
                <button type="button" className={s.iconBtn} onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label={`${i + 1}-rasmni olib tashlash`}>
                  <Icon d="M6 6l12 12M18 6L6 18" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="p-row">
        <button type="button" className="p-btn" disabled={!!busy || room <= 0} onClick={() => input.current?.click()}>
          {busy ?? (value.length ? "Yana rasm qo‘shish" : "Rasmlarni tanlash")}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void add(files);
        }}
      />
      {error ? <p className="p-error" role="alert">{error}</p> : <p className="p-hint">Bolaning, oila va to‘y suratlari. Birinchi rasm katta ko‘rinadi. Rasm bosilganda mehmonga to‘liq ekranda ochiladi.</p>}
    </div>
  );
}

export function StepMedia({ draft, update }: StepProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audio.current?.pause(), []);

  const preview = (id: string, src: string) => {
    if (playing === id) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    const a = new Audio(src);
    a.onerror = () => {
      setMissing((m) => new Set(m).add(id));
      setPlaying(null);
    };
    a.onended = () => setPlaying(null);
    a.play().catch(() => setPlaying(null));
    audio.current = a;
    setPlaying(id);
  };

  return (
    <>
      <ImageInput
        label="Asosiy rasm"
        hint="Juftlik yoki bayram egasining surati. Telefonda avtomatik siqiladi (1600px, WebP)."
        value={draft.mainPhotoUrl}
        onChange={(url) => update({ mainPhotoUrl: url })}
      />
      <div style={{ height: 18 }} />
      <ImageInput
        label="To‘yxona rasmi"
        hint="Bo‘lmasa, dizayndagi chizma ko‘rsatiladi."
        value={draft.venuePhotoUrl}
        onChange={(url) => update({ venuePhotoUrl: url })}
      />

      <GalleryInput value={draft.gallery} onChange={(gallery) => update({ gallery })} />

      <h3 className="p-label" style={{ margin: "26px 0 10px" }}>
        Fon musiqasi
      </h3>
      <div className="p-options" role="radiogroup" aria-label="Fon musiqasi" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
        <button type="button" role="radio" aria-checked={!draft.musicId} className="p-option" onClick={() => update({ musicId: "" })}>
          <strong>Musiqasiz</strong>
          <span>Jim sahifa</span>
        </button>
        {MUSIC_LIBRARY.map((m) => (
          <div key={m.id} style={{ position: "relative" }}>
            <button
              type="button"
              role="radio"
              aria-checked={draft.musicId === m.id}
              className="p-option"
              style={{ width: "100%", paddingRight: 56 }}
              onClick={() => update({ musicId: m.id })}
            >
              <strong>{m.title}</strong>
              <span>{missing.has(m.id) ? "Fayl hali qo‘yilmagan" : m.mood}</span>
            </button>
            <button
              type="button"
              className={s.iconBtn}
              style={{ position: "absolute", top: 10, right: 8 }}
              aria-label={playing === m.id ? `${m.title}: to‘xtatish` : `${m.title}: tinglab ko‘rish`}
              onClick={() => preview(m.id, m.src)}
            >
              <Icon d={playing === m.id ? "M8 6v12M16 6v12" : "M8 5l11 7-11 7z"} />
            </button>
          </div>
        ))}
      </div>
      <p className="p-hint" style={{ marginTop: 10 }}>
        Musiqa mehmon taklifnomani ochganda boshlanadi; sahifada doim o‘chirish tugmasi bor.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Javob, to'yona va aloqa                                            */
/* ------------------------------------------------------------------ */

export function StepReply({ draft, update }: StepProps) {
  const id = useId();
  const t = getDictionary(draft.eventType, draft.scriptMode);
  const showCardWarning = hasCardNumber(draft.giftText);
  return (
    <>
      <label className={s.toggle}>
        <span>
          <span className="p-label">Mehmonlardan javob so‘rash</span>
          <span className="p-hint" style={{ display: "block" }}>
            «Kelasizmi?» formasi. Javoblar va jami mehmonlar soni kabinetingizda ko‘rinadi.
          </span>
        </span>
        <input type="checkbox" checked={draft.rsvpEnabled} onChange={(e) => update({ rsvpEnabled: e.target.checked })} />
        <span className={s.switch} aria-hidden />
      </label>

      <div className="p-grid-2" style={{ marginTop: 14 }}>
        <Field id={`${id}-tg`} label="Telegram username" optional hint="Mehmon javobini Telegram'da ham yubora oladi.">
          <input id={`${id}-tg`} className="p-input" value={draft.telegramUsername} placeholder="@username" autoCapitalize="off" onChange={(e) => update({ telegramUsername: e.target.value.trim() })} />
        </Field>
        <Field id={`${id}-ph`} label="Telefon" optional>
          <input id={`${id}-ph`} className="p-input" type="tel" inputMode="tel" value={draft.phone} placeholder="+998 90 123 45 67" onChange={(e) => update({ phone: e.target.value })} />
        </Field>
      </div>

      <h3 className="p-label" style={{ margin: "26px 0 4px" }}>
        {t.event.giftTitle} bo‘limi <small>(ixtiyoriy — bo‘sh qolsa ko‘rinmaydi)</small>
      </h3>
      <Field id={`${id}-gt`} label="Sarlavha" optional>
        <input id={`${id}-gt`} className="p-input" value={draft.giftTitle} maxLength={LIMITS.giftTitle} placeholder={t.event.giftTitle} onChange={(e) => update({ giftTitle: e.target.value })} />
      </Field>
      <Field id={`${id}-gx`} label="Matn">
        <textarea
          id={`${id}-gx`}
          className="p-textarea"
          rows={3}
          maxLength={LIMITS.giftText}
          value={draft.giftText}
          placeholder={t.event.giftText}
          onChange={(e) => update({ giftText: e.target.value })}
        />
      </Field>
      {showCardWarning && (
        <p className="p-alert p-alert--warn" role="status" style={{ marginTop: 12 }}>
          <strong>Diqqat:</strong> matnda karta raqami bor. Taklifnoma havolasini olgan har bir kishi uni ko‘radi va havola
          boshqalarga ham yuborilishi mumkin. Rozi bo‘lsangiz, qoldiring — mehmonlar raqamni bir tugma bilan nusxalay oladi.
        </p>
      )}
    </>
  );
}
