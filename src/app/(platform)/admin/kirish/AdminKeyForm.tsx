"use client";

import { useActionState } from "react";
import { adminKeyLogin, type AdminKeyState } from "./actions";

export function AdminKeyForm() {
  const [state, action, pending] = useActionState<AdminKeyState, FormData>(adminKeyLogin, {});
  return (
    <form action={action} className="p-card" style={{ padding: 20, marginTop: 20 }}>
      <div className="p-field">
        <label className="p-label" htmlFor="key">
          Admin kaliti
        </label>
        <input id="key" name="key" type="password" className="p-input" autoComplete="off" required aria-invalid={state.error ? true : undefined} />
        <p className="p-hint">.env faylidagi ADMIN_KEY qiymati.</p>
      </div>
      {state.error && (
        <p className="p-alert p-alert--error" role="alert" style={{ marginTop: 12 }}>
          {state.error}
        </p>
      )}
      <button type="submit" className="p-btn p-btn--primary p-btn--block" disabled={pending} style={{ marginTop: 16 }}>
        {pending ? "Tekshirilmoqda…" : "Kirish"}
      </button>
    </form>
  );
}
