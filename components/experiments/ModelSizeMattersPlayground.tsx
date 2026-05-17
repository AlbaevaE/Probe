"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optSmall: string;
  optSmallHint: string;
  optMedium: string;
  optMediumHint: string;
  optLarge: string;
  optLargeHint: string;
  run: string;
  runHint: string;
  task1: string;
  task1Answer: string;
  task2: string;
  task2Answer: string;
  task3: string;
  task3Answer: string;
  taskHeading: string;
  latencyLabel: string;
  energyLabel: string;
  qualityLabel: string;
  qualityGood: string;
  qualityOk: string;
  qualityPoor: string;
  resultsHeading: string;
  reshuffle: string;
  yourPick: string;
  smartPick: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaOverkillTitle: string;
  deltaOverkillBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "small" | "medium" | "large";

type Difficulty = "trivial" | "moderate" | "complex";

type Task = {
  prompt: string;
  answer: string;
  difficulty: Difficulty;
  smartPick: Choice;
};

const LATENCY: Record<Choice, number> = {
  small: 120,
  medium: 600,
  large: 2200,
};
const ENERGY: Record<Choice, number> = {
  small: 1,
  medium: 8,
  large: 40,
};

function qualityFor(task: Task, model: Choice): "good" | "ok" | "poor" {
  if (task.difficulty === "trivial") return "good";
  if (task.difficulty === "moderate") {
    if (model === "small") return "ok";
    return "good";
  }
  if (model === "small") return "poor";
  if (model === "medium") return "ok";
  return "good";
}

