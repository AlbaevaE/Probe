"use client";

import { Link } from "@/i18n/routing";

type Door = {
  id: string;
  title: string;
  question: string;
};

export function NextDoors({
  doors,
  heading,
  emptyLabel,
}: {
  doors: Door[];
  heading: string;
  emptyLabel: string;
}) {
  if (doors.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-border/80 bg-surface/40 px-5 py-4 text-sm text-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="text-[11px] uppercase tracking-widest text-accent">
        {heading}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {doors.map((d) => (
          <Link
            key={d.id}
            href={`/lessons/${d.id}`}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-5 no-underline transition hover:border-accent/60 hover:bg-surface"
          >
            <p className="font-display text-base leading-snug text-fg/90 group-hover:text-accent">
              {d.question}
            </p>
            <div className="mt-auto flex items-center justify-between text-xs text-muted">
              <span>{d.title}</span>
              <span className="text-accent">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
