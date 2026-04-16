"use client";

import { Link } from "@/i18n/routing";

type Meta = { id: string; title: string };

export function MissingPrereqsBanner({
  missing,
  label,
}: {
  missing: Meta[];
  label: string;
}) {
  if (missing.length === 0) return null;
  return (
    <div className="my-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-dashed border-border/80 bg-surface/60 px-4 py-2.5 text-xs text-muted">
      <span className="uppercase tracking-widest text-accent/80">
        {label}
      </span>
      {missing.map((m, i) => (
        <span key={m.id} className="inline-flex items-center gap-1.5">
          <Link href={`/lessons/${m.id}`} className="text-fg/90 hover:text-accent">
            {m.title}
          </Link>
          {i < missing.length - 1 && <span className="text-muted/60">·</span>}
        </span>
      ))}
    </div>
  );
}
