import type { ReactNode } from "react";

type Pattern = {
  icon?: string;
  title: string;
  desc: string;
};

export function Patterns({ items }: { items: Pattern[] }) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <div
          key={p.title}
          className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface/60 p-4"
        >
          <div className="flex items-center gap-2">
            {p.icon && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-sm text-accent">
                {p.icon}
              </div>
            )}
            <div className="text-sm font-semibold">{p.title}</div>
          </div>
          <p className="text-sm leading-relaxed text-muted">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="my-6 flex flex-col gap-2 sm:flex-row sm:items-stretch">
      {steps.map((step, i) => (
        <li key={i} className="flex flex-1 items-center gap-3 sm:flex-col">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-xs font-semibold text-accent">
            {i + 1}
          </div>
          <div className="flex-1 text-sm text-fg/90 sm:text-center">
            {step}
          </div>
          {i < steps.length - 1 && (
            <span className="hidden text-muted sm:inline">→</span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Aside({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-md border border-border bg-surface/50 px-4 py-3 text-sm italic text-muted">
      {children}
    </div>
  );
}
