import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

const CHAPTERS = [
  { key: "math", color: "#FF7A66", hover: "hover:bg-coral/10" },
  { key: "geometry", color: "#4FC1CE", hover: "hover:bg-sky/10" },
  { key: "physics", color: "#FFC94D", hover: "hover:bg-sun/10" },
  { key: "ai", color: "#A88BE0", hover: "hover:bg-lilac/10" },
] as const;

function ChapterGlyph({ chapter }: { chapter: string }) {
  if (chapter === "math") {
    return (
      <svg width="120" height="50" viewBox="0 0 120 50" aria-hidden>
        <path
          d="M4 28 Q18 2 32 28 T60 28 T88 28 T116 28"
          fill="none"
          stroke="#FF7A66"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="9 7"
          style={{ animation: "pDash 3s linear infinite" }}
        />
      </svg>
    );
  }
  if (chapter === "geometry") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-[34px] w-[34px] rounded-full border-[3.5px] border-sky" />
        <div
          className="h-[30px] w-[30px] bg-sky"
          style={{ animation: "pSpin 14s linear infinite" }}
        />
      </div>
    );
  }
  if (chapter === "physics") {
    return (
      <div className="relative h-[50px] w-[120px]">
        <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-white/20" />
        <div
          className="absolute bottom-[7px] right-10 h-[22px] w-[22px] rounded-full bg-sun"
          style={{ animation: "pBounce 1.4s ease-in-out infinite" }}
        />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {[0, 0.4, 0.8, 1.2, 1.6, 2].map((delay, i) => (
        <div
          key={i}
          className="h-3 w-3 rounded-full bg-lilac"
          style={{ animation: `pPulse 2.2s ease-in-out infinite ${delay}s` }}
        />
      ))}
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("landing");

  const chapters = CHAPTERS.map((c, i) => ({
    ...c,
    number: `0${i + 1}`,
    title: t(`chapters.${c.key}.title` as const),
    topics: t(`chapters.${c.key}.topics` as const),
  }));

  return (
    <div className="bg-night text-cream">
      {/* hero */}
      <div className="relative flex flex-col items-center gap-6 overflow-hidden px-6 py-24 text-center sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" aria-hidden>
          <div className="absolute left-[-150px] top-[-150px] h-[300px] w-[300px] rounded-full border border-dashed border-white/20" />
          <div className="absolute left-[-210px] top-[-210px] h-[420px] w-[420px] rounded-full border border-dashed border-white/10" />
          <div
            className="absolute left-[-13px] top-[-13px] h-[26px] w-[26px] rounded-full bg-coral"
            style={{ animation: "pOrbit 16s linear infinite" }}
          />
          <div
            className="absolute left-[-10px] top-[-10px] h-5 w-5 rounded-[5px] bg-sun"
            style={{ animation: "pOrbit2 24s linear infinite" }}
          />
          <div
            className="absolute left-[-9px] top-[-9px] h-[18px] w-[18px] bg-sky"
            style={{
              clipPath: "polygon(50% 0,100% 100%,0 100%)",
              animation: "pOrbit3 11s linear infinite",
            }}
          />
        </div>

        <div className="relative font-mono text-[13px] font-semibold uppercase tracking-[3px] text-sky">
          {t("kicker")}
        </div>
        <h1 className="relative max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="relative max-w-xl text-lg leading-relaxed text-cream/65">
          {t("subtitle")}
        </p>
        <Link
          href="/chapters/math"
          className="relative mt-2 inline-block rounded-full bg-sun px-8 py-4 font-semibold text-night no-underline transition hover:-translate-y-0.5 hover:bg-coral"
        >
          {t("cta")} &rarr;
        </Link>
      </div>

      {/* chapters */}
      <div className="flex flex-col border-t border-white/10">
        {chapters.map((c) => (
          <Link
            key={c.key}
            href={`/chapters/${c.key}`}
            data-testid={`chapter-${c.key}`}
            className={`grid grid-cols-[72px_1fr] items-center gap-5 border-b border-white/[.08] px-6 py-8 text-cream no-underline transition sm:grid-cols-[120px_1fr_auto] sm:gap-7 sm:px-14 ${c.hover}`}
          >
            <div
              className="font-display text-3xl font-extrabold sm:text-4xl"
              style={{ color: c.color }}
            >
              {c.number}
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-display text-xl font-bold sm:text-2xl">
                {c.title}
              </div>
              <div className="text-sm text-cream/55 sm:text-[14.5px]">
                {c.topics}
              </div>
            </div>
            <div className="hidden sm:block">
              <ChapterGlyph chapter={c.key} />
            </div>
          </Link>
        ))}
      </div>

      {/* footer strip */}
      <div className="flex items-center justify-between px-6 py-6 sm:px-11">
        <div className="font-display text-[15px] font-bold">Probe</div>
        <div className="text-[13px] text-cream/50">{t("footerTagline")}</div>
      </div>
    </div>
  );
}
