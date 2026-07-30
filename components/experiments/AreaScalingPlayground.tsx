"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optTwo: string;
  optThree: string;
  optFour: string;
  run: string;
  runHint: string;
  smallLabel: string;
  bigLabel: string;
  cellsLabel: string;
  ratioLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaTwoTitle: string;
  deltaTwoBody: string;
  deltaThreeTitle: string;
  deltaThreeBody: string;
};

type Choice = "two" | "three" | "four";
type Phase = "idle" | "running" | "revealed";

export const CELL_CM = 2;
export const SMALL_R_CM = 12.5; // 25 cm pizza
export const BIG_R_CM = 25; // 50 cm pizza

// Grid cells (cell × cell cm) whose centre lies inside the circle.
// Counting squares IS the area measurement — no formula involved.
export function cellCenters(
  radius: number,
  cell: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const start = -radius + cell / 2;
  for (let y = start; y < radius; y += cell) {
    for (let x = start; x < radius; x += cell) {
      if (x * x + y * y <= radius * radius) cells.push({ x, y });
    }
  }
  return cells;
}

const TICKS = 30;
const SCALE = 3.2; // px per cm

export function AreaScalingPlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  const smallCells = useMemo(() => cellCenters(SMALL_R_CM, CELL_CM), []);
  const bigCells = useMemo(() => cellCenters(BIG_R_CM, CELL_CM), []);

  const frac = phase === "idle" ? 0 : Math.min(animStep / TICKS, 1);
  const shownSmall = Math.round(frac * smallCells.length);
  const shownBig = Math.round(frac * bigCells.length);

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= TICKS) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 70);
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

  const outcome: "right" | "two" | "three" | null =
    choice === "four" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "two"
        ? { title: labels.deltaTwoTitle, body: labels.deltaTwoBody, done: false }
        : { title: labels.deltaThreeTitle, body: labels.deltaThreeBody, done: false };

  const pizzas = [
    { label: labels.smallLabel, cx: 110, cy: 112, r: SMALL_R_CM, cells: smallCells, shown: shownSmall },
    { label: labels.bigLabel, cx: 300, cy: 112, r: BIG_R_CM, cells: bigCells, shown: shownBig },
  ];

  const cellPx = CELL_CM * SCALE;

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

      {/* the two pizzas */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <svg viewBox="0 0 440 224" className="w-full" role="img">
          {pizzas.map((p) => (
            <g key={p.label}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r={p.r * SCALE}
                fill="none"
                stroke="#8A8175"
                strokeWidth={1.5}
              />
              {p.cells.slice(0, p.shown).map((c, i) => (
                <rect
                  key={i}
                  x={p.cx + c.x * SCALE - cellPx / 2 + 0.5}
                  y={p.cy + c.y * SCALE - cellPx / 2 + 0.5}
                  width={cellPx - 1}
                  height={cellPx - 1}
                  fill="#F2B134"
                  opacity={0.8}
                />
              ))}
            </g>
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm">
          {pizzas.map((p) => (
            <div key={p.label}>
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {p.label}
              </div>
              <div className="tabular-nums">
                {labels.cellsLabel}:{" "}
                <span className="font-semibold">{p.shown}</span>
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
              { key: "two" as Choice, title: labels.optTwo },
              { key: "three" as Choice, title: labels.optThree },
              { key: "four" as Choice, title: labels.optFour },
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
          <div className="rounded-xl bg-bg/40 px-3 py-2 text-center text-sm">
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.ratioLabel}
            </div>
            <div className="font-display text-2xl font-bold tabular-nums">
              {bigCells.length} / {smallCells.length} ≈{" "}
              {(bigCells.length / smallCells.length).toFixed(1)}
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
