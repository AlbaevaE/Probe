"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  recordedNote: string;
  contextLabel: string;
  contextSentence: string;
  word1: string;
  word2: string;
  word3: string;
  word4: string;
  word5: string;
  word6: string;
  prediction: string;
  optPrecise: string;
  optCreative: string;
  optRandom: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  samplesNote: string;
  tempLabel: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaAlmostTitle: string;
  deltaAlmostBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "precise" | "creative" | "random";
type Phase = "idle" | "running" | "revealed";

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

// Hand-authored logits for the six candidate words; the last two are
// words the model "knows" are bad fits (see recordedNote in the copy).
const LOGITS = [4.2, 3.1, 2.2, 1.0, -0.5, -2.0];
const NONSENSE_FROM = 4; // indices 4 and 5 are the absurd continuations
const TEMPERATURES = [0.2, 1.0, 2.0];
const N_SAMPLES = 40;

export function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map((l) => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function sampleCounts(
  probs: number[],
  n: number,
  rng: () => number,
): number[] {
  const counts = probs.map(() => 0);
  for (let i = 0; i < n; i++) {
    let r = rng();
    for (let j = 0; j < probs.length; j++) {
      r -= probs[j];
      if (r <= 0 || j === probs.length - 1) {
        counts[j]++;
        break;
      }
    }
  }
  return counts;
}

export function TemperaturePlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(7);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  const words = [
    labels.word1,
    labels.word2,
    labels.word3,
    labels.word4,
    labels.word5,
    labels.word6,
  ];

  // Real sampling, computed in the browser: 40 draws from softmax(logits/T)
  // for each temperature.
  const columns = useMemo(() => {
    const rng = mulberry32(seed);
    return TEMPERATURES.map((t) => {
      const probs = softmax(LOGITS, t);
      const counts = sampleCounts(probs, N_SAMPLES, rng);
      return { t, counts };
    });
  }, [seed]);

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= TEMPERATURES.length) {
      const done = setTimeout(() => setPhase("revealed"), 500);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 700);
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

  const outcome: "right" | "almost" | "wrong" | null =
    choice === "random" ? "right" : choice === "creative" ? "almost" : choice ? "wrong" : null;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "almost"
        ? { title: labels.deltaAlmostTitle, body: labels.deltaAlmostBody, done: false }
        : { title: labels.deltaWrongTitle, body: labels.deltaWrongBody, done: false };

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
        <p className="max-w-2xl text-xs italic text-muted">{labels.recordedNote}</p>
      </header>

      {/* context sentence */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="text-[11px] uppercase tracking-widest text-muted">
          {labels.contextLabel}
        </div>
        <p className="mt-2 font-display text-xl font-bold">
          {labels.contextSentence}{" "}
          <span className="rounded bg-accent/15 px-2 py-0.5 text-accent">?</span>
        </p>
      </div>

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: "precise" as Choice, title: labels.optPrecise },
              { key: "creative" as Choice, title: labels.optCreative },
              { key: "random" as Choice, title: labels.optRandom },
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

      {/* sampling columns */}
      {phase !== "idle" && (
        <div className="flex flex-col gap-4">
          <p className="text-xs italic text-muted">{labels.samplesNote}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {columns.map((col, ci) => {
              const visible = ci < animStep || phase === "revealed";
              const max = Math.max(...col.counts, 1);
              return (
                <div
                  key={col.t}
                  className={clsx(
                    "rounded-2xl border border-border bg-surface/60 p-4 transition-opacity duration-500",
                    visible ? "opacity-100" : "opacity-20",
                  )}
                >
                  <div className="mb-3 text-[11px] uppercase tracking-widest text-muted">
                    {labels.tempLabel} = {col.t}
                  </div>
                  <div className="flex flex-col gap-2">
                    {words.map((w, wi) => {
                      const count = visible ? col.counts[wi] : 0;
                      const isNonsense = wi >= NONSENSE_FROM;
                      return (
                        <div key={wi} className="flex items-center gap-2">
                          <span
                            className={clsx(
                              "w-24 shrink-0 truncate text-xs",
                              isNonsense && count > 0
                                ? "font-semibold text-accent"
                                : "text-fg/80",
                            )}
                          >
                            {w}
                          </span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-bg/60">
                            <div
                              className={clsx(
                                "h-full rounded-full transition-all duration-700",
                                isNonsense ? "bg-accent/80" : "bg-done/70",
                              )}
                              style={{ width: `${(count / max) * 100}%` }}
                            />
                          </div>
                          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
