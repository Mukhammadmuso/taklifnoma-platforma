"use client";

import { useRef, useState, type ReactNode } from "react";

/** Qaytarib bo'lmaydigan amal oldidan tasdiq so'raydigan tugma */
export function ConfirmButton({
  label,
  title,
  text,
  confirmLabel,
  onConfirm,
  className = "p-btn p-btn--sm p-btn--ghost p-btn--danger",
  ariaLabel,
}: {
  label: ReactNode;
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => Promise<string | null>;
  className?: string;
  ariaLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async () => {
    setBusy(true);
    setError(null);
    const err = await onConfirm().catch(() => "Bajarilmadi. Internetni tekshirib, qayta urinib ko‘ring.");
    setBusy(false);
    if (err) setError(err);
    else dialog.current?.close();
  };
  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={() => (setError(null), dialog.current?.showModal())}>
        {label}
      </button>
      <dialog ref={dialog} className="p-dialog">
        <h2 className="p-h2">{title}</h2>
        <p className="p-lead" style={{ marginTop: 8 }}>
          {text}
        </p>
        {error && (
          <p className="p-alert p-alert--error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
        <div className="p-row" style={{ marginTop: 20, justifyContent: "flex-end" }}>
          <button type="button" className="p-btn" onClick={() => dialog.current?.close()} autoFocus>
            Bekor qilish
          </button>
          <button type="button" className="p-btn p-btn--danger-solid" onClick={run} disabled={busy}>
            {busy ? "Bajarilmoqda…" : confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
