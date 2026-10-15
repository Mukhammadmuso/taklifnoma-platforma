# Hostingga chiqarish (Vercel)

Loyiha Next.js + PostgreSQL + Cloudflare R2 bilan ishlaydi. Quyidagi tartibda bajaring.

## 1. Ma'lumotlar bazasi (Neon)
1. https://neon.tech da ro'yxatdan o'ting, yangi proyekt oching.
2. **Connection string** ni nusxalang (`postgresql://...?sslmode=require`). Bu — `DATABASE_URL`.

## 2. Rasmlar uchun ombor (Cloudflare R2)
1. Cloudflare → R2 → **Create bucket** (masalan `taklifnoma-files`).
2. R2 → **Manage API tokens** → token yarating (Object Read & Write). Quyidagilarni saqlang:
   - Account ID, Access Key ID, Secret Access Key.
3. Bucket'ni umumiy o'qishga ochish shart emas — rasmlar saytning o'zi (`/api/files/...`) orqali beriladi.

## 3. Vercel
1. https://vercel.com → **Add New… → Project** → GitHub'dagi `taklifnoma-platforma` repo'ni tanlang.
2. **Environment Variables** ga quyidagilarni qo'shing (qiymatlarni faqat Vercel'ga yozing, chatga emas):

| Nom | Qiymat |
|---|---|
| `DATABASE_URL` | Neon'dagi connection string |
| `AUTH_SECRET` | `npx auth secret` buyrug'i chiqargan satr |
| `NEXT_PUBLIC_SITE_URL` | Vercel bergan manzil, masalan `https://taklifnoma-platforma.vercel.app` (deploydan keyin to'g'rilang) |
| `ADMIN_KEY` | 16+ belgili tasodifiy satr (admin paneli kaliti) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | 2-qadamdagi qiymatlar |
| `PRICE_UZS`, `SUPPORT_TELEGRAM` | ixtiyoriy |

3. **Deploy** tugmasini bosing. Build `prisma generate && next build` ni ishlatadi.

## 4. Bazani yaratish (bir marta)
Lokal kompyuterda, Neon'ning `DATABASE_URL` bilan:
```bash
DATABASE_URL="postgresql://..." npx prisma db push
```
Keyin (ixtiyoriy) namuna ma'lumot: `DATABASE_URL="..." npm run db:seed`.

## 5. Manzilni to'g'rilash
Birinchi deploydan keyin Vercel bergan haqiqiy manzilni `NEXT_PUBLIC_SITE_URL` ga yozing va **Redeploy** qiling.

## Muhim cheklovlar
- **Rate limit** (so'rovlar chegarasi) xotirada ishlaydi. Vercel'da bir nechta server nusxasi bo'lishi mumkin, shuning uchun chegara to'liq aniq emas. Katta yuklamada Upstash Redis bilan almashtirish kerak.
- **Musiqa fayli** (`public/music/`) Vercel'ga birga yuklanadi. Hajmi katta bo'lsa, uni R2 ga ko'chirish mumkin.
- Domen ulasangiz: Vercel → Domains, va `NEXT_PUBLIC_SITE_URL` ni yangilang.
