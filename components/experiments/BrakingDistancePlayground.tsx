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
  slowLabel: string;
  fastLabel: string;
  distanceLabel: string;
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

export const DECEL = 7; // m/s², dry road
export const V_SLOW = 30 / 3.6; // 30 km/h in m/s
export const V_FAST = 60 / 3.6; // 60 km/h in m/s
const DT = 1 / 240;
const FPS = 30;
const SUBSTEPS = 240 / FPS;

// Honest braking: the car's velocity is integrated down to zero step by
// step; the distance is what accumulates, not a formula.
export function simulateBraking(
  v0: number,
  decel: number,
  dt: number,
): number[] {
  let v = v0;
  let x = 0;
  const positions = [0];
  while (v > 0) {
    v -= decel * dt;
    if (v < 0) v = 0;
    x += v * dt;
    positions.push(x);
  }
  return positions;
}

export function brakingDistance(v0: number, decel: number, dt: number): number {
  const positions = simulateBraking(v0, decel, dt);
  return positions[positions.length - 1];
}

/* ── SVG geometry ───────────────────────────────────────────── */
const PX_PER_M = 18;
const X0 = 24;
const LANES_Y = [48, 108];

export function BrakingDistancePlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [frame, setFrame] = useState(0);

  const sim = useMemo(() => {
    const slow = simulateBraking(V_SLOW, DECEL, DT);
    const fast = simulateBraking(V_FAST, DECEL, DT);
    return {
      cars: [
        { label: labels.slowLabel, positions: slow, color: "#2A7F8C", y: LANES_Y[0] },
        { label: labels.fastLabel, positions: fast, color: "#E05C4A", y: LANES_Y[1] },
      ],
      maxFrames: Math.ceil(Math.max(slow.length, fast.length) / SUBSTEPS),
    };
  }, [labels.slowLabel, labels.fastLabel]);

  const distSlow = sim.cars[0].positions[sim.cars[0].positions.length - 1];
  const distFast = sim.cars[1].positions[sim.cars[1].positions.length - 1];

  useEffect(() => {
    if (phase !== "running") return;
    if (frame >= sim.maxFrames) {
      const done = setTimeout(() => setPhase("revealed"), 500);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setFrame((f) => f + 1), 1000 / FPS);
    return () => clearTimeout(timer);
  }, [phase, frame, sim.maxFrames]);

  const onRun = () => {
    if (!choice) return;
    setFrame(0);
    setPhase("running");
  };

  const onReshuffle = () => {
    setChoice(null);
    setFrame(0);
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

      {/* the road */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <svg viewBox="0 0 440 150" className="w-full" role="img">
          {/* start line */}
          <line x1={X0} y1={16} x2={X0} y2={134} stroke="#8A8175" strokeWidth={1.5} strokeDasharray="4 3" />
          {sim.cars.map((car) => {
            const step = Math.min(frame * SUBSTEPS, car.positions.length - 1);
            const pos = phase === "idle" ? 0 : car.positions[step];
            const stopped = phase !== "idle" && step >= car.positions.length - 1;
            const x = X0 + pos * PX_PER_M;
            return (
              <g key={car.label}>
                {/* skid mark */}
                {phase !== "idle" && (
                  <line
                    x1={X0}
                    y1={car.y + 8}
                    x2={x}
                    y2={car.y + 8}
                    stroke="#241F1A"
                    strokeWidth={3}
                    opacity={0.25}
                  />
                )}
                {/* car */}
                <rect x={x - 4} y={car.y - 8} width={30} height={16} rx={4} fill={car.color} />
                <circle cx={x + 3} cy={car.y + 9} r={3.5} fill="#241F1A" />
                <circle cx={x + 19} cy={car.y + 9} r={3.5} fill="#241F1A" />
                {/* distance once stopped */}
                {stopped && (
                  <text x={x + 34} y={car.y + 4} fontSize={12} fill="#241F1A" fontWeight="bold">
                    {pos.toFixed(1)} м
                  </text>
                )}
                <text x={X0 - 8} y={car.y + 4} textAnchor="end" fontSize={11} fill="#8A8175">
                  {car.label}
                </text>
              </g>
            );
          })}
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
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="rounded-xl bg-bg/40 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.slowLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {distSlow.toFixed(1)} м
              </div>
            </div>
            <div className="rounded-xl bg-bg/40 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.fastLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {distFast.toFixed(1)} м
              </div>
            </div>
            <div className="rounded-xl bg-bg/40 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.ratioLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums text-accent">
                ×{(distFast / distSlow).toFixed(1)}
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
