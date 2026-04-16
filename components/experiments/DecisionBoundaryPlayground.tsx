"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optVertical: string;
  optHorizontal: string;
  optDiagonal: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  accuracyLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
  deltaAlmostTitle: string;
  deltaAlmostBody: string;
};

type Choice = "vertical" | "horizontal" | "diagonal";

/* ── seeded RNG ─────────────────────────────────────────────── */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Point = { x: number; y: number; cls: "A" | "B" };

function generateData(seed: number) {
  const rng = mulberry32(seed);
  const points: Point[] = [];

  // Class A: below the diagonal (x + y < 13), with some noise
  for (let i = 0; i < 12; i++) {
    const x = 1 + rng() * 10;
    const y = 1 + rng() * (11 - x * 0.5);
    points.push({ x, y: Math.min(y, 11), cls: "A" });
  }

  // Class B: above the diagonal (x + y > 13), with some noise
  for (let i = 0; i < 12; i++) {
    const x = 2 + rng() * 10;
    const y = (13 - x) + rng() * (12 - (13 - x));
    points.push({ x, y: Math.min(Math.max(y, 1), 12), cls: "B" });
  }

  return points;
}

function classifyWithBoundary(
  points: Point[],
  boundary: Choice,
): { correct: number; total: number } {
  let correct = 0;
  for (const p of points) {
    let predicted: "A" | "B";
    if (boundary === "vertical") {
      predicted = p.x < 6.5 ? "A" : "B";
    } else if (boundary === "horizontal") {
      predicted = p.y < 6.5 ? "A" : "B";
    } else {
      // diagonal: x + y < 13
      predicted = p.x + p.y < 13 ? "A" : "B";
    }
    if (predicted === p.cls) correct++;
  }
  return { correct, total: points.length };
}

const W = 300;
const H = 300;
const PAD = 30;
const sx = (x: number) => PAD + (x / 13) * (W - 2 * PAD);
const sy = (y: number) => PAD + (1 - y / 13) * (H - 2 * PAD);

export function DecisionBoundaryPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(42);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "revealed">("idle");

  const points = useMemo(() => generateData(seed), [seed]);

  const results = useMemo(() => ({
    vertical: classifyWithBoundary(points, "vertical"),
    horizontal: classifyWithBoundary(points, "horizontal"),
    diagonal: classifyWithBoundary(points, "diagonal"),
  }), [points]);

  const winner = useMemo(() => {
    let best: Choice = "vertical";
    let bestAcc = results.vertical.correct;
    for (const c of ["horizontal", "diagonal"] as Choice[]) {
      if (results[c].correct > bestAcc) {
        bestAcc = results[c].correct;
        best = c;
      }
    }
    return best;
  }, [results]);

  const onRun = () => {
    if (!choice) return;
    setPhase("revealed");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setPhase("idle");
  };

  const boundaryLine = (b: Choice) => {
    if (b === "vertical") {
      return { x1: sx(6.5), y1: sy(0), x2: sx(6.5), y2: sy(13) };
    } else if (b === "horizontal") {
      return { x1: sx(0), y1: sy(6.5), x2: sx(13), y2: sy(6.5) };
    } else {
      return { x1: sx(0), y1: sy(13), x2: sx(13), y2: sy(0) };
    }
  };

  const isRight = choice === winner;
  const isAlmost =
    !isRight &&
    choice !== null &&
    results[choice].correct >= results[winner].correct - 2;

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

      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface/60">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* boundary line if revealed */}
          {phase === "revealed" && choice && (() => {
            const bl = boundaryLine(choice);
            return (
              <line
                {...bl}
                stroke="#9b3e14"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.7"
              />
            );
          })()}
          {phase === "revealed" && choice !== winner && (() => {
            const bl = boundaryLine(winner);
            return (
              <line
                {...bl}
                stroke="#4d6a23"
                strokeWidth="2"
                opacity="0.7"
              />
            );
          })()}

          {/* points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={sx(p.x)}
              cy={sy(p.y)}
              r="6"
              fill={p.cls === "A" ? "#9b3e14" : "#2d6a9f"}
              opacity={0.8}
            />
          ))}
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
              { key: "vertical" as Choice, title: labels.optVertical },
              { key: "horizontal" as Choice, title: labels.optHorizontal },
              { key: "diagonal" as Choice, title: labels.optDiagonal },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setChoice(opt.key)}
                className={clsx(
                  "rounded-xl border bg-surface/60 px-4 py-3 text-left font-semibold transition",
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
          <div className="grid gap-3 sm:grid-cols-3">
            {(["vertical", "horizontal", "diagonal"] as Choice[]).map((c) => {
              const r = results[c];
              const pct = Math.round((r.correct / r.total) * 100);
              const isPick = choice === c;
              const isWinner = winner === c;
              return (
                <div
                  key={c}
                  className={clsx(
                    "rounded-xl border px-4 py-3",
                    isWinner ? "border-done/60 bg-done/10" : "border-border bg-bg/30",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-semibold">
                      {c === "vertical" ? labels.optVertical : c === "horizontal" ? labels.optHorizontal : labels.optDiagonal}
                    </span>
                    {isPick && <span className="text-[9px] uppercase tracking-widest text-accent">&#x2190;</span>}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {labels.accuracyLabel}: <span className="text-fg font-semibold">{pct}%</span> ({r.correct}/{r.total})
                  </div>
                </div>
              );
            })}
          </div>
          <div className={clsx(
            "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
            isRight ? "border-done/70" : "border-accent/70",
          )}>
            <div className={clsx("text-[11px] uppercase tracking-widest", isRight ? "text-done" : "text-accent")}>
              {isRight ? labels.deltaRightTitle : isAlmost ? labels.deltaAlmostTitle : labels.deltaWrongTitle}
            </div>
            <p className="mt-1 text-sm text-fg/90">
              {isRight ? labels.deltaRightBody : isAlmost ? labels.deltaAlmostBody : labels.deltaWrongBody}
            </p>
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
