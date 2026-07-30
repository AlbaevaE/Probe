"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { mulberry32 } from "@/lib/rng";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optHalf: string;
  optMost: string;
  optAll: string;
  run: string;
  runHint: string;
  totalLabel: string;
  insideLabel: string;
  shareLabel: string;
  estimateLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaHalfTitle: string;
  deltaHalfBody: string;
  deltaAllTitle: string;
  deltaAllBody: string;
};

type Choice = "half" | "most" | "all";
type Phase = "idle" | "running" | "revealed";

export const TOTAL_POINTS = 2000;
const POINTS_PER_TICK = 50;

export type Point = { x: number; y: number; inside: boolean };

// Uniform rain over the square [-1,1]²; the inscribed circle is x²+y²≤1.
export function generatePoints(n: number, rng: () => number): Point[] {
  return Array.from({ length: n }, () => {
    const x = rng() * 2 - 1;
    const y = rng() * 2 - 1;
    return { x, y, inside: x * x + y * y <= 1 };
  });
}

export function estimatePi(points: Point[]): number {
  if (points.length === 0) return 0;
  const inside = points.filter((p) => p.inside).length;
  return (4 * inside) / points.length;
}

export function MonteCarloPiPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(3);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  // The whole rain is drawn from the RNG for real, in the browser.
  const points = useMemo(
    () => generatePoints(TOTAL_POINTS, mulberry32(seed)),
    [seed],
  );

  const shown =
    phase === "idle" ? 0 : Math.min(animStep * POINTS_PER_TICK, TOTAL_POINTS);
  const visible = points.slice(0, shown);
  const inside = visible.filter((p) => p.inside).length;
  const share = shown > 0 ? inside / shown : 0;

  const totalTicks = TOTAL_POINTS / POINTS_PER_TICK;

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= totalTicks) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 60);
    return () => clearTimeout(timer);
  }, [phase, animStep, totalTicks]);

  const onRun = () => {
    if (!choice) return;
    setAnimStep(0);
    setPhase("running");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setAnimStep(0);
    setPhase("idle");
  };

  const outcome: "right" | "half" | "all" | null =
    choice === "most" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "half"
        ? { title: labels.deltaHalfTitle, body: labels.deltaHalfBody, done: false }
        : { title: labels.deltaAllTitle, body: labels.deltaAllBody, done: false };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-widest text-accent">
          {labels.label}
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {labels.title}
        </h1>
        <p className="max-w-2xl text-muted">{labels.situation}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
        {/* the square and the rain */}
        <div className="rounded-2xl border border-border bg-surface/60 p-4">
          <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-sm" role="img">
            <rect
              x={10}
              y={10}
              width={300}
              height={300}
              fill="none"
              stroke="#E5DFD2"
              strokeWidth={2}
            />
            <circle
              cx={160}
              cy={160}
              r={150}
              fill="none"
              stroke="#8A8175"
              strokeWidth={1.5}
            />
            {visible.map((p, i) => (
              <circle
                key={i}
                cx={160 + p.x * 150}
                cy={160 + p.y * 150}
                r={1.6}
                fill={p.inside ? "#2A7F8C" : "#E05C4A"}
                opacity={0.7}
              />
            ))}
          </svg>
        </div>

        {/* live counters */}
        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-border bg-surface/60 p-4 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.totalLabel}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums">
              {shown}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.insideLabel}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums text-done">
              {inside}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.shareLabel}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums">
              {shown > 0 ? `${(share * 100).toFixed(1)}%` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.estimateLabel}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums text-accent">
              {shown > 0 ? (share * 4).toFixed(3) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: "half" as Choice, title: labels.optHalf },
              { key: "most" as Choice, title: labels.optMost },
              { key: "all" as Choice, title: labels.optAll },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setChoice(opt.key)}
                className={clsx(
                  "rounded-xl border bg-surface/60 px-4 py-3 text-left text-sm font-semibold transition",
                  choice === opt.key
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/60",
                )}
              >
                {opt.title}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onRun}
              disabled={!choice}
              className={clsx(
                "rounded-full border border-accent/60 bg-accent/15 px-6 py-2.5 text-sm font-semibold transition",
                !choice && "opacity-40",
                choice && "hover:bg-accent/25",
              )}
            >
              {labels.run}
            </button>
            <span className="text-xs italic text-muted">{labels.runHint}</span>
          </div>
        </div>
      )}

      {/* results */}
      {phase === "revealed" && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>
          <div
            className={clsx(
              "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
              delta.done ? "border-done/70" : "border-accent/70",
            )}
          >
            <div
              className={clsx(
                "text-[11px] uppercase tracking-widest",
                delta.done ? "text-done" : "text-accent",
              )}
            >
              {delta.title}
            </div>
            <p className="mt-1 text-sm text-fg/90">{delta.body}</p>
          </div>
          <div>
            <button
              onClick={onReshuffle}
              className="rounded-full border border-border px-5 py-2 text-sm text-muted hover:bg-surface hover:text-fg"
            >
              {labels.reshuffle}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
