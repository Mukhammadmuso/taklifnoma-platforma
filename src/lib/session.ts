import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Joriy foydalanuvchi (yashirin hisob ham), bo'lmasa — ochib beradi */
export async function requireUser(next = "/kabinet") {
  const session = await auth();
  // Ro'yxatdan o'tish yo'q: hisob bo'lmasa /boshlash yashirin hisob ochib, shu sahifaga qaytaradi
  if (!session?.user?.id) redirect(`/boshlash?next=${encodeURIComponent(next)}`);
  return session.user;
}

/** Faqat platforma administratori: /admin/kirish da ADMIN_KEY kiritilgan hisob */
export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/admin/kirish");
  return user;
}
