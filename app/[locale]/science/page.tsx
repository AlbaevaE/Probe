import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

// The combined science feed was replaced by per-chapter pages
// (/chapters/math, /chapters/geometry, /chapters/physics); old links land
// on the chapter menu.
export default async function SciencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  redirect({ href: "/", locale });
}
