import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { TheorySection } from "@/components/TheorySection";
import { TheoryVisual } from "@/components/theory/TheoryVisual";

type ChapterKey = "math" | "geometry" | "physics" | "ai";

// slug → chapter + i18n namespace; must stay in sync with the chapters page.
const META: Record<string, { chapter: ChapterKey; number: string; ns: string }> = {
  "dice-average": { chapter: "math", number: "01", ns: "diceAverage" },
  "galton-board": { chapter: "math", number: "01", ns: "galtonBoard" },
  "birthday-paradox": { chapter: "math", number: "01", ns: "birthdayParadox" },
  "monte-carlo-pi": { chapter: "geometry", number: "02", ns: "monteCarloPi" },
  "earth-rope": { chapter: "geometry", number: "02", ns: "earthRope" },
  "area-scaling": { chapter: "geometry", number: "02", ns: "areaScaling" },
  "pendulum": { chapter: "physics", number: "03", ns: "pendulum" },
  "projectile-angle": { chapter: "physics", number: "03", ns: "projectileAngle" },
  "braking-distance": { chapter: "physics", number: "03", ns: "brakingDistance" },
  "overfitting": { chapter: "ai", number: "04", ns: "overfitting" },
  "knn": { chapter: "ai", number: "04", ns: "knn" },
  "gradient-descent": { chapter: "ai", number: "04", ns: "gradientDescent" },
  "decision-boundary": { chapter: "ai", number: "04", ns: "decisionBoundary" },
  "neural-network": { chapter: "ai", number: "04", ns: "neuralNetwork" },
  "data-balance": { chapter: "ai", number: "04", ns: "dataBalance" },
  "llm-pipeline": { chapter: "ai", number: "04", ns: "llmPipeline" },
  "hallucination": { chapter: "ai", number: "04", ns: "hallucination" },
  "prompt-injection": { chapter: "ai", number: "04", ns: "promptInjection" },
  "human-in-the-loop": { chapter: "ai", number: "04", ns: "humanInTheLoop" },
  "temperature": { chapter: "ai", number: "04", ns: "temperature" },
  "retrieval": { chapter: "ai", number: "04", ns: "retrieval" },
  "tokenizer": { chapter: "ai", number: "04", ns: "tokenizer" },
};

// Wraps every experiment page: back-to-chapter breadcrumb on top, the live
// playground in the middle, the theory section (intro + visual + key idea +
// examples, from experiments.<ns>.theory) below.
export async function ExperimentShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const meta = META[slug];
  const locale = await getLocale();
  const landing = await getTranslations("landing");
  const common = await getTranslations("experiments.theoryCommon");
  const t = await getTranslations(`experiments.${meta.ns}`);

  const intro = t.raw("theory.intro") as string[];
  const keyIdea = t("theory.keyIdea");
  const examples = t.raw("theory.examples") as { title: string; body: string }[];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-8">
      <Link
        href={`/chapters/${meta.chapter}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted no-underline transition-colors hover:text-accent"
      >
        <span aria-hidden>&larr;</span>
        <span>
          {landing("chapterLabel")} {meta.number} ·{" "}
          {landing(`chapters.${meta.chapter}.title` as const)}
        </span>
      </Link>
      <div className="pt-6">{children}</div>
      <TheorySection
        heading={common("heading")}
        keyIdeaLabel={common("keyIdea")}
        examplesLabel={common("examples")}
        intro={intro}
        keyIdea={keyIdea}
        examples={examples}
        visual={<TheoryVisual slug={slug} locale={locale} />}
      />
    </div>
  );
}
