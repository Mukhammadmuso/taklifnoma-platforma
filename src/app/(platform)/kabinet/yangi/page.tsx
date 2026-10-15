import type { Metadata } from "next";
import { QuickStart } from "@/components/platform/QuickStart";
import { EVENT_TYPES, type EventType } from "@/lib/dictionary";
import { defaultDate } from "@/lib/draft";
import { enabledTemplates } from "@/lib/template-settings";

export const metadata: Metadata = { title: "Yangi taklifnoma — Taklifnoma" };

type Search = { dizayn?: string; tur?: string; ism1?: string; ism2?: string; sana?: string; vaqt?: string; davom?: string };

/**
 * Tezkor boshlash: namunadan yoki galereyadan kelgan mijoz shu yerda bitta formani to'ldiradi.
 * Ro'yxatdan o'tish shart emas: «Taklifnomani yaratish» bosilganda yashirin hisob ochiladi.
 */
export default async function NewInvitationPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const list = await enabledTemplates();
  const template = list.find((t) => t.id === sp.dizayn) ?? list[0];
  const def = defaultDate();
  const tur = sp.tur && (EVENT_TYPES as readonly string[]).includes(sp.tur) ? (sp.tur as EventType) : null;
  const str = (v: string | undefined, n: number) => (v ?? "").slice(0, n);

  return (
    <main className="p-main p-narrow" style={{ maxWidth: 560 }}>
      <h1 className="p-h1">Taklifnomangizni boshlaymiz</h1>
      <p className="p-lead">Dizayn, tadbir, ismlar va sana — qolganini keyin bemalol to‘ldirasiz.</p>
      <div className="p-card" style={{ marginTop: 20, padding: 20 }}>
        <QuickStart
          templates={list}
          initial={{
            templateId: template.id,
            eventType: tur,
            name1: str(sp.ism1, 60),
            name2: str(sp.ism2, 60),
            date: /^\d{4}-\d{2}-\d{2}$/.test(sp.sana ?? "") ? sp.sana! : def.date,
            time: /^\d{2}:\d{2}$/.test(sp.vaqt ?? "") ? sp.vaqt! : def.time,
          }}
        />
      </div>
    </main>
  );
}
