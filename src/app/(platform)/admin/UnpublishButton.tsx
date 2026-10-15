"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/platform/ConfirmButton";
import { adminUnpublish } from "./actions";

export function UnpublishButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="E’londan olish"
      ariaLabel={`${title} — e’londan olish`}
      title="E’londan olinsinmi?"
      text={`«${title}» havolasi ishlamay qoladi. Ma’lumotlar o‘chmaydi — egasi kabinetdan qayta e’lon qilishi mumkin.`}
      confirmLabel="Ha, e’londan olish"
      onConfirm={async () => {
        const res = await adminUnpublish(id);
        if (!res.ok) return res.error;
        router.refresh();
        return null;
      }}
    />
  );
}
