"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { SectionId, TemplateDefinition, TextView } from "@/templates/contract";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { toScript, type Script } from "@/lib/translit";
import type { InvitationView } from "@/lib/view";
import { useReducedMotion } from "./hooks";
import { IconSoundOff, IconSoundOn } from "./icons";
import { DEFAULT_SECTIONS } from "./sections";
import "./invitation.css";

function convertView(view: InvitationView, script: Script): TextView {
  const c = (s: string | null) => (s ? toScript(s, script) : s);
  return {
    ...view,
    script,
    name1: toScript(view.name1, script),
    name2: c(view.name2),
    subtitle: c(view.subtitle),
    hosts: c(view.hosts),
    parents1: c(view.parents1),
    parents2: c(view.parents2),
    quote: c(view.quote),
    venueHall: c(view.venueHall),
    landmark: c(view.landmark),
    venueName: c(view.venueName),
    address: c(view.address),
    giftTitle: c(view.giftTitle),
    giftText: c(view.giftText),
    program: view.program.map((p) => ({ ...p, title: toScript(p.title, script), description: p.description ? toScript(p.description, script) : undefined })),
    notes: view.notes.map((n) => toScript(n, script)),
    guest: view.guest ? { ...view.guest, name: toScript(view.guest.name, script) } : null,
  };
}

function mergeDictionary(base: Dictionary, template: TemplateDefinition, view: InvitationView, script: Script): Dictionary {
  const over = template.defaultTexts?.[view.eventType];
  const commonOver = { ...template.commonTexts?.all, ...template.commonTexts?.[view.eventType] };
  if (!over && !Object.keys(commonOver).length) return base;
  const event = { ...base.event };
  for (const [k, v] of Object.entries(over ?? {})) {
    if (typeof v === "string") (event as Record<string, string>)[k] = toScript(v, script);
  }
  const common = { ...base.common };
  for (const [k, v] of Object.entries(commonOver)) {
    if (typeof v === "string") (common as Record<string, string>)[k] = toScript(v, script);
  }
  return { ...base, event, common };
}

