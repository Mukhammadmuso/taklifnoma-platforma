"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteInvitation, duplicateInvitation } from "./actions";

function Submit({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Bajarilmoqda…" : children}
    </button>
  );
}

export function CardActions({ id, title }: { id: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <form action={duplicateInvitation}>
        <input type="hidden" name="id" value={id} />
        <Submit className="p-btn p-btn--sm p-btn--ghost">Nusxa olish</Submit>
      </form>
      <button type="button" className="p-btn p-btn--sm p-btn--ghost p-btn--danger" onClick={() => dialog.current?.showModal()}>
        O‘chirish
      </button>
      <dialog ref={dialog} className="p-dialog" aria-labelledby={`del-${id}`}>
        <h2 id={`del-${id}`} className="p-h2">
          Taklifnoma o‘chirilsinmi?
        </h2>
        <p className="p-lead" style={{ marginTop: 8 }}>
          «{title}» va unga kelgan barcha javoblar butunlay o‘chiriladi. Havola ishlamay qoladi. Buni qaytarib bo‘lmaydi.
        </p>
        <div className="p-row" style={{ marginTop: 20, justifyContent: "flex-end" }}>
          <button type="button" className="p-btn" onClick={() => dialog.current?.close()} autoFocus>
            Bekor qilish
          </button>
          <form action={deleteInvitation} onSubmit={() => setTimeout(() => dialog.current?.close(), 0)}>
            <input type="hidden" name="id" value={id} />
            <Submit className="p-btn p-btn--danger-solid">Ha, o‘chirish</Submit>
          </form>
        </div>
      </dialog>
    </>
  );
}
