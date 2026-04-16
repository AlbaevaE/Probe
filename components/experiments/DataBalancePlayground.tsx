"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optYes: string;
  optNo: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  groupA: string;
  groupB: string;
  accuracyLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "yes" | "no";

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

type Sample = { features: number[]; label: "A" | "B" };

function generateData(seed: number) {
  const rng = mulberry32(seed);

  // Training set: 90% group A, 10% group B (imbalanced!)
  const train: Sample[] = [];
  for (let i = 0; i < 36; i++) {
    train.push({
      features: [rng() * 10, rng() * 10],
      label: "A",
    });
  }
  for (let i = 0; i < 4; i++) {
    train.push({
      features: [rng() * 10, rng() * 10],
      label: "B",
    });
  }

  // Test set: 50/50 balanced
  const test: Sample[] = [];
  for (let i = 0; i < 10; i++) {
    test.push({ features: [rng() * 10, rng() * 10], label: "A" });
  }
  for (let i = 0; i < 10; i++) {
    test.push({ features: [rng() * 10, rng() * 10], label: "B" });
  }

  return { train, test };
}

// Simulate a "lazy" classifier that learned to always predict the majority class
function predict(train: Sample[]): "A" | "B" {
  const aCount = train.filter((s) => s.label === "A").length;
  return aCount >= train.length / 2 ? "A" : "B";
}

function accuracy(prediction: "A" | "B", test: Sample[], group: "A" | "B") {
  const groupSamples = test.filter((s) => s.label === group);
  if (groupSamples.length === 0) return 0;
  const correct = groupSamples.filter((s) => prediction === s.label).length;
  return Math.round((correct / groupSamples.length) * 100);
}

const BAR_W = 200;
const BAR_H = 24;

export function DataBalancePlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(42);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "revealed">("idle");

  const { train, test } = useMemo(() => generateData(seed), [seed]);
  const modelPrediction = useMemo(() => predict(train), [train]);
  const accA = useMemo(() => accuracy(modelPrediction, test, "A"), [modelPrediction, test]);
  const accB = useMemo(() => accuracy(modelPrediction, test, "B"), [modelPrediction, test]);

  // The model always predicts A, so it gets ~100% on A and ~0% on B
  // The "fair" answer is "no" — it won't be fair to both groups
  const isFair = Math.abs(accA - accB) < 20;
  const correctAnswer: Choice = isFair ? "yes" : "no";

  const aCountTrain = train.filter((s) => s.label === "A").length;
  const bCountTrain = train.filter((s) => s.label === "B").length;

  const onRun = () => {
    if (!choice) return;
    setPhase("revealed");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setPhase("idle");
  };

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

      {/* training data visualization */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{labels.groupA}</span>
              <span className="text-xs text-muted">({aCountTrain})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {train
                .filter((s) => s.label === "A")
                .map((_, i) => (
                  <div
                    key={`a-${i}`}
                    className="h-4 w-4 rounded-full"
                    style={{ background: "#9b3e14" }}
                  />
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{labels.groupB}</span>
              <span className="text-xs text-muted">({bCountTrain})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {train
                .filter((s) => s.label === "B")
                .map((_, i) => (
                  <div
                    key={`b-${i}`}
                    className="h-4 w-4 rounded-full"
                    style={{ background: "#2d6a9f" }}
                  />
                ))}
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
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { key: "yes" as Choice, title: labels.optYes },
              { key: "no" as Choice, title: labels.optNo },
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{labels.groupA}</span>
                <span className="text-sm text-muted">{labels.accuracyLabel}: {accA}%</span>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-bg/60">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${accA}%`, background: "#4d6a23" }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{labels.groupB}</span>
                <span className="text-sm text-muted">{labels.accuracyLabel}: {accB}%</span>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-bg/60">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${accB}%`, background: "#9b3e14" }}
                />
              </div>
            </div>
          </div>
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
