import type { ReactNode } from "react";

type Example = { title: string; body: string };

// Presentational theory block rendered after every experiment: short intro,
// a static visualization, one key-idea callout, and worked examples.
export function TheorySection({
  heading,
  keyIdeaLabel,
  examplesLabel,
  intro,
  keyIdea,
  examples,
  visual,
}: {
  heading: string;
  keyIdeaLabel: string;
  examplesLabel: string;
  intro: string[];
  keyIdea: string;
  examples: Example[];
  visual: ReactNode;
}) {
  return (
    <section className="mt-16 flex flex-col gap-6 border-t border-fg/10 pt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        {heading}
      </h2>

      <div className="flex max-w-2xl flex-col gap-3">
        {intro.map((p, i) => (
          <p key={i} className="leading-relaxed text-fg/85">
            {p}
          </p>
        ))}
      </div>

      <div className="rounded-[22px] border border-fg/10 bg-white p-5 shadow-[0_1px_3px_rgba(36,31,26,.05)]">
        {visual}
      </div>

      <div className="rounded-xl border-l-2 border-done bg-surface/60 px-5 py-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[2px] text-done">
          {keyIdeaLabel}
        </div>
        <p className="mt-1.5 text-[15px] leading-relaxed text-fg/90">{keyIdea}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[2px] text-muted">
          {examplesLabel}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((ex) => (
            <div
              key={ex.title}
              className="rounded-[22px] border border-fg/10 bg-white p-5 shadow-[0_1px_3px_rgba(36,31,26,.05)]"
            >
              <div className="font-display text-[15px] font-bold leading-snug">
                {ex.title}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{ex.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
