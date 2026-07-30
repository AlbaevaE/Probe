"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optHeavy: string;
  optLight: string;
  optSame: string;
  run: string;
  runHint: string;
  lightLabel: string;
  heavyLabel: string;
  swingsLabel: string;
  timeLabel: string;
  periodLabel: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaHeavyTitle: string;
  deltaHeavyBody: string;
  deltaLightTitle: string;
  deltaLightBody: string;
};

type Choice = "heavy" | "light" | "same";
type Phase = "idle" | "running" | "revealed";

const G = 9.81;
export const LENGTH = 1; // metres
export const THETA0 = (35 * Math.PI) / 180;
const DT = 1 / 240;
const DURATION = 6.5; // seconds of simulated (and real) time
const FPS = 30;
const SUBSTEPS = 240 / FPS;

// The mass is deliberately written into both the torque and the inertia.
// It cancels — but the code doesn't know that in advance: each pendulum
// is integrated separately, with its own mass.
export function simulatePendulum(
  mass: number,
  length: number,
  theta0: number,
  dt: number,
  steps: number,
): number[] {
  let theta = theta0;
  let omega = 0;
  const out = [theta];
  for (let i = 0; i < steps; i++) {
    const torque = -mass * G * length * Math.sin(theta);
    const inertia = mass * length * length;
    omega += (torque / inertia) * dt;
    theta += omega * dt;
    out.push(theta);
  }
  return out;
}

// Times (in seconds) at which the pendulum passes the lowest point.
export function crossingTimes(series: number[], dt: number): number[] {
  const times: number[] = [];
  for (let i = 1; i < series.length; i++) {
    if (series[i - 1] > 0 !== series[i] > 0) {
      const frac = series[i - 1] / (series[i - 1] - series[i]);
      times.push((i - 1 + frac) * dt);
    }
  }
  return times;
}

/* ── SVG geometry ───────────────────────────────────────────── */
const ROD_PX = 160;
const PIVOT_Y = 24;
const PIVOTS = [120, 320];

function Pendulum({
  pivotX,
  theta,
  bobR,
  bobFill,
}: {
  pivotX: number;
  theta: number;
  bobR: number;
  bobFill: string;
}) {
  const x = pivotX + Math.sin(theta) * ROD_PX;
  const y = PIVOT_Y + Math.cos(theta) * ROD_PX;
  return (
    <>
      <line
        x1={pivotX}
        y1={PIVOT_Y}
        x2={pivotX}
        y2={PIVOT_Y + ROD_PX + 20}
        stroke="#E5DFD2"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <line x1={pivotX} y1={PIVOT_Y} x2={x} y2={y} stroke="#8A8175" strokeWidth={1.5} />
      <circle cx={pivotX} cy={PIVOT_Y} r={3} fill="#241F1A" />
      <circle cx={x} cy={y} r={bobR} fill={bobFill} stroke="#241F1A" strokeWidth={1} />
    </>
  );
}

export function PendulumPlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [frame, setFrame] = useState(0);

  const sim = useMemo(() => {
    const steps = Math.round(DURATION / DT);
    const light = simulatePendulum(1, LENGTH, THETA0, DT, steps);
    const heavy = simulatePendulum(5, LENGTH, THETA0, DT, steps);
    const lightCross = crossingTimes(light, DT);
    const heavyCross = crossingTimes(heavy, DT);
    return {
      light,
      heavy,
      lightCross,
      heavyCross,
      // full period = time between two same-direction bottom passes
      lightPeriod: lightCross.length >= 3 ? lightCross[2] - lightCross[0] : 0,
      heavyPeriod: heavyCross.length >= 3 ? heavyCross[2] - heavyCross[0] : 0,
      frames: Math.floor(steps / SUBSTEPS),
    };
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    if (frame >= sim.frames) {
      const done = setTimeout(() => setPhase("revealed"), 400);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setFrame((f) => f + 1), 1000 / FPS);
    return () => clearTimeout(timer);
  }, [phase, frame, sim.frames]);

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

  const t = phase === "idle" ? 0 : Math.min(frame / FPS, DURATION);
  const step = Math.min(frame * SUBSTEPS, sim.light.length - 1);
  const thetaLight = phase === "idle" ? THETA0 : sim.light[step];
  const thetaHeavy = phase === "idle" ? THETA0 : sim.heavy[step];
  const swingsLight = sim.lightCross.filter((c) => c <= t).length;
  const swingsHeavy = sim.heavyCross.filter((c) => c <= t).length;

  const outcome: "right" | "heavy" | "light" | null =
    choice === "same" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "heavy"
        ? { title: labels.deltaHeavyTitle, body: labels.deltaHeavyBody, done: false }
        : { title: labels.deltaLightTitle, body: labels.deltaLightBody, done: false };

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

      {/* the two pendulums */}
      <div className="rounded-2xl border border-border bg-surface/60 p-4">
        <div className="mb-1 text-right text-xs tabular-nums text-muted">
          {labels.timeLabel}: {t.toFixed(1)}
        </div>
        <svg viewBox="0 0 440 220" className="w-full" role="img">
          <Pendulum pivotX={PIVOTS[0]} theta={thetaLight} bobR={9} bobFill="#F2B134" />
          <Pendulum pivotX={PIVOTS[1]} theta={thetaHeavy} bobR={15} bobFill="#8A8175" />
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.lightLabel}
            </div>
            <div className="tabular-nums">
              {labels.swingsLabel}: <span className="font-semibold">{swingsLight}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.heavyLabel}
            </div>
            <div className="tabular-nums">
              {labels.swingsLabel}: <span className="font-semibold">{swingsHeavy}</span>
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
              { key: "heavy" as Choice, title: labels.optHeavy },
              { key: "light" as Choice, title: labels.optLight },
              { key: "same" as Choice, title: labels.optSame },
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
                {labels.lightLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {labels.periodLabel}: {sim.lightPeriod.toFixed(3)}
              </div>
            </div>
            <div className="rounded-xl bg-bg/40 px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.heavyLabel}
              </div>
              <div className="font-display text-xl font-bold tabular-nums">
                {labels.periodLabel}: {sim.heavyPeriod.toFixed(3)}
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
