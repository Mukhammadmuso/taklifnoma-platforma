/**
 * Autentifikatsiya: email orqali kirish havolasi (parolsiz) va Google.
 * - EMAIL_SERVER berilgan bo'lsa havola emailga yuboriladi.
 * - Berilmagan bo'lsa (lokal ishlab chiqish) havola server konsoliga va /kirish/tekshiring sahifasiga chiqadi.
 * - Google tugmasi faqat AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET sozlanganda ko'rinadi.
 */
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import type { Provider } from "next-auth/providers";
import { createTransport } from "nodemailer";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "user" | "admin" } & DefaultSession["user"];
  }
}

export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
export const emailDelivery = Boolean(process.env.EMAIL_SERVER);

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Email serveri yo'q bo'lganda kirish havolasi ekranga chiqadi — faqat dev rejimda yoki sayt
 * shu kompyuterda (localhost) ishlayotganda. Haqiqiy domenda bu hech qachon ishlamaydi.
 */
const g = globalThis as unknown as { __devLoginLink?: { email: string; url: string; at: number } };
function localOnly() {
  if (process.env.NODE_ENV !== "production") return true;
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}
export function devLoginLink() {
  if (!localOnly()) return null;
  return g.__devLoginLink ?? null;
}

const providers: Provider[] = [
  Nodemailer({
    server: process.env.EMAIL_SERVER || "smtp://localhost:25",
    from: process.env.EMAIL_FROM || "Taklifnoma <noreply@localhost>",
    maxAge: 30 * 60,
    async sendVerificationRequest({ identifier, url, provider }) {
      if (!process.env.EMAIL_SERVER) {
        if (!localOnly()) {
          throw new Error("EMAIL_SERVER sozlanmagan — kirish havolasini yuborib bo'lmaydi.");
        }
        g.__devLoginLink = { email: identifier, url, at: Date.now() };
        console.log(`\n[kirish] ${identifier} uchun havola:\n${url}\n`);
        return;
      }
      const transport = createTransport(provider.server);
      const host = new URL(url).host;
      await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: `Taklifnoma: kirish havolasi`,
        text: `Assalomu alaykum!\n\n${host} saytiga kirish uchun havola (30 daqiqa amal qiladi):\n${url}\n\nAgar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.`,
        html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;color:#1d1b19"><p>Assalomu alaykum!</p><p><b>${host}</b> saytiga kirish uchun quyidagi tugmani bosing. Havola 30 daqiqa amal qiladi.</p><p><a href="${url}" style="display:inline-block;padding:12px 22px;background:#0e6b70;color:#fff;border-radius:8px;text-decoration:none">Kirish</a></p><p style="color:#6b6560;font-size:14px">Agar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.</p></div>`,
      });
    },
  }),
];
if (googleEnabled) providers.push(Google({ allowDangerousEmailAccountLinking: true }));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "database" },
  pages: { signIn: "/kirish", verifyRequest: "/kirish/tekshiring", error: "/kirish" },
  trustHost: true,
  events: {
    async createUser({ user }) {
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      const role = (user as { role?: string }).role === "admin" ? "admin" : "user";
      session.user.id = user.id;
      session.user.role = role;
      return session;
    },
  },
});
