"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  scaleNote: string;
  prediction: string;
  optHair: string;
  optCat: string;
  optHouse: string;
  run: string;
  runHint: string;
  earthLabel: string;
  ballLabel: string;
  addedLabel: string;
  gapLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaHairTitle: string;
  deltaHairBody: string;
  deltaHouseTitle: string;
  deltaHouseBody: string;
};

type Choice = "hair" | "cat" | "house";
type Phase = "idle" | "running" | "revealed";

export const EXTRA_LENGTH = 1; // metres of rope added

// C = 2πr ⟹ the lift is extra/2π — the radius cancels out entirely.
export function ropeGap(extra: number): number {
  return extra / (2 * Math.PI);
}

// Same thing computed the "long way", radius included, so the
// cancellation can be asserted rather than assumed.
export function gapFromRadii(radius: number, extra: number): number {
  const lifted = (2 * Math.PI * radius + extra) / (2 * Math.PI);
  return lifted - radius;
}

const TICKS = 40;
const MAX_GAP_PX = 24; // display exaggeration — the numbers are real

export function EarthRopePlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  const frac = phase === "idle" ? 0 : Math.min(animStep / TICKS, 1);
  const extra = frac * EXTRA_LENGTH;
  // Computed live from the circumference formula, for both bodies.
  const gapEarth = gapFromRadii(6371000, extra);
  const gapBall = gapFromRadii(0.11, extra);
  const gapPx = frac * MAX_GAP_PX;

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= TICKS) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 75);
    return () => clearTimeout(timer);
  }, [phase, animStep]);

  const onRun = () => {
    if (!choice) return;
    setAnimStep(0);
    setPhase("running");
  };

  const onReshuffle = () => {
    setChoice(null);
    setAnimStep(0);
    setPhase("idle");
  };

  const outcome: "right" | "hair" | "house" | null =
    choice === "cat" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "hair"
        ? { title: labels.deltaHairTitle, body: labels.deltaHairBody, done: false }
        : { title: labels.deltaHouseTitle, body: labels.deltaHouseBody, done: false };

  const bodies = [
    { label: labels.earthLabel, cx: 120, cy: 125, r: 85, gap: gapEarth, fill: "#7B5EA7" },
    { label: labels.ballLabel, cx: 330, cy: 160, r: 18, gap: gapBall, fill: "#F2B134" },
  ];

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
        <p className="max-w-2xl text-xs italic text-muted">{labels.scaleNote}</p>
      </header>

      {/* the two ropes */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <div className="mb-2 text-right text-xs tabular-nums text-muted">
          {labels.addedLabel}: {(extra * 100).toFixed(0)}
        </div>
        <svg viewBox="0 0 440 230" className="w-full" role="img">
          {bodies.map((b) => (
            <g key={b.label}>
              <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} opacity={0.25} stroke={b.fill} strokeWidth={1.5} />
              {/* the rope */}
              <circle
                cx={b.cx}
                cy={b.cy}
                r={b.r + gapPx}
                fill="none"
                stroke="#E05C4A"
                strokeWidth={2}
              />
            </g>
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm">
          {bodies.map((b) => (
            <div key={b.label}>
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {b.label}
              </div>
              <div className="tabular-nums">
                {labels.gapLabel}:{" "}
                <span className="font-semibold">
                  {(b.gap * 100).toFixed(1)}
                </span>
              </div>
            </div>
          ))}
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
              { key: "hair" as Choice, title: labels.optHair },
              { key: "cat" as Choice, title: labels.optCat },
              { key: "house" as Choice, title: labels.optHouse },
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
