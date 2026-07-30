"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { mulberry32 } from "@/lib/rng";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optWander: string;
  optSettle: string;
  optHot: string;
  run: string;
  runHint: string;
  rollsLabel: string;
  lastRollLabel: string;
  meanLabel: string;
  first10Label: string;
  finalLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWanderTitle: string;
  deltaWanderBody: string;
  deltaHotTitle: string;
  deltaHotBody: string;
};

type Choice = "wander" | "settle" | "hot";
type Phase = "idle" | "running" | "revealed";

export const ROLLS = 300;
const PER_TICK = 5;

export function simulateRolls(n: number, rng: () => number): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(rng() * 6));
}

export function runningMeans(rolls: number[]): number[] {
  let sum = 0;
  return rolls.map((r, i) => {
    sum += r;
    return sum / (i + 1);
  });
}

/* ── chart geometry ─────────────────────────────────────────── */
const X0 = 40;
const X1 = 430;
const Y0 = 20;
const Y1 = 210;

const xAt = (i: number) => X0 + (i / (ROLLS - 1)) * (X1 - X0);
const yAt = (v: number) => Y1 - ((v - 1) / 5) * (Y1 - Y0);

export function DiceAveragePlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(5);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  // Every roll is drawn from the RNG for real, in the browser.
  const rolls = useMemo(() => simulateRolls(ROLLS, mulberry32(seed)), [seed]);
  const means = useMemo(() => runningMeans(rolls), [rolls]);

  const shown = phase === "idle" ? 0 : Math.min(animStep * PER_TICK, ROLLS);
  const totalTicks = ROLLS / PER_TICK;

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= totalTicks) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 50);
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

  const outcome: "right" | "wander" | "hot" | null =
    choice === "settle" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "wander"
        ? { title: labels.deltaWanderTitle, body: labels.deltaWanderBody, done: false }
        : { title: labels.deltaHotTitle, body: labels.deltaHotBody, done: false };

  const line = means
    .slice(0, shown)
    .map((m, i) => `${xAt(i)},${yAt(m)}`)
    .join(" ");

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

      {/* the chart */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <div className="mb-2 flex justify-between text-xs tabular-nums text-muted">
          <span>
            {labels.rollsLabel}: {shown}
          </span>
          <span>
            {labels.lastRollLabel}:{" "}
            <span className="font-semibold text-fg">
              {shown > 0 ? rolls[shown - 1] : "—"}
            </span>
            {"  ·  "}
            {labels.meanLabel}:{" "}
            <span className="font-semibold text-fg">
              {shown > 0 ? means[shown - 1].toFixed(2) : "—"}
            </span>
          </span>
        </div>
        <svg viewBox="0 0 440 240" className="w-full" role="img">
          {/* y axis marks 1..6 */}
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <g key={v}>
              <line x1={X0} y1={yAt(v)} x2={X1} y2={yAt(v)} stroke="#E5DFD2" strokeWidth={0.5} />
              <text x={X0 - 8} y={yAt(v) + 4} textAnchor="end" fontSize={11} fill="#8A8175">
                {v}
              </text>
            </g>
          ))}
          {/* the 3.5 target line */}
          <line
            x1={X0}
            y1={yAt(3.5)}
            x2={X1}
            y2={yAt(3.5)}
            stroke="#E05C4A"
            strokeWidth={1.5}
            strokeDasharray="6 5"
            opacity={0.6}
          />
          <text x={X1} y={yAt(3.5) - 6} textAnchor="end" fontSize={11} fill="#E05C4A">
            3,5
          </text>
          {/* running mean */}
          {shown > 1 && (
            <polyline points={line} fill="none" stroke="#7B5EA7" strokeWidth={2} />
          )}
          {shown > 0 && (
            <circle cx={xAt(shown - 1)} cy={yAt(means[shown - 1])} r={4} fill="#7B5EA7" />
          )}
        </svg>
      </div>

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: "wander" as Choice, title: labels.optWander },
              { key: "settle" as Choice, title: labels.optSettle },
              { key: "hot" as Choice, title: labels.optHot },
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
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div className="rounded-xl bg-bg/40 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.first10Label}
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {means[9].toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl bg-bg/40 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.finalLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {means[ROLLS - 1].toFixed(2)}
              </div>
            </div>
          </div>
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
