import type { Hook } from "@/lib/graph-schema";

export function LessonHook({
  hook,
  label,
}: {
  hook: Hook;
  label: string;
}) {
  return (
    <section className="relative my-6 overflow-hidden rounded-2xl border border-accent/30 bg-accent/5 px-6 py-7 sm:px-8 sm:py-9">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-4 -top-8 select-none font-display text-[14rem] leading-none text-accent/10"
      >
        “
      </div>
      <div className="relative flex flex-col gap-5">
        <div className="text-[11px] uppercase tracking-widest text-accent">
          {label}
        </div>
        <p className="max-w-3xl font-display text-lg leading-relaxed text-fg/90 sm:text-xl">
          {hook.situation}
        </p>
        <p className="max-w-3xl font-display text-2xl font-bold leading-snug tracking-tight text-accent sm:text-3xl">
          {hook.question}
        </p>
      </div>
    </section>
  );
}
