"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { quickStart } from "@/app/(platform)/kabinet/actions";
import { NAME_LABELS } from "@/lib/names";
import { EVENT_LABELS, type EventType } from "@/lib/dictionary";
import type { TemplateMeta } from "@/templates/contract";
import s from "./quickstart.module.css";

export type QuickInitial = {
  templateId: string;
  eventType: EventType | null;
  name1: string;
  name2: string;
  date: string;
  time: string;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="p-btn p-btn--primary p-btn--block animate-flip" disabled={pending} style={{ minHeight: 52, fontSize: 17 }}>
      {pending ? "Tayyorlanmoqda…" : "Taklifnomani yaratish"}
    </button>
  );
}

export function QuickStart({ templates, initial }: { templates: TemplateMeta[]; initial: QuickInitial }) {
  const [templateId, setTemplateId] = useState(initial.templateId);
  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const [eventType, setEventType] = useState<EventType>(
    initial.eventType && template.supportedEventTypes.includes(initial.eventType) ? initial.eventType : template.supportedEventTypes[0],
  );
  const type = template.supportedEventTypes.includes(eventType) ? eventType : template.supportedEventTypes[0];
  const [label1, label2] = NAME_LABELS[type];

  return (
    <form action={quickStart} className={s.form}>
      <input type="hidden" name="templateId" value={template.id} />

      <fieldset className={s.block}>
        <legend className="p-label">Dizayn</legend>
        <div className={s.designs}>
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${s.design} animate-flip`}
              aria-pressed={t.id === template.id}
              onClick={() => setTemplateId(t.id)}
            >
              <img src={t.previewImage} alt="" width={96} height={128} loading="lazy" decoding="async" />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
        <a className={s.look} href={`/namuna/${template.id}?tur=${type}`}>
          «{template.name}» namunasini ko‘rish
        </a>
      </fieldset>

      <fieldset className={s.block}>
        <legend className="p-label">Tadbir</legend>
        <div className="p-options" style={{ marginTop: 8 }}>
          {template.supportedEventTypes.map((e) => (
            <label key={e} className="p-option animate-flip" aria-checked={e === type} style={{ minHeight: 48 }}>
              <input type="radio" name="eventType" value={e} checked={e === type} onChange={() => setEventType(e)} className="p-sr" />
              <strong>{EVENT_LABELS[e]}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={s.block}>
        <div className={label2 ? "p-grid-2" : undefined}>
          <div className="p-field">
            <label className="p-label" htmlFor="q-name1">
              {label1}
            </label>
            <input id="q-name1" name="name1" className="p-input" defaultValue={initial.name1} maxLength={60} autoComplete="off" />
          </div>
          {label2 && (
            <div className="p-field">
              <label className="p-label" htmlFor="q-name2">
                {label2}
              </label>
              <input id="q-name2" name="name2" className="p-input" defaultValue={initial.name2} maxLength={60} autoComplete="off" />
            </div>
          )}
        </div>
        <div className="p-grid-2" style={{ marginTop: 14 }}>
          <div className="p-field">
            <label className="p-label" htmlFor="q-date">
              Sana
            </label>
            <input id="q-date" name="date" type="date" className="p-input" defaultValue={initial.date} required />
          </div>
          <div className="p-field">
            <label className="p-label" htmlFor="q-time">
              Vaqt <small>(Toshkent)</small>
            </label>
            <input id="q-time" name="time" type="time" className="p-input" defaultValue={initial.time} required />
          </div>
        </div>
      </div>

      <Submit />
      <p className="p-hint" style={{ textAlign: "center", marginTop: 10 }}>
        Ro‘yxatdan o‘tish shart emas. Keyin manzil, kun tartibi, musiqa va rasmlarni qo‘shasiz — hammasini istalgan vaqtda o‘zgartirish mumkin.
      </p>
    </form>
  );
}
