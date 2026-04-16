import { setRequestLocale, getTranslations } from "next-intl/server";
import { loadAllLessons } from "@/lib/lessons";
import { graph } from "@/content/graph";
import { LessonsList } from "@/components/lesson/LessonsList";
import type { Locale } from "@/i18n/routing";

export default async function LessonsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("lessons");

  const all = await loadAllLessons(locale);
  const items = graph.nodes.map((n) => {
    const fm = all.get(n.id)?.frontmatter;
    return {
      id: n.id,
      title: fm?.title ?? n.id,
      summary: fm?.summary ?? "",
      group: n.group ?? fm?.group,
      estimatedMinutes: fm?.estimatedMinutes ?? 10,
      prerequisites: fm?.prerequisites ?? [],
    };
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted">{t("subheading")}</p>
      </div>
      <LessonsList items={items} />
    </div>
  );
}
