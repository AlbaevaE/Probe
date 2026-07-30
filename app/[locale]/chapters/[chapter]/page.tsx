import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

// Chapter accents follow the light-page palette of the design exploration:
// coral / teal / gold / plum. The gold band is the only one with dark text.
const CHAPTERS = {
  math: {
    number: "01",
    band: "#E05C4A",
    bandText: "#FFFDF8",
    groups: [
      {
        key: null,
        experiments: [
          { slug: "dice-average", ns: "diceAverage" },
          { slug: "galton-board", ns: "galtonBoard" },
          { slug: "birthday-paradox", ns: "birthdayParadox" },
        ],
      },
    ],
  },
  geometry: {
    number: "02",
    band: "#2A7F8C",
    bandText: "#FFFDF8",
    groups: [
      {
        key: null,
        experiments: [
          { slug: "monte-carlo-pi", ns: "monteCarloPi" },
          { slug: "earth-rope", ns: "earthRope" },
          { slug: "area-scaling", ns: "areaScaling" },
        ],
      },
    ],
  },
  physics: {
    number: "03",
    band: "#F2B134",
    bandText: "#241F1A",
    groups: [
      {
        key: null,
        experiments: [
          { slug: "pendulum", ns: "pendulum" },
          { slug: "projectile-angle", ns: "projectileAngle" },
          { slug: "braking-distance", ns: "brakingDistance" },
        ],
      },
    ],
  },
  ai: {
    number: "04",
    band: "#7B5EA7",
    bandText: "#FFFDF8",
    groups: [
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
          { slug: "prompt-injection", ns: "promptInjection" },
          { slug: "human-in-the-loop", ns: "humanInTheLoop" },
        ],
      },
      {
        key: "aiEngineering",
        experiments: [
          { slug: "temperature", ns: "temperature" },
          { slug: "retrieval", ns: "retrieval" },
          { slug: "tokenizer", ns: "tokenizer" },
        ],
      },
    ],
  },
} as const;

type Chapter = keyof typeof CHAPTERS;

export function generateStaticParams() {
  return Object.keys(CHAPTERS).map((chapter) => ({ chapter }));
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ locale: string; chapter: string }>;
}) {
  const { locale: rawLocale, chapter: rawChapter } = await params;
  const locale = rawLocale as Locale;
  if (!(rawChapter in CHAPTERS)) notFound();
  const chapter = rawChapter as Chapter;
  const config = CHAPTERS[chapter];
  setRequestLocale(locale);

  const landing = await getTranslations("landing");
  const feed = await getTranslations("experiments.feed");

  const title = landing(`chapters.${chapter}.title` as const);
  const description = feed(`groups.${chapter === "ai" ? "ai" : chapter}.description` as const);

  const groups = await Promise.all(
    config.groups.map(async (group) => {
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
        heading: group.key ? feed(`groups.${group.key}.heading` as const) : null,
        description: group.key
          ? feed(`groups.${group.key}.description` as const)
          : null,
        cards,
      };
    }),
  );

  // Sidebar sections: experiments for single-group chapters, groups for AI.
  const sections =
    groups.length === 1
      ? groups[0].cards.map((card, i) => ({
          id: `${config.number.replace(/^0/, "")}.${i + 1}`,
          label: card.title,
          href: `/experiments/${card.slug}`,
        }))
      : groups.map((group, i) => ({
          id: `${config.number.replace(/^0/, "")}.${i + 1}`,
          label: group.heading ?? "",
          href: `#${group.key}`,
        }));

  return (
    <div>
      {/* chapter band */}
      <div style={{ background: config.band, color: config.bandText }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-12 sm:px-10 sm:py-14">
          <div className="font-mono text-[13px] font-semibold uppercase tracking-[2px] opacity-80">
            {landing("chapterLabel")} {config.number}
          </div>
          <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-[17px] leading-normal opacity-90">
            {description}
          </p>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 px-0 lg:grid-cols-[280px_1fr]">
        {/* sidebar */}
        <aside className="hidden flex-col gap-1.5 border-r border-fg/10 px-7 py-9 lg:flex">
          <div className="mb-2 font-mono text-xs uppercase tracking-[1.5px] text-muted">
            {landing("sectionsLabel")}
          </div>
          {sections.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              className="flex items-baseline gap-3 rounded-xl px-4 py-3 text-fg/70 no-underline transition hover:bg-fg/5 hover:text-fg"
            >
              <span className="font-mono text-[13px] font-semibold text-muted">
                {s.id}
              </span>
              <span className="text-[15px] font-medium leading-snug">
                {s.label}
              </span>
            </Link>
          ))}
        </aside>

        {/* content */}
        <div className="flex flex-col gap-10 px-6 py-9 pb-20 sm:px-10">
          {groups.map((group, gi) => (
            <section
              key={group.key ?? "main"}
              id={group.key ?? undefined}
              className="flex flex-col gap-4 scroll-mt-6"
            >
              {group.heading && (
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    <span
                      className="mr-3 font-mono text-base font-semibold"
                      style={{ color: config.band }}
                    >
                      {config.number.replace(/^0/, "")}.{gi + 1}
                    </span>
                    {group.heading}
                  </h2>
                  <p className="text-sm text-muted">{group.description}</p>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                {group.cards.map((card) => (
                  <Link
                    key={card.slug}
                    href={`/experiments/${card.slug}`}
                    data-testid={`experiment-card-${card.slug}`}
                    className="group flex flex-col gap-3 rounded-[22px] border border-fg/10 bg-white p-6 no-underline shadow-[0_1px_3px_rgba(36,31,26,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(36,31,26,.08)]"
                  >
                    <div
                      className="font-mono text-[11px] font-semibold uppercase tracking-[2px]"
                      style={{ color: config.band }}
                    >
                      {card.label}
                    </div>
                    <h3 className="font-display text-[17px] font-bold leading-snug text-fg">
                      {card.title}
                    </h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                      {card.situation}
                    </p>
                    <span
                      className="mt-auto pt-2 text-sm font-semibold"
                      style={{ color: config.band }}
                    >
                      {feed("enter")} &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
