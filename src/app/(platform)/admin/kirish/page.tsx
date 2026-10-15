import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { AdminKeyForm } from "./AdminKeyForm";

export const metadata: Metadata = { title: "Admin — Taklifnoma", robots: { index: false } };

export default async function AdminLoginPage() {
  await requireUser("/admin/kirish");
  return (
    <main className="p-main p-narrow">
      <h1 className="p-h1">Admin</h1>
      <p className="p-lead">Admin panelga kirish uchun maxfiy kalitni kiriting. Kalit to‘g‘ri bo‘lsa, shu brauzerdagi hisob admin bo‘ladi.</p>
      <AdminKeyForm />
    </main>
  );
}
