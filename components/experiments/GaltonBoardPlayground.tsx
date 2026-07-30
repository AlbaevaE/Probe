"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { mulberry32 } from "@/lib/rng";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optFlat: string;
  optBell: string;
  optEdges: string;
  run: string;
  runHint: string;
  ballsLabel: string;
  resultsHeading: string;
  pathsNote: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaFlatTitle: string;
  deltaFlatBody: string;
  deltaEdgesTitle: string;
  deltaEdgesBody: string;
};

type Choice = "flat" | "bell" | "edges";
type Phase = "idle" | "running" | "revealed";

export const ROWS = 8;
export const BALLS = 64;

// One ball: rights[i] = how many right-bounces happened in the first i rows.
// The final entry is the bin index (0..rows).
export function dropPath(rows: number, rng: () => number): number[] {
  const rights = [0];
  for (let i = 0; i < rows; i++) {
    rights.push(rights[i] + (rng() < 0.5 ? 0 : 1));
  }
  return rights;
}

export function simulateBins(
  balls: number,
  rows: number,
  rng: () => number,
): number[] {
  const bins = Array.from({ length: rows + 1 }, () => 0);
  for (let i = 0; i < balls; i++) {
    const path = dropPath(rows, rng);
    bins[path[rows]]++;
  }
  return bins;
}

/* ── SVG geometry ───────────────────────────────────────────── */
const CX = 220;
const DX = 20; // horizontal half-step per bounce
const PEG_TOP = 44;
const ROW_H = 15;
const BASE_Y = 298;
const BAR_UNIT = 5;
const BAR_MAX = 140;

function pathPoints(rights: number[]): [number, number][] {
  const pts: [number, number][] = [[CX, 16]];
  for (let i = 0; i < rights.length - 1; i++) {
    pts.push([CX + (2 * rights[i] - i) * DX, PEG_TOP + i * ROW_H]);
  }
  const bin = rights[rights.length - 1];
  pts.push([CX + (bin - ROWS / 2) * 2 * DX, BASE_Y - 8]);
  return pts;
}

export function GaltonBoardPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(11);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0); // number of landed balls

  // Every bounce of every ball is drawn from the RNG for real, in the browser.
  const paths = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: BALLS }, () => dropPath(ROWS, rng));
  }, [seed]);

  const landed = phase === "idle" ? 0 : Math.min(animStep, BALLS);
  const bins = useMemo(() => {
    const counts = Array.from({ length: ROWS + 1 }, () => 0);
    for (let i = 0; i < landed; i++) counts[paths[i][ROWS]]++;
    return counts;
  }, [paths, landed]);

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= BALLS) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 55);
    return () => clearTimeout(timer);
  }, [phase, animStep]);

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

  const outcome: "right" | "flat" | "edges" | null =
    choice === "bell" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "flat"
        ? { title: labels.deltaFlatTitle, body: labels.deltaFlatBody, done: false }
        : { title: labels.deltaEdgesTitle, body: labels.deltaEdgesBody, done: false };

  const flying = phase === "running" && animStep < BALLS ? paths[animStep] : null;
  const flyingPts = flying ? pathPoints(flying) : null;

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

      {/* the board */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <div className="mb-2 text-right text-xs tabular-nums text-muted">
          {landed} / {BALLS} {labels.ballsLabel}
        </div>
        <svg viewBox="0 0 440 320" className="w-full" role="img">
          {/* funnel */}
          <circle cx={CX} cy={12} r={4} fill="#E05C4A" opacity={0.5} />

          {/* pegs */}
          {Array.from({ length: ROWS }, (_, i) =>
            Array.from({ length: i + 1 }, (_, j) => (
              <circle
                key={`${i}-${j}`}
                cx={CX + (2 * j - i) * DX}
                cy={PEG_TOP + i * ROW_H}
                r={2.5}
                fill="#8A8175"
              />
            )),
          )}

          {/* bin base + separators */}
          <line x1={20} y1={BASE_Y} x2={420} y2={BASE_Y} stroke="#E5DFD2" strokeWidth={2} />
          {Array.from({ length: ROWS + 2 }, (_, b) => (
            <line
              key={b}
              x1={CX + (b - 4.5) * 2 * DX}
              y1={BASE_Y - 10}
              x2={CX + (b - 4.5) * 2 * DX}
              y2={BASE_Y}
              stroke="#E5DFD2"
              strokeWidth={1.5}
            />
          ))}

          {/* accumulated balls per bin */}
          {bins.map((count, b) => {
            const h = Math.min(count * BAR_UNIT, BAR_MAX);
            return (
              <rect
                key={b}
                x={CX + (b - 4) * 2 * DX - 14}
                y={BASE_Y - 2 - h}
                width={28}
                height={h}
                rx={3}
                fill="#2A7F8C"
                opacity={0.8}
              />
            );
          })}

          {/* counts under bins after reveal */}
          {phase === "revealed" &&
            bins.map((count, b) => (
              <text
                key={b}
                x={CX + (b - 4) * 2 * DX}
                y={314}
                textAnchor="middle"
                fontSize={11}
                fill="#8A8175"
              >
                {count}
              </text>
            ))}

          {/* the ball currently falling */}
          {flyingPts && (
            <>
              <polyline
                points={flyingPts.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="#E05C4A"
                strokeWidth={1.5}
                opacity={0.55}
              />
              <circle
                cx={flyingPts[flyingPts.length - 1][0]}
                cy={flyingPts[flyingPts.length - 1][1]}
                r={5}
                fill="#E05C4A"
              />
            </>
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
              { key: "flat" as Choice, title: labels.optFlat },
              { key: "bell" as Choice, title: labels.optBell },
              { key: "edges" as Choice, title: labels.optEdges },
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
          <p className="text-sm text-muted">{labels.pathsNote}</p>
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
