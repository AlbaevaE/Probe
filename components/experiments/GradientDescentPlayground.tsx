"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optGlobal: string;
  optLocal: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  clickHint: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "global" | "local";

/* ── landscape function ────────────────────────────────────── */
// Two valleys: a shallow one on the left, a deep one on the right
export function landscape(x: number): number {
  return (
    0.5 * Math.sin(x * 1.2) +
    0.3 * Math.sin(x * 2.5 + 1) +
    0.08 * x * x -
    0.4 * x +
    2
  );
}

export function landscapeDerivative(x: number): number {
  return (
    0.5 * 1.2 * Math.cos(x * 1.2) +
    0.3 * 2.5 * Math.cos(x * 2.5 + 1) +
    0.16 * x -
    0.4
  );
}

/* ── find the global minimum for comparison ────────────────── */
export function findGlobalMin(): number {
  let bestX = 0;
  let bestY = Infinity;
  for (let x = 0; x <= 6; x += 0.01) {
    const y = landscape(x);
    if (y < bestY) {
      bestY = y;
      bestX = x;
    }
  }
  return bestX;
}

const GLOBAL_MIN_X = findGlobalMin();

const W = 500;
const H = 240;
const PAD_L = 30;
const PAD_R = 20;
const PAD_T = 30;
const PAD_B = 30;
const X_MIN = 0;
const X_MAX = 6;
const Y_MIN = 0.5;
const Y_MAX = 3.5;

const sx = (x: number) => PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD_L - PAD_R);
const sy = (y: number) => PAD_T + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD_T - PAD_B);

export function GradientDescentPlayground({ labels }: { labels: Labels }) {
  const [startX, setStartX] = useState(1.0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");
  const [ballPath, setBallPath] = useState<number[]>([]);
  const [animIdx, setAnimIdx] = useState(0);

  // simulate gradient descent
  const fullPath = useMemo(() => {
    const path: number[] = [startX];
    let x = startX;
    const lr = 0.08;
    for (let i = 0; i < 60; i++) {
      const grad = landscapeDerivative(x);
      x = x - lr * grad;
      x = Math.max(X_MIN, Math.min(X_MAX, x));
      path.push(x);
      if (Math.abs(grad) < 0.001) break;
    }
    return path;
  }, [startX]);

  const landedNearGlobal = useMemo(() => {
    const finalX = fullPath[fullPath.length - 1];
    return Math.abs(finalX - GLOBAL_MIN_X) < 0.5;
  }, [fullPath]);

  const correctAnswer: Choice = landedNearGlobal ? "global" : "local";

  useEffect(() => {
    if (phase !== "running") return;
    setBallPath([fullPath[0]]);
    setAnimIdx(0);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = Math.max(1, Math.floor(fullPath.length / 30));
    let count = 0;
    for (let i = step; i < fullPath.length; i += step) {
      count++;
      timers.push(
        setTimeout(() => {
          setBallPath(fullPath.slice(0, i + 1));
          setAnimIdx(i);
        }, count * 60),
      );
    }
    timers.push(
      setTimeout(() => {
        setBallPath([...fullPath]);
        setPhase("revealed");
      }, (count + 1) * 60 + 300),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, fullPath]);

  const onRun = () => {
    if (!choice) return;
    setPhase("running");
  };

  const onReshuffle = () => {
    const candidates = [0.5, 1.0, 1.5, 2.0, 3.5, 4.5, 5.0];
    setStartX(candidates[Math.floor(Math.random() * candidates.length)]);
    setChoice(null);
    setPhase("idle");
    setBallPath([]);
    setAnimIdx(0);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (phase !== "idle") return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * W;
    const dataX = X_MIN + ((clickX - PAD_L) / (W - PAD_L - PAD_R)) * (X_MAX - X_MIN);
    if (dataX >= X_MIN + 0.2 && dataX <= X_MAX - 0.2) {
      setStartX(Math.round(dataX * 10) / 10);
    }
  };

  // landscape path
  const landscapePath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = X_MIN + (i / 200) * (X_MAX - X_MIN);
      const y = landscape(x);
      pts.push(`${i === 0 ? "M" : "L"} ${sx(x)} ${sy(y)}`);
    }
    return pts.join(" ");
  }, []);

  const currentBallX = ballPath.length > 0 ? ballPath[ballPath.length - 1] : startX;
  const isRight = choice === correctAnswer;

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

      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          style={{ cursor: phase === "idle" ? "crosshair" : "default", fontFamily: 'ui-serif, "Iowan Old Style", Georgia, serif' }}
          onClick={handleSvgClick}
        >
          {/* landscape */}
          <path d={landscapePath} fill="none" stroke="#E5DFD2" strokeWidth="2.5" />

          {/* fill under the curve */}
          <path
            d={`${landscapePath} L ${sx(X_MAX)} ${sy(Y_MIN)} L ${sx(X_MIN)} ${sy(Y_MIN)} Z`}
            fill="#E5DFD2"
            opacity="0.15"
          />

          {/* trail */}
          {ballPath.length > 1 &&
            ballPath.slice(0, -1).map((bx, i) => (
              <circle
                key={i}
                cx={sx(bx)}
                cy={sy(landscape(bx))}
                r="2"
                fill="#E05C4A"
                opacity={0.3}
              />
            ))}

          {/* ball */}
          <circle
            cx={sx(currentBallX)}
            cy={sy(landscape(currentBallX))}
            r="9"
            fill="#E05C4A"
            stroke="#FFFDF8"
            strokeWidth="2"
            style={{ transition: phase === "idle" ? "cx 200ms, cy 200ms" : "none" }}
          />

          {/* global min marker */}
          {phase === "revealed" && (
            <>
              <line
                x1={sx(GLOBAL_MIN_X)}
                y1={sy(landscape(GLOBAL_MIN_X)) + 12}
                x2={sx(GLOBAL_MIN_X)}
                y2={sy(landscape(GLOBAL_MIN_X)) + 30}
                stroke="#2A7F8C"
                strokeWidth="1.5"
              />
              <text
                x={sx(GLOBAL_MIN_X)}
                y={sy(landscape(GLOBAL_MIN_X)) + 42}
                fontSize="12"
                fill="#2A7F8C"
                textAnchor="middle"
                fontWeight="600"
              >
                global min
              </text>
            </>
          )}
        </svg>
        {phase === "idle" && (
          <div className="border-t border-border/60 px-5 py-3 text-xs italic text-muted">
            {labels.clickHint}
          </div>
        )}
      </div>

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { key: "global" as Choice, title: labels.optGlobal },
              { key: "local" as Choice, title: labels.optLocal },
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
