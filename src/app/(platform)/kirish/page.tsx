import { redirect } from "next/navigation";

/** Email orqali kirish olib tashlandi: eski havolalar kabinetga olib boradi (hisob kerak bo'lsa o'zi ochiladi) */
export default function LoginPage() {
  redirect("/kabinet");
}
