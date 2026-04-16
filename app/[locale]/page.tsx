import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

const GROUPS = [
  {
    key: "mlBasics",
    experiments: [
      { slug: "overfitting", ns: "overfitting" },
      { slug: "knn", ns: "knn" },
      { slug: "gradient-descent", ns: "gradientDescent" },
      { slug: "decision-boundary", ns: "decisionBoundary" },
    ],
  },
  {
    key: "neuralData",
    experiments: [
      { slug: "neural-network", ns: "neuralNetwork" },
      { slug: "data-balance", ns: "dataBalance" },
    ],
  },
  {
    key: "llm",
    experiments: [
      { slug: "llm-pipeline", ns: "llmPipeline" },
      { slug: "hallucination", ns: "hallucination" },
    ],
  },
  {
    key: "responsible",
    experiments: [
      { slug: "ai-safety", ns: "aiSafety" },
    ],
  },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const feed = await getTranslations("experiments.feed");

  const groups = await Promise.all(
    GROUPS.map(async (group) => {
      const cards = await Promise.all(
        group.experiments.map(async ({ slug, ns }) => {
          const t = await getTranslations(`experiments.${ns}` as const);
          return {
            slug,
            label: t("label"),
            title: t("title"),
            situation: t("situation"),
          };
        }),
      );
      return {
        key: group.key,
        heading: feed(`groups.${group.key}.heading` as const),
        description: feed(`groups.${group.key}.description` as const),
        cards,
      };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-4xl pt-4">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {feed("heading")}
        </h1>
        <p className="text-muted">{feed("subheading")}</p>
      </header>

      <div className="flex flex-col gap-10">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="font-display text-xl font-bold tracking-tight">
              {group.heading}
            </h2>
            <p className="mb-4 text-sm text-muted">{group.description}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {group.cards.map((card) => (
                <Link
                  key={card.slug}
                  href={`/experiments/${card.slug}`}
                  data-testid={`experiment-card-${card.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-5 transition hover:border-accent/60 hover:bg-surface"
                >
                  <div className="text-[11px] uppercase tracking-widest text-accent">
                    {card.label}
                  </div>
                  <h3 className="font-display text-lg font-bold leading-snug tracking-tight group-hover:text-accent transition">
                    {card.title}
                  </h3>
                  <p className="line-clamp-3 text-sm text-muted">
                    {card.situation}
                  </p>
                  <span className="mt-auto pt-2 text-sm font-semibold text-accent">
                    {feed("enter")} &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
