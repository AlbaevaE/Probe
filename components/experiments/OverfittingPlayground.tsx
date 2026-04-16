"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { fitPolynomial, meanAbsoluteError, type Model } from "@/lib/fit";
import { generateHousingDataset } from "@/lib/dataset";

type Choice = "linear" | "quadratic" | "poly9";

type Labels = {
  label: string;
  title: string;
  situation: string;
  axesArea: string;
  axesPrice: string;
  trainMark: string;
  testMark: string;
  prediction: string;
  optLinear: string;
  optLinearHint: string;
  optQuadratic: string;
  optQuadraticHint: string;
  optPoly9: string;
  optPoly9Hint: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  errorOnTrain: string;
  errorOnTest: string;
  yourPick: string;
  winner: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
  deltaAlmostTitle: string;
  deltaAlmostBody: string;
};

const CURVES: Record<
  Choice,
  { color: string; dash?: string; label: string }
> = {
  linear: { color: "#4d6a23", label: "linear" },
  quadratic: { color: "#9b3e14", label: "quadratic" },
  poly9: { color: "#a83216", dash: "4 3", label: "poly9" },
};

const DEGREE: Record<Choice, number> = {
  linear: 1,
  quadratic: 2,
  poly9: 9,
};

export function OverfittingPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(42);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");
  const [animStep, setAnimStep] = useState(0);

  const { train, test } = useMemo(
    () => generateHousingDataset(seed),
    [seed],
  );

  const models = useMemo(() => {
    return {
      linear: fitPolynomial(train.xs, train.ys, 1),
      quadratic: fitPolynomial(train.xs, train.ys, 2),
      poly9: fitPolynomial(train.xs, train.ys, 9),
    } satisfies Record<Choice, Model>;
  }, [train]);

  const errors = useMemo(() => {
    return {
      linear: {
        train: meanAbsoluteError(models.linear, train.xs, train.ys),
        test: meanAbsoluteError(models.linear, test.xs, test.ys),
      },
      quadratic: {
        train: meanAbsoluteError(models.quadratic, train.xs, train.ys),
        test: meanAbsoluteError(models.quadratic, test.xs, test.ys),
      },
      poly9: {
        train: meanAbsoluteError(models.poly9, train.xs, train.ys),
        test: meanAbsoluteError(models.poly9, test.xs, test.ys),
      },
    };
  }, [models, train, test]);

  const winner = useMemo(() => {
    let best: Choice = "linear";
    let bestErr = errors.linear.test;
    for (const c of ["quadratic", "poly9"] as Choice[]) {
      if (errors[c].test < bestErr) {
        bestErr = errors[c].test;
        best = c;
      }
    }
    return best;
  }, [errors]);

  useEffect(() => {
    if (phase !== "running") return;
    setAnimStep(0);
    const steps = [500, 900, 1400, 2000, 2500];
    const timers = steps.map((ms, i) =>
      setTimeout(() => setAnimStep(i + 1), ms),
    );
    const done = setTimeout(() => setPhase("revealed"), 2600);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase]);

  const onRun = () => {
    if (!choice) return;
    setPhase("running");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setPhase("idle");
    setAnimStep(0);
  };

  const viewBox = { w: 520, h: 340 };
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const xMin = 15;
  const xMax = 225;
  const allYs = [...train.ys, ...test.ys];
  const yMin = Math.min(...allYs) - 40;
  const yMax = Math.max(...allYs) + 40;
  const sx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (viewBox.w - padL - padR);
  const sy = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (viewBox.h - padT - padB);

  const curvePath = (model: Model) => {
    const n = 220;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = xMin + (i / n) * (xMax - xMin);
      const y = model.predict(x);
      pts.push(`${i === 0 ? "M" : "L"} ${sx(x)} ${sy(Math.max(yMin - 200, Math.min(yMax + 200, y)))}`);
    }
    return pts.join(" ");
  };

  const curveVisible = (c: Choice) => {
    if (phase === "idle") return false;
    if (c === "linear") return animStep >= 1;
    if (c === "quadratic") return animStep >= 2;
    return animStep >= 3;
  };
  const testVisible = animStep >= 4;
  const errorsVisible = animStep >= 5 || phase === "revealed";

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
          viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
          className="h-auto w-full"
          style={{ fontFamily: 'ui-serif, "Iowan Old Style", Georgia, serif' }}
        >
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={viewBox.h - padB}
            stroke="#d6d0c8"
          />
          <line
            x1={padL}
            y1={viewBox.h - padB}
            x2={viewBox.w - padR}
            y2={viewBox.h - padB}
            stroke="#d6d0c8"
          />
          <text x={padL - 8} y={padT + 4} fontSize="13" fill="#6b5f54" textAnchor="end">
            {labels.axesPrice}
          </text>
          <text
            x={viewBox.w - padR}
            y={viewBox.h - padB + 24}
            fontSize="13"
            fill="#6b5f54"
            textAnchor="end"
          >
            {labels.axesArea}
          </text>

          {(Object.keys(CURVES) as Choice[]).map((c) => (
            <path
              key={c}
              d={curvePath(models[c])}
              fill="none"
              stroke={CURVES[c].color}
              strokeWidth={2.2}
              strokeDasharray={CURVES[c].dash}
              style={{
                opacity: curveVisible(c) ? 1 : 0,
                transition: "opacity 500ms ease-out",
              }}
            />
          ))}

          {train.xs.map((x, i) => (
            <circle
              key={`tr-${i}`}
              cx={sx(x)}
              cy={sy(train.ys[i])}
              r="5"
              fill="#9b3e14"
            />
          ))}

          {test.xs.map((x, i) => (
            <circle
              key={`te-${i}`}
              cx={sx(x)}
              cy={sy(test.ys[i])}
              r="4.5"
              fill="none"
              stroke="#2c2523"
              strokeWidth="1.5"
              style={{
                opacity: testVisible ? 1 : 0,
                transition: `opacity 500ms ease-out ${i * 50}ms`,
              }}
            />
          ))}
        </svg>
        <div className="flex flex-wrap items-center gap-4 border-t border-border/60 px-5 py-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            {labels.trainMark}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-fg" />
            {labels.testMark}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-accent">
          {labels.prediction}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              {
                key: "linear",
                title: labels.optLinear,
                hint: labels.optLinearHint,
              },
              {
                key: "quadratic",
                title: labels.optQuadratic,
                hint: labels.optQuadraticHint,
              },
              {
                key: "poly9",
                title: labels.optPoly9,
                hint: labels.optPoly9Hint,
              },
            ] as Array<{ key: Choice; title: string; hint: string }>
          ).map((opt) => (
            <button
              key={opt.key}
              data-testid={`option-${opt.key}`}
              disabled={phase !== "idle"}
              onClick={() => setChoice(opt.key)}
              className={clsx(
                "flex flex-col gap-1.5 rounded-xl border bg-surface/60 px-4 py-3 text-left transition",
                choice === opt.key
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/60",
                phase !== "idle" && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="font-semibold">{opt.title}</span>
              <span className="text-xs text-muted">{opt.hint}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            data-testid="run-button"
            onClick={onRun}
            disabled={!choice || phase !== "idle"}
            className={clsx(
              "rounded-full border border-accent/60 bg-accent/15 px-6 py-2.5 text-sm font-semibold transition",
              (!choice || phase !== "idle") && "opacity-40",
              choice && phase === "idle" && "hover:bg-accent/25",
            )}
          >
            {labels.run}
          </button>
          <span className="text-xs italic text-muted">{labels.runHint}</span>
        </div>
      </div>

      {phase === "revealed" && (
        <div data-testid="results-section" className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(CURVES) as Choice[]).map((c) => {
              const isPick = choice === c;
              const isWinner = winner === c;
              return (
                <div
                  key={c}
                  className={clsx(
                    "rounded-xl border px-4 py-3",
                    isWinner
                      ? "border-done/60 bg-done/10"
                      : "border-border bg-bg/30",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">
                      {c === "linear"
                        ? labels.optLinear
                        : c === "quadratic"
                          ? labels.optQuadratic
                          : labels.optPoly9}
                    </span>
                    {isPick && (
                      <span className="text-[10px] uppercase tracking-widest text-accent">
                        {labels.yourPick}
                      </span>
                    )}
                    {isWinner && (
                      <span className="text-[10px] uppercase tracking-widest text-done">
                        {labels.winner}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted">
                    <span>
                      {labels.errorOnTrain}:{" "}
                      <span className="text-fg">
                        {errors[c].train.toFixed(1)}
                      </span>
                    </span>
                    <span>
                      {labels.errorOnTest}:{" "}
                      <span className="text-fg">
                        {errors[c].test.toFixed(1)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Delta choice={choice!} winner={winner} labels={labels} />
          <div>
            <button
              data-testid="reshuffle-button"
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

function Delta({
  choice,
  winner,
  labels,
}: {
  choice: Choice;
  winner: Choice;
  labels: Labels;
}) {
  if (choice === "poly9") {
    return (
      <div className="rounded-xl border-l-2 border-accent/70 bg-bg/40 px-4 py-3">
        <div className="text-[11px] uppercase tracking-widest text-accent">
          {labels.deltaWrongTitle}
        </div>
        <p className="mt-1 text-sm text-fg/90">{labels.deltaWrongBody}</p>
      </div>
    );
  }
  if (choice === winner) {
    return (
      <div className="rounded-xl border-l-2 border-done/70 bg-bg/40 px-4 py-3">
        <div className="text-[11px] uppercase tracking-widest text-done">
          {labels.deltaRightTitle}
        </div>
        <p className="mt-1 text-sm text-fg/90">{labels.deltaRightBody}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border-l-2 border-muted/70 bg-bg/40 px-4 py-3">
      <div className="text-[11px] uppercase tracking-widest text-muted">
        {labels.deltaAlmostTitle}
      </div>
      <p className="mt-1 text-sm text-fg/90">{labels.deltaAlmostBody}</p>
    </div>
  );
}