export function ModelSizeMattersPlayground({ labels }: { labels: Labels }) {
  const tasks: Task[] = [
    {
      prompt: labels.task1,
      answer: labels.task1Answer,
      difficulty: "trivial",
      smartPick: "small",
    },
    {
      prompt: labels.task2,
      answer: labels.task2Answer,
      difficulty: "moderate",
      smartPick: "medium",
    },
    {
      prompt: labels.task3,
      answer: labels.task3Answer,
      difficulty: "complex",
      smartPick: "large",
    },
  ];

  const [picks, setPicks] = useState<(Choice | null)[]>(
    new Array(tasks.length).fill(null),
  );
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");
  const [runStep, setRunStep] = useState(0);
  const [tick, setTick] = useState(0);
  const startRef = useRef(0);

  const allPicked = picks.every((p) => p !== null);

  useEffect(() => {
    if (phase !== "running") return;
    setRunStep(0);
    startRef.current = performance.now();

    const delays = picks.map((p) => (p ? LATENCY[p] : 0));
    const cumulative: number[] = [];
    delays.reduce((acc, d, i) => {
      cumulative[i] = acc + d;
      return acc + d;
    }, 0);

    const timers = cumulative.map((c, i) =>
      setTimeout(() => setRunStep(i + 1), c),
    );
    const done = setTimeout(
      () => setPhase("revealed"),
      cumulative[cumulative.length - 1] + 200,
    );

    let raf = 0;
    const loop = () => {
      setTick(performance.now() - startRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
      cancelAnimationFrame(raf);
    };
  }, [phase, picks]);

  const onRun = () => {
    if (!allPicked) return;
    setPhase("running");
  };

  const onReshuffle = () => {
    setPicks(new Array(tasks.length).fill(null));
    setPhase("idle");
    setRunStep(0);
    setTick(0);
  };

  const totalEnergy = picks.reduce<number>(
    (sum, p) => sum + (p ? ENERGY[p] : 0),
    0,
  );
  const smartEnergy = tasks.reduce<number>(
    (sum, t) => sum + ENERGY[t.smartPick],
    0,
  );
  const totalLatency = picks.reduce<number>(
    (sum, p) => sum + (p ? LATENCY[p] : 0),
    0,
  );

  const anyOverkill = picks.some((p, i) => {
    const t = tasks[i];
    if (!p) return false;
    if (t.difficulty === "trivial" && p !== "small") return true;
    if (t.difficulty === "moderate" && p === "large") return true;
    return false;
  });
  const anyUnderkill = picks.some((p, i) => {
    const t = tasks[i];
    if (!p) return false;
    if (t.difficulty === "complex" && p !== "large") return true;
    if (t.difficulty === "moderate" && p === "small") return true;
    return false;
  });
  const matchedAll = picks.every((p, i) => p === tasks[i].smartPick);

  const qualityText = (q: "good" | "ok" | "poor") =>
    q === "good" ? labels.qualityGood : q === "ok" ? labels.qualityOk : labels.qualityPoor;

  const setPick = (idx: number, c: Choice) => {
    if (phase !== "idle") return;
    const next = [...picks];
    next[idx] = c;
    setPicks(next);
  };

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

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">{labels.taskHeading}</h3>
        {tasks.map((task, i) => {
          const pick = picks[i];
          const executed = phase === "running" ? runStep > i : phase === "revealed";
          const running = phase === "running" && runStep === i;
          const quality = pick ? qualityFor(task, pick) : null;
          return (
            <div
              key={i}
              className={clsx(
                "rounded-xl border px-4 py-3 transition",
                running
                  ? "border-accent bg-accent/10"
                  : executed
                    ? "border-border bg-bg/30"
                    : "border-border bg-surface/60",
              )}
            >
              <div className="mb-2 font-semibold">{task.prompt}</div>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { key: "small" as Choice, title: labels.optSmall },
                    { key: "medium" as Choice, title: labels.optMedium },
                    { key: "large" as Choice, title: labels.optLarge },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.key}
                    disabled={phase !== "idle"}
                    onClick={() => setPick(i, opt.key)}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-xs transition",
                      pick === opt.key
                        ? "border-accent bg-accent/10 font-semibold"
                        : "border-border bg-bg/40 hover:border-accent/60",
                      phase !== "idle" && "cursor-not-allowed",
                    )}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>
              {executed && pick && (
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                  <div>
                    <span className="text-muted">{labels.latencyLabel}: </span>
                    <span className="font-semibold">{LATENCY[pick]} ms</span>
                  </div>
                  <div>
                    <span className="text-muted">{labels.energyLabel}: </span>
                    <span className="font-semibold">{ENERGY[pick]} ⚡</span>
                  </div>
                  <div>
                    <span className="text-muted">{labels.qualityLabel}: </span>
                    <span
                      className={clsx(
                        "font-semibold",
                        quality === "good"
                          ? "text-done"
                          : quality === "ok"
                            ? "text-fg"
                            : "text-accent",
                      )}
                    >
                      {quality && qualityText(quality)}
                    </span>
                  </div>
                </div>
              )}
              {executed && (
                <div className="mt-2 text-xs text-muted">
                  → {task.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {phase === "running" && (
        <div className="text-center text-xs text-muted">
          {tick.toFixed(0)} / {totalLatency} ms
        </div>
      )}

      {phase === "idle" && (
        <div className="flex items-center gap-4">
          <button
            onClick={onRun}
            disabled={!allPicked}
            className={clsx(
              "rounded-full border border-accent/60 bg-accent/15 px-6 py-2.5 text-sm font-semibold transition",
              !allPicked && "opacity-40",
              allPicked && "hover:bg-accent/25",
            )}
          >
            {labels.run}
          </button>
          <span className="text-xs italic text-muted">{labels.runHint}</span>
        </div>
      )}

      {phase === "revealed" && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-bg/30 px-4 py-3">
              <div className="text-[11px] uppercase tracking-widest text-muted">
                {labels.yourPick}
              </div>
              <div className="mt-1 text-2xl font-bold">{totalEnergy} ⚡</div>
              <div className="text-xs text-muted">{totalLatency} ms</div>
            </div>
            <div className="rounded-xl border border-done/40 bg-done/5 px-4 py-3">
              <div className="text-[11px] uppercase tracking-widest text-done">
                {labels.smartPick}
              </div>
              <div className="mt-1 text-2xl font-bold">{smartEnergy} ⚡</div>
              <div className="text-xs text-muted">
                {tasks.reduce((s, t) => s + LATENCY[t.smartPick], 0)} ms
              </div>
            </div>
          </div>

          {(() => {
            const kind = matchedAll
              ? "right"
              : anyUnderkill
                ? "underkill"
                : "overkill";
            const title =
              kind === "right"
                ? labels.deltaRightTitle
                : kind === "overkill"
                  ? labels.deltaOverkillTitle
                  : labels.deltaWrongTitle;
            const body =
              kind === "right"
                ? labels.deltaRightBody
                : kind === "overkill"
                  ? labels.deltaOverkillBody
                  : labels.deltaWrongBody;
            const tone =
              kind === "right"
                ? "border-done/70 text-done"
                : kind === "overkill"
                  ? "border-muted/70 text-muted"
                  : "border-accent/70 text-accent";
            return (
              <div className={clsx("rounded-xl border-l-2 bg-bg/40 px-4 py-3", tone.split(" ")[0])}>
                <div
                  className={clsx(
                    "text-[11px] uppercase tracking-widest",
                    tone.split(" ")[1],
                  )}
                >
                  {title}
                </div>
                <p className="mt-1 text-sm text-fg/90">{body}</p>
              </div>
            );
          })()}

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
