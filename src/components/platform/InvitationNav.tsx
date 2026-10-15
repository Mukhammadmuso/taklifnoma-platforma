import Link from "next/link";

type Tab = "edit" | "guests" | "replies";

/** Bitta taklifnoma ichidagi bo'limlar: tahrirlash, mehmonlar, javoblar */
export function InvitationNav({ id, active, guests, replies }: { id: string; active: Tab; guests?: number; replies?: number }) {
  const tabs: { key: Tab; href: string; label: string; count?: number }[] = [
    { key: "edit", href: `/kabinet/t/${id}`, label: "Tahrirlash" },
    { key: "guests", href: `/kabinet/t/${id}/mehmonlar`, label: "Mehmonlar", count: guests },
    { key: "replies", href: `/kabinet/t/${id}/javoblar`, label: "Javoblar", count: replies },
  ];
  return (
    <nav className="p-tabs" aria-label="Taklifnoma bo‘limlari">
      {tabs.map((t) => (
        <Link key={t.key} href={t.href} className="p-tab" aria-current={t.key === active ? "page" : undefined}>
          {t.label}
          {typeof t.count === "number" && <span className="p-tab__count">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
