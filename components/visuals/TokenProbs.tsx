const TOKENS: Array<{ text: string; p: number }> = [
  { text: "синее", p: 0.42 },
  { text: "глубокое", p: 0.21 },
  { text: "спокойное", p: 0.14 },
  { text: "бескрайнее", p: 0.09 },
  { text: "тёплое", p: 0.06 },
  { text: "…", p: 0.08 },
];

export function TokenProbs() {
  const maxP = Math.max(...TOKENS.map((t) => t.p));
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg/40 p-4">
      <div className="text-xs uppercase tracking-wide text-muted">
        контекст
      </div>
      <div className="text-sm text-fg">
        «Море было <span className="text-muted">___</span>»
      </div>
      <div className="text-xs uppercase tracking-wide text-muted mt-2">
        следующий токен
      </div>
      <div className="flex flex-col gap-1.5">
        {TOKENS.map((t) => (
          <div key={t.text} className="flex items-center gap-2 text-xs">
            <div className="w-24 shrink-0 text-right text-fg/90">{t.text}</div>
            <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface">
              <div
                className="h-full rounded bg-accent/70"
                style={{ width: `${(t.p / maxP) * 100}%` }}
              />
            </div>
            <div className="w-10 text-muted">{t.p.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
