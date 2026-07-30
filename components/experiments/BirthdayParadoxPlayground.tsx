"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { mulberry32 } from "@/lib/rng";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optRare: string;
  optHalf: string;
  optAlways: string;
  run: string;
  runHint: string;
  classesLabel: string;
  matchLabel: string;
  legendMatch: string;
  legendNone: string;
  classLabel: string;
  yearLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaRareTitle: string;
  deltaRareBody: string;
  deltaAlwaysTitle: string;
  deltaAlwaysBody: string;
};

type Choice = "rare" | "half" | "always";
type Phase = "idle" | "running" | "revealed";

export const CLASSES = 100;
export const CLASS_SIZE = 23;
const DAYS = 365;
const PER_TICK = 5;

// One class: CLASS_SIZE random birthdays out of 365 days,
// true if at least two land on the same day.
export function hasSharedBirthday(size: number, rng: () => number): boolean {
  const seen = new Set<number>();
  for (let i = 0; i < size; i++) {
    const day = Math.floor(rng() * DAYS);
    if (seen.has(day)) return true;
    seen.add(day);
  }
  return false;
}

export function simulateClasses(
  n: number,
  size: number,
  rng: () => number,
): boolean[] {
  return Array.from({ length: n }, () => hasSharedBirthday(size, rng));
}

// Analytic probability of at least one shared birthday among n people:
// 1 − 365/365 · 364/365 · … — the value the simulation converges to.
export function exactProbability(n: number): number {
  let allDistinct = 1;
  for (let i = 0; i < n; i++) allDistinct *= (DAYS - i) / DAYS;
  return 1 - allDistinct;
}

export function BirthdayParadoxPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(17);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  // Every birthday in every class is drawn from the RNG for real, in the browser.
  const classes = useMemo(
    () => simulateClasses(CLASSES, CLASS_SIZE, mulberry32(seed)),
    [seed],
  );

  const shown = phase === "idle" ? 0 : Math.min(animStep * PER_TICK, CLASSES);
  const matches = classes.slice(0, shown).filter(Boolean).length;
  const pct = shown > 0 ? Math.round((matches / shown) * 100) : 0;

  const totalTicks = CLASSES / PER_TICK;

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= totalTicks) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 120);
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

  const outcome: "right" | "rare" | "always" | null =
    choice === "half" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "rare"
        ? { title: labels.deltaRareTitle, body: labels.deltaRareBody, done: false }
        : { title: labels.deltaAlwaysTitle, body: labels.deltaAlwaysBody, done: false };

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

      {/* setup: 23 students above a 365-day year strip */}
      {phase === "idle" && (
        <svg viewBox="0 0 440 140" className="mx-auto w-full max-w-md" role="img">
          {Array.from({ length: CLASS_SIZE }, (_, i) => (
            <circle
              key={i}
              cx={88 + (i % 12) * 24}
              cy={i < 12 ? 22 : 44}
              r={7}
              fill="#F2B134"
              opacity={0.55}
              stroke="#8A8175"
              strokeWidth={1}
            />
          ))}
          <text x={220} y={70} textAnchor="middle" fontSize={11} fill="#8A8175">
            {labels.classLabel}
          </text>
          <rect x={40} y={86} width={360} height={16} rx={8} fill="#E5DFD2" />
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1={70 + i * 30}
              y1={88}
              x2={70 + i * 30}
              y2={102}
              stroke="#FFFDF8"
              strokeWidth={1.5}
            />
          ))}
          <text x={220} y={126} textAnchor="middle" fontSize={11} fill="#8A8175">
            {labels.yearLabel}
          </text>
        </svg>
      )}

      {/* class grid: one cell per simulated class */}
      {phase !== "idle" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-xs tabular-nums text-muted">
              {labels.classesLabel}: {shown} / {CLASSES}
            </div>
            <div className="font-display text-lg font-bold tabular-nums">
              {labels.matchLabel}: {matches}
              <span className="ml-2 text-sm font-normal text-muted">
                {pct}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {classes.map((match, i) => (
              <div
                key={i}
                className={clsx(
                  "aspect-square rounded-md transition-colors duration-300",
                  i < shown
                    ? match
                      ? "bg-accent"
                      : "bg-border"
                    : "bg-surface/60",
                )}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-accent" />
              {labels.legendMatch}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-border" />
              {labels.legendNone}
            </span>
          </div>
        </div>
      )}

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: "rare" as Choice, title: labels.optRare },
              { key: "half" as Choice, title: labels.optHalf },
              { key: "always" as Choice, title: labels.optAlways },
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
