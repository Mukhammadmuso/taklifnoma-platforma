import type { Metadata } from "next";
import { Preview } from "./Preview";

export const metadata: Metadata = { title: "Oldindan ko‘rish", robots: { index: false } };

export default function PreviewPage() {
  return <Preview />;
}
