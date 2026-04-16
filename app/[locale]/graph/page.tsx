import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { loadAllLessons } from "@/lib/lessons";
import { graph } from "@/content/graph";
import { LessonGraph } from "@/components/graph/LessonGraph";
import type { Locale } from "@/i18n/routing";

export default async function GraphPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("graph");

  const lessons = await loadAllLessons(locale);
  const nodes = graph.nodes.map((n) => {
    const fm = lessons.get(n.id)?.frontmatter;
    return {
      id: n.id,
      title: fm?.title ?? n.id,
      summary: fm?.summary ?? "",
      prerequisites: fm?.prerequisites ?? [],
      group: n.group ?? fm?.group,
      estimatedMinutes: fm?.estimatedMinutes ?? 10,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted">{t("subheading")}</p>
      </div>
      <LessonGraph nodes={nodes} locale={locale} />
    </div>
  );
}
