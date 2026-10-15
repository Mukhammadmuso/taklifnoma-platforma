import Link from "next/link";
import { auth } from "@/auth";
import { Logo } from "@/components/platform/Logo";
import { sans } from "./fonts";
import "./platform.css";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className={`p ${sans.variable}`}>
      <header className="p-top">
        <Link href="/" className="p-brand">
          <Logo />
          <span className="p-brand__text">Taklifnoma</span>
        </Link>
        <nav aria-label="Asosiy">
          {session?.user?.role === "admin" && <Link href="/admin">Admin</Link>}
          {session?.user && <Link href="/kabinet">Taklifnomalarim</Link>}
          <Link href="/kabinet/yangi" className="p-top__cta">
            {session?.user ? "Yangi taklifnoma" : "Boshlash"}
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