export function InvitationRenderer({
  template,
  view,
  startOpen = false,
}: {
  template: TemplateDefinition;
  view: InvitationView;
  /** Muharrir ko'rinishi: ochilish ekranisiz to'g'ridan-to'g'ri sahifa */
  startOpen?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [script, setScript] = useState<Script>(view.scriptMode);
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">(startOpen ? "open" : "sealed");
  const [mounted, setMounted] = useState(false);
  const [musicReady, setMusicReady] = useState(!!view.music);
  const [playing, setPlaying] = useState(false);
  const [controlsHidden, setControlsHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tv = useMemo(() => convertView(view, script), [view, script]);
  const t = useMemo(() => mergeDictionary(getDictionary(view.eventType, script), template, view, script), [view, template, script]);

  useEffect(() => setMounted(true), []);

  // Muharrirda yozuv almashtirilsa, ko'rinish ham ergashadi
  useEffect(() => setScript(view.scriptMode), [view.scriptMode]);

  // Ochilish ekrani turganda sahifa aylanmaydi
  useEffect(() => {
    const root = document.documentElement;
    if (phase !== "open") {
      root.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      root.style.overflow = "";
    }
    return () => {
      root.style.overflow = "";
    };
  }, [phase]);

  // Ochilgandan keyin: pastga o'qiyotganda boshqaruv yashirinadi, yuqoriga qaytganda chiqadi
  useEffect(() => {
    if (phase !== "open") return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 160) setControlsHidden(false);
      else if (y > last + 6) setControlsHidden(true);
      else if (y < last - 6) setControlsHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // Musiqa: fayl yuklanmasa pleyer yashiriladi (mehmonga xato ko'rsatilmaydi, egasi uchun konsolda xabar)
  useEffect(() => {
    if (!view.music) return;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.src = view.music.src;
    const onError = () => {
      console.warn(`[taklifnoma] Musiqa fayli topilmadi: ${view.music?.src}. Faylni public/music/ ga qo'ying.`);
      setMusicReady(false);
      setPlaying(false);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("error", onError);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener("error", onError);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [view.music]);

  const playMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch((err: unknown) => {
      // Brauzer ruxsat bermasa — tugma "o'chiq" holatda qoladi, mehmon o'zi yoqadi
      if (err instanceof DOMException && err.name === "NotSupportedError") setMusicReady(false);
    });
  }, []);

  const handleOpen = useCallback(() => {
    setPhase("opening");
    playMusic(); // faqat foydalanuvchi bosgandan keyin
    if (view.guest && !view.isSample) {
      const body = JSON.stringify({ slug: view.slug, token: view.guest.token });
      try {
        if (!navigator.sendBeacon?.("/api/guest/opened", body)) {
          void fetch("/api/guest/opened", { method: "POST", body, keepalive: true }).catch(() => {});
        }
      } catch {
        /* ochildi belgisi ikkinchi darajali — sahifa ishlashiga ta'sir qilmaydi */
      }
    }
  }, [playMusic, view.guest, view.isSample, view.slug]);

  const handleDone = useCallback(() => setPhase("open"), []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) playMusic();
    else audio.pause();
  };

  const style = {
    "--inv-bg": template.palette.bg,
    "--inv-surface": template.palette.surface,
    "--inv-text": template.palette.text,
    "--inv-accent": template.palette.accent,
    "--inv-accent2": template.palette.accent2,
    "--inv-muted": template.palette.muted ?? template.palette.text,
    "--inv-ground": template.palette.ground ?? template.palette.bg,
  } as CSSProperties;

  const sectionProps = { view: tv, t, decor: template.decor, reducedMotion };
  const Opening = template.Opening;
  const Backdrop = template.Backdrop;
  const Defs = template.decor.Defs;
  const Corner = template.decor.Corner;

  const sheet = (
    <main className="inv-sheet" inert={phase !== "open" ? true : undefined}>
      <Corner className="inv-corner inv-corner--tl" />
      <Corner className="inv-corner inv-corner--tr" />
      {template.sectionOrder.map((id: SectionId) => {
        const Section = template.sections?.[id] ?? DEFAULT_SECTIONS[id];
        return <Section key={id} {...sectionProps} />;
      })}
      <Corner className="inv-corner inv-corner--bl" />
      <Corner className="inv-corner inv-corner--br" />
    </main>
  );

  return (
    <div
      className={`inv ${template.rootClassName}`}
      style={style}
      lang={script === "cyr" ? "uz-Cyrl" : "uz-Latn"}
      data-phase={phase}
      data-motion={mounted && !reducedMotion ? "on" : "off"}
      data-controls={controlsHidden ? "hidden" : undefined}
      data-theme={template.themes ? (template.themes.some((th) => th.id === view.theme) ? view.theme : template.themes[0].id) : undefined}
    >
      {Defs && <Defs />}
      {Backdrop ? <Backdrop>{sheet}</Backdrop> : <div className="inv-ground">{sheet}</div>}

      <div className="inv-controls">
        <div className="inv-script" role="group" aria-label="Yozuv / Ёзув">
          <button type="button" aria-pressed={script === "lat"} onClick={() => setScript("lat")}>
            Lotin
          </button>
          <button type="button" aria-pressed={script === "cyr"} onClick={() => setScript("cyr")}>
            Кирилл
          </button>
        </div>
        {view.music && musicReady && phase !== "sealed" && (
          <button
            type="button"
            className="inv-music"
            data-playing={playing || undefined}
            aria-label={playing ? t.common.musicOff : t.common.musicOn}
            aria-pressed={playing}
            onClick={toggleMusic}
          >
            {playing ? <IconSoundOn /> : <IconSoundOff />}
            <span className="inv-music__bars" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </button>
        )}
      </div>

      {phase !== "open" && (
        <div className="inv-opening" data-phase={phase}>
          <Opening view={tv} t={t} reducedMotion={reducedMotion} onOpen={handleOpen} onDone={handleDone} />
        </div>
      )}

      {!view.isPaid && !view.isSample && <div className="inv-sample-badge">{t.common.sample}</div>}
    </div>
  );
}
