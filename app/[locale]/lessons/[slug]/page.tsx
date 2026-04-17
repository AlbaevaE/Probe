import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { loadAllLessons, loadLesson } from "@/lib/lessons";
import { LessonShell } from "@/components/lesson/LessonShell";
import { renderVisual } from "@/components/visuals/registry";
import { mdxComponents } from "@/components/mdx/registry";
import { graph } from "@/content/graph";
import type { Locale } from "@/i18n/routing";

export async function generateStaticParams() {
  const ids = graph.nodes.map((n) => ({ slug: n.id }));
  return ids;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const lesson = await loadLesson(locale, slug);
  if (!lesson) notFound();

  const all = await loadAllLessons(locale);
  const allMeta = graph.nodes.map((n) => {
    const fm = all.get(n.id)?.frontmatter;
    return {
      id: n.id,
      title: fm?.title ?? n.id,
      prerequisites: fm?.prerequisites ?? [],
      hookQuestion: fm?.hook.question ?? "",
    };
  });
  const t = await getTranslations("lesson");

  const visual = renderVisual(lesson.frontmatter.visual);

  return (
    <LessonShell
      frontmatter={lesson.frontmatter}
      allLessons={allMeta}
      visual={visual}
      labels={{
        back: t("back"),
        backList: t("backList"),
        hook: t("hook"),
        concept: t("concept"),
        example: t("example"),
        exercise: t("exercise"),
        quiz: t("quiz"),
        prev: t("prev"),
        nextDoors: t("nextDoors"),
        noNext: t("noNext"),
        prereqHint: t("prereqHint"),
        minutes: t("estimatedMinutes", { m: lesson.frontmatter.estimatedMinutes }),
      }}
    >
      <article className="prose-lesson">
        <MDXRemote
          source={lesson.body}
          components={mdxComponents}
          options={{
            mdxOptions: { remarkPlugins: [remarkGfm] },
            blockJS: false,
          }}
        />
      </article>
    </LessonShell>
  );
}
