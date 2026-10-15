import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { siteUrl } from "./site";

/**
 * RO'YXATDAN O'TMASDAN ISHLASH.
 * Mijoz birinchi marta taklifnoma yaratganda unga yashirin hisob ochiladi va brauzeriga
 * Auth.js bilan bir xil sessiya cookie'si yoziladi — qolgan kod (auth(), egalik tekshiruvi) o'zgarmaydi.
 * Boshqa qurilmadan qaytish uchun hisobning maxfiy kaliti bor: /kalit/{accessKey}.
 */
const SESSION_DAYS = 365;

function secure() {
  return siteUrl().startsWith("https://");
}

/** Auth.js v5 sessiya cookie nomi (https da __Secure- prefiksi bilan) */
export function sessionCookieName() {
  return secure() ? "__Secure-authjs.session-token" : "authjs.session-token";
}

export const newKey = (bytes = 24) => randomBytes(bytes).toString("base64url");

/** Mavjud foydalanuvchi uchun yangi sessiya ochib, cookie'ga yozadi (faqat server action / route handler ichida) */
export async function startSession(userId: string) {
  const sessionToken = newKey(32);
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await prisma.session.create({ data: { sessionToken, userId, expires } });
  const jar = await cookies();
  jar.set(sessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: secure(),
    path: "/",
    expires,
  });
}

/** Yangi yashirin hisob + sessiya */
export async function createAnonymousUser() {
  const user = await prisma.user.create({ data: { accessKey: newKey() } });
  await startSession(user.id);
  return user;
}

/** Hisobning tahrirlash kaliti (eski email hisoblarda bo'lmasa — yaratiladi) */
export async function ensureAccessKey(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { accessKey: true } });
  if (u?.accessKey) return u.accessKey;
  const accessKey = newKey();
  await prisma.user.update({ where: { id: userId }, data: { accessKey } });
  return accessKey;
}
