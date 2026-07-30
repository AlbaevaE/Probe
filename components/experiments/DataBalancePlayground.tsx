"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { mulberry32 } from "@/lib/rng";

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
  iconA: string;
  iconB: string;
  accuracyLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "yes" | "no";

export type Group = "A" | "B";
export type Sample = { features: [number, number]; label: Group };

/* ── the data ───────────────────────────────────────────────── */
// Two genuinely distinguishable groups: same spread, different centres, with
// enough overlap that the classifier has to weigh evidence rather than read
// the answer off. Nothing here is rigged toward the majority — the imbalance
// alone does the damage, which is the whole point of the experiment.
export const TRAIN_MAJORITY = 36;
export const TRAIN_MINORITY = 4;
export const TEST_PER_GROUP = 10;
const CENTER_A = 4.0;
const CENTER_B = 6.8;
const SPREAD = 1.8;

function gauss(rng: () => number, mean: number, std: number): number {
  const u = 1 - rng();
  const v = rng();
  return mean + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std;
}

function draw(rng: () => number, n: number, label: Group): Sample[] {
  const center = label === "A" ? CENTER_A : CENTER_B;
  return Array.from({ length: n }, () => ({
    features: [gauss(rng, center, SPREAD), gauss(rng, center, SPREAD)] as [number, number],
    label,
  }));
}

// Training counts are parameters so the balanced counterfactual (what the same
// classifier does on the same distributions when the data is fair) is testable.
export function generateData(
  seed: number,
  majority: number = TRAIN_MAJORITY,
  minority: number = TRAIN_MINORITY,
) {
  const rng = mulberry32(seed);
  const train = [...draw(rng, majority, "A"), ...draw(rng, minority, "B")];
  // Test set is always balanced — the model is judged on both groups equally.
  const test = [...draw(rng, TEST_PER_GROUP, "A"), ...draw(rng, TEST_PER_GROUP, "B")];
  return { train, test };
}

/* ── the model ──────────────────────────────────────────────── */
// Gaussian naive Bayes: per-group mean and variance for each feature, plus the
// class prior. The prior is where the imbalance bites — with 36 vs 4 examples
// it adds log(9) ≈ 2.2 in favour of the majority, and near the boundary that
// outweighs what the features actually say.
export type ClassStats = Record<Group, { mean: number[]; variance: number[]; prior: number }>;

// Floor on the variance: with 4 examples the minority estimate can collapse to
// near zero and make the likelihood explode. Standard smoothing, not a thumb
// on the scale — it makes the minority's bell wider, i.e. more forgiving.
const VARIANCE_FLOOR = 0.35;

export function trainNaiveBayes(train: Sample[]): ClassStats {
  const fit = (group: Group) => {
    const rows = train.filter((s) => s.label === group);
    const mean = [0, 1].map(
      (j) => rows.reduce((acc, s) => acc + s.features[j], 0) / rows.length,
    );
    const variance = [0, 1].map((j) =>
      Math.max(
        VARIANCE_FLOOR,
        rows.reduce((acc, s) => acc + (s.features[j] - mean[j]) ** 2, 0) / rows.length,
      ),
    );
    return { mean, variance, prior: rows.length / train.length };
  };
  return { A: fit("A"), B: fit("B") };
}

export function classify(stats: ClassStats, features: [number, number]): Group {
  const logScore = (group: Group) => {
    const { mean, variance, prior } = stats[group];
    let score = Math.log(prior);
    for (let j = 0; j < 2; j++) {
      score +=
        -0.5 * Math.log(2 * Math.PI * variance[j]) -
        (features[j] - mean[j]) ** 2 / (2 * variance[j]);
    }
    return score;
  };
  return logScore("A") >= logScore("B") ? "A" : "B";
}

export function accuracy(stats: ClassStats, test: Sample[], group: Group) {
  const rows = test.filter((s) => s.label === group);
  if (rows.length === 0) return 0;
  const correct = rows.filter((s) => classify(stats, s.features) === group).length;
  return Math.round((correct / rows.length) * 100);
}

export function DataBalancePlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(42);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "revealed">("idle");

  const { train, test } = useMemo(() => generateData(seed), [seed]);
  const stats = useMemo(() => trainNaiveBayes(train), [train]);
  const accA = useMemo(() => accuracy(stats, test, "A"), [stats, test]);
  const accB = useMemo(() => accuracy(stats, test, "B"), [stats, test]);

  // The imbalance costs the minority group most of its accuracy, so "no" is
  // normally right — but the verdict is read off the actual run, not assumed.
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
            <div className="flex flex-wrap gap-1.5 text-lg leading-none">
              {train
                .filter((s) => s.label === "A")
                .map((_, i) => (
                  <span key={`a-${i}`} aria-hidden>
                    {labels.iconA}
                  </span>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{labels.groupB}</span>
              <span className="text-xs text-muted">({bCountTrain})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-lg leading-none">
              {train
                .filter((s) => s.label === "B")
                .map((_, i) => (
                  <span key={`b-${i}`} aria-hidden>
                    {labels.iconB}
                  </span>
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
                  style={{ width: `${accA}%`, background: "#2A7F8C" }}
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
                  style={{ width: `${accB}%`, background: "#E05C4A" }}
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
