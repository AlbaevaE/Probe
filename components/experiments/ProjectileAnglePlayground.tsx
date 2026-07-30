"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  opt30: string;
  opt45: string;
  opt60: string;
  run: string;
  runHint: string;
  rangeLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  delta30Title: string;
  delta30Body: string;
  delta60Title: string;
  delta60Body: string;
};

type Choice = "a30" | "a45" | "a60";
type Phase = "idle" | "running" | "revealed";

const G = 9.81;
export const V0 = 20; // m/s
const DT = 1 / 240;
const FPS = 30;
const SUBSTEPS = 240 / FPS;

export type Trajectory = {
  points: { x: number; y: number }[]; // sampled per frame
  range: number;
  apex: number;
  time: number;
};

// Honest ballistics: numerically integrated step by step, not the
// closed-form answer. Landing point interpolated at the ground crossing.
export function simulateProjectile(
  angleDeg: number,
  v0: number,
  dt: number,
): Trajectory {
  const rad = (angleDeg * Math.PI) / 180;
  const vx = v0 * Math.cos(rad);
  let vy = v0 * Math.sin(rad);
  let x = 0;
  let y = 0;
  let apex = 0;
  const points: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  let step = 0;
  for (;;) {
    step++;
    vy -= G * dt;
    const nx = x + vx * dt;
    const ny = y + vy * dt;
    if (ny < 0) {
      const frac = y / (y - ny);
      const range = x + (nx - x) * frac;
      const time = (step - 1 + frac) * dt;
      points.push({ x: range, y: 0 });
      return { points, range, apex, time };
    }
    x = nx;
    y = ny;
    if (y > apex) apex = y;
    if (step % SUBSTEPS === 0) points.push({ x, y });
  }
}

/* ── SVG geometry ───────────────────────────────────────────── */
const PX_PER_M = 9;
const X0 = 15;
const GROUND_Y = 145;

const px = (m: number) => X0 + m * PX_PER_M;
const py = (m: number) => GROUND_Y - m * PX_PER_M;

const ANGLES = [
  { key: "a30" as Choice, deg: 30, color: "#7B5EA7" },
  { key: "a45" as Choice, deg: 45, color: "#2A7F8C" },
  { key: "a60" as Choice, deg: 60, color: "#E05C4A" },
];

export function ProjectileAnglePlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [frame, setFrame] = useState(0);

  const shots = useMemo(
    () => ANGLES.map((a) => ({ ...a, sim: simulateProjectile(a.deg, V0, DT) })),
    [],
  );
  const maxFrames = Math.max(...shots.map((s) => s.sim.points.length));

  useEffect(() => {
    if (phase !== "running") return;
    if (frame >= maxFrames) {
      const done = setTimeout(() => setPhase("revealed"), 500);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setFrame((f) => f + 1), 1000 / FPS);
    return () => clearTimeout(timer);
  }, [phase, frame, maxFrames]);

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

  const outcome: "right" | "a30" | "a60" | null =
    choice === "a45" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "a30"
        ? { title: labels.delta30Title, body: labels.delta30Body, done: false }
        : { title: labels.delta60Title, body: labels.delta60Body, done: false };

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

      {/* the field */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <svg viewBox="0 0 440 170" className="w-full" role="img">
          <line x1={10} y1={GROUND_Y} x2={435} y2={GROUND_Y} stroke="#8A8175" strokeWidth={1.5} />
          {/* 10 m ticks */}
          {[10, 20, 30, 40].map((m) => (
            <g key={m}>
              <line x1={px(m)} y1={GROUND_Y} x2={px(m)} y2={GROUND_Y + 5} stroke="#8A8175" strokeWidth={1} />
              <text x={px(m)} y={GROUND_Y + 17} textAnchor="middle" fontSize={10} fill="#8A8175">
                {m} м
              </text>
            </g>
          ))}
          {shots.map((s) => {
            const shown = phase === "idle" ? 0 : Math.min(frame, s.sim.points.length);
            const trail = s.sim.points.slice(0, shown);
            const head = trail[trail.length - 1];
            return (
              <g key={s.key}>
                {trail.length > 1 && (
                  <polyline
                    points={trail.map((p) => `${px(p.x)},${py(p.y)}`).join(" ")}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                )}
                {head && <circle cx={px(head.x)} cy={py(head.y)} r={5} fill={s.color} />}
                {phase === "idle" && (
                  <line
                    x1={px(0)}
                    y1={py(0)}
                    x2={px(0) + 30 * Math.cos((s.deg * Math.PI) / 180)}
                    y2={py(0) - 30 * Math.sin((s.deg * Math.PI) / 180)}
                    stroke={s.color}
                    strokeWidth={2.5}
                  />
                )}
              </g>
            );
          })}
        </svg>
        {/* legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-5 text-sm">
          {shots.map((s) => (
            <div key={s.key} className="flex items-center gap-2 tabular-nums">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="font-semibold">{s.deg}°</span>
              {phase === "revealed" && (
                <span className="text-muted">
                  {labels.rangeLabel}: {s.sim.range.toFixed(1)}
                </span>
              )}
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
              { key: "a30" as Choice, title: labels.opt30 },
              { key: "a45" as Choice, title: labels.opt45 },
              { key: "a60" as Choice, title: labels.opt60 },
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
