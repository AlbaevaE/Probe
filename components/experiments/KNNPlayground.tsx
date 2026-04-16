"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optRed: string;
  optBlue: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  kLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "red" | "blue";

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

export type Point = { x: number; y: number; cls: "red" | "blue" };

function generateData(seed: number) {
  const rng = mulberry32(seed);
  const points: Point[] = [];

  // red cluster around (70, 70)
  for (let i = 0; i < 8; i++) {
    points.push({
      x: 50 + rng() * 60,
      y: 50 + rng() * 60,
      cls: "red",
    });
  }
  // blue cluster around (180, 180)
  for (let i = 0; i < 8; i++) {
    points.push({
      x: 150 + rng() * 60,
      y: 150 + rng() * 60,
      cls: "blue",
    });
  }
  // a few mixed in the middle
  for (let i = 0; i < 4; i++) {
    points.push({
      x: 90 + rng() * 80,
      y: 90 + rng() * 80,
      cls: rng() > 0.5 ? "red" : "blue",
    });
  }

  // query point deliberately in the ambiguous zone
  const qx = 115 + rng() * 30;
  const qy = 115 + rng() * 30;

  return { points, query: { x: qx, y: qy } };
}

export function classify(points: Point[], query: { x: number; y: number }, k: number): "red" | "blue" {
  const withDist = points.map((p) => ({
    ...p,
    dist: Math.hypot(p.x - query.x, p.y - query.y),
  }));
  withDist.sort((a, b) => a.dist - b.dist);
  const neighbors = withDist.slice(0, k);
  const reds = neighbors.filter((n) => n.cls === "red").length;
  return reds > k / 2 ? "red" : "blue";
}

const W = 300;
const H = 300;
const PAD = 20;
const scale = (v: number) => PAD + (v / 260) * (W - 2 * PAD);

export function KNNPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(42);
  const [k, setK] = useState(3);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "revealed">("idle");

  const { points, query } = useMemo(() => generateData(seed), [seed]);
  const result = useMemo(() => classify(points, query, k), [points, query, k]);

  const neighbors = useMemo(() => {
    const withDist = points.map((p) => ({
      ...p,
      dist: Math.hypot(p.x - query.x, p.y - query.y),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    return withDist.slice(0, k);
  }, [points, query, k]);

  const maxNeighborDist = neighbors.length > 0 ? neighbors[neighbors.length - 1].dist : 0;

  const onRun = () => {
    if (!choice) return;
    setPhase("revealed");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setPhase("idle");
  };

  const isRight = choice === result;

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
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
        >
          {/* neighbor radius */}
          {phase === "revealed" && (
            <circle
              cx={scale(query.x)}
              cy={scale(query.y)}
              r={(maxNeighborDist / 260) * (W - 2 * PAD) + 4}
              fill="none"
              stroke="#d6d0c8"
              strokeWidth="1"
              strokeDasharray="4 3"
              style={{ opacity: 0.8, transition: "all 400ms" }}
            />
          )}

          {/* neighbor lines */}
          {phase === "revealed" &&
            neighbors.map((n, i) => (
              <line
                key={`ln-${i}`}
                x1={scale(query.x)}
                y1={scale(query.y)}
                x2={scale(n.x)}
                y2={scale(n.y)}
                stroke="#d6d0c8"
                strokeWidth="1"
                style={{ opacity: 0.6 }}
              />
            ))}

          {/* data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={scale(p.x)}
              cy={scale(p.y)}
              r="6"
              fill={p.cls === "red" ? "#9b3e14" : "#2d6a9f"}
              opacity={0.8}
            />
          ))}

          {/* query point */}
          <circle
            cx={scale(query.x)}
            cy={scale(query.y)}
            r="10"
            fill={phase === "revealed" ? (result === "red" ? "#9b3e14" : "#2d6a9f") : "#fafaf9"}
            stroke="#2c2523"
            strokeWidth="2"
            style={{ transition: "fill 400ms" }}
          />
          <text
            x={scale(query.x)}
            y={scale(query.y) + 5}
            fontSize="13"
            fill={phase === "revealed" ? "#fff" : "#2c2523"}
            textAnchor="middle"
            fontWeight="700"
            style={{ transition: "fill 400ms" }}
          >
            ?
          </text>
        </svg>
      </div>

      {/* k selector */}
      {phase === "revealed" && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted">{labels.kLabel}</span>
          {[1, 3, 5, 7].map((kv) => (
            <button
              key={kv}
              onClick={() => setK(kv)}
              className={clsx(
                "h-10 w-10 rounded-full border text-sm font-semibold transition",
                k === kv
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border text-muted hover:border-accent/60",
              )}
            >
              {kv}
            </button>
          ))}
        </div>
      )}

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { key: "red" as Choice, title: labels.optRed, color: "#9b3e14" },
              { key: "blue" as Choice, title: labels.optBlue, color: "#2d6a9f" },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setChoice(opt.key)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl border bg-surface/60 px-4 py-3 text-left font-semibold transition",
                  choice === opt.key
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/60",
                )}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: opt.color }}
                />
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
          <div className={clsx(
            "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
            isRight ? "border-done/70" : "border-accent/70",
          )}>
            <div className={clsx("text-[11px] uppercase tracking-widest", isRight ? "text-done" : "text-accent")}>
              {isRight ? labels.deltaRightTitle : labels.deltaWrongTitle}
            </div>
            <p className="mt-1 text-sm text-fg/90">
              {isRight ? labels.deltaRightBody : labels.deltaWrongBody}
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
