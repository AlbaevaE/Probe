"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optCorrect: string;
  optWrong: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  probabilityLabel: string;
  modelPicks: string;
  correctAnswer: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
  whatToDo: string;
  tipsList: string;
  recordedNote: string;
};

type Choice = "correct" | "wrong";

type Scenario = {
  prompt: string;
  candidates: { word: string; prob: number; isCorrect: boolean }[];
  modelPick: number; // index the model chooses (highest prob, often wrong)
  correctIdx: number;
  explanation: string;
};

const SCENARIOS: Scenario[] = [
  {
    prompt: "Столица Австралии — это...",
    candidates: [
      { word: "Сидней", prob: 0.42, isCorrect: false },
      { word: "Мельбурн", prob: 0.28, isCorrect: false },
      { word: "Канберра", prob: 0.22, isCorrect: true },
      { word: "Перт", prob: 0.08, isCorrect: false },
    ],
    modelPick: 0,
    correctIdx: 2,
    explanation: "sydneyCapital",
  },
  {
    prompt: "Самая длинная река в мире — это...",
    candidates: [
      { word: "Нил", prob: 0.55, isCorrect: false },
      { word: "Амазонка", prob: 0.30, isCorrect: true },
      { word: "Миссисипи", prob: 0.10, isCorrect: false },
      { word: "Янцзы", prob: 0.05, isCorrect: false },
    ],
    modelPick: 0,
    correctIdx: 1,
    explanation: "nileRiver",
  },
  {
    prompt: "Автор «Гамлета» родился в ... году.",
    candidates: [
      { word: "1564", prob: 0.35, isCorrect: true },
      { word: "1592", prob: 0.30, isCorrect: false },
      { word: "1600", prob: 0.20, isCorrect: false },
      { word: "1550", prob: 0.15, isCorrect: false },
    ],
    modelPick: 0,
    correctIdx: 0,
    explanation: "shakespeareCorrect",
  },
  {
    prompt: "Количество планет в Солнечной системе —",
    candidates: [
      { word: "9", prob: 0.38, isCorrect: false },
      { word: "8", prob: 0.35, isCorrect: true },
      { word: "10", prob: 0.17, isCorrect: false },
      { word: "7", prob: 0.10, isCorrect: false },
    ],
    modelPick: 0,
    correctIdx: 1,
    explanation: "planetCount",
  },
];

export function HallucinationPlayground({ labels }: { labels: Labels }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");
  const [animStep, setAnimStep] = useState(0);

  const scenario = SCENARIOS[scenarioIdx % SCENARIOS.length];
  const modelIsCorrect = scenario.candidates[scenario.modelPick].isCorrect;
  const correctAnswer: Choice = modelIsCorrect ? "correct" : "wrong";

  useEffect(() => {
    if (phase !== "running") return;
    setAnimStep(0);
    const timers = [
      setTimeout(() => setAnimStep(1), 400),
      setTimeout(() => setAnimStep(2), 900),
      setTimeout(() => setAnimStep(3), 1400),
      setTimeout(() => setAnimStep(4), 1900),
      setTimeout(() => setPhase("revealed"), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const onRun = () => {
    if (!choice) return;
    setPhase("running");
  };

  const onReshuffle = () => {
    setScenarioIdx((i) => i + 1);
    setChoice(null);
    setPhase("idle");
    setAnimStep(0);
  };

  const isRight = choice === correctAnswer;

  const maxProb = Math.max(...scenario.candidates.map((c) => c.prob));

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
        <p className="max-w-2xl text-[11px] italic text-muted/80">
          {labels.recordedNote}
        </p>
      </header>

      {/* prompt display */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="rounded-xl bg-bg/60 px-4 py-3 font-mono text-sm">
          {scenario.prompt}
          <span className="animate-pulse text-accent"> ▌</span>
        </div>
      </div>

      {/* probability bars */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted">{labels.probabilityLabel}</h3>
        <div className="flex flex-col gap-3">
          {scenario.candidates.map((c, i) => {
            const barWidth = (c.prob / maxProb) * 100;
            const visible = phase === "idle" || animStep >= i + 1;
            const isPick = phase === "revealed" && i === scenario.modelPick;
            const isCorrectOne = phase === "revealed" && c.isCorrect;
            return (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  opacity: visible ? 1 : 0.15,
                  transition: "opacity 400ms ease-out",
                }}
              >
                <span
                  className={clsx(
                    "w-20 shrink-0 text-right text-sm font-semibold sm:w-24",
                    isPick && !c.isCorrect && "text-accent",
                    isCorrectOne && "text-done",
                  )}
                >
                  {c.word}
                </span>
                <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-bg/60">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-500",
                      isPick && !c.isCorrect
                        ? "bg-accent/60"
                        : isCorrectOne
                          ? "bg-done/60"
                          : "bg-muted/30",
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-fg/60">
                    {(c.prob * 100).toFixed(0)}%
                  </span>
                </div>
                {isPick && (
                  <span className="text-[10px] uppercase tracking-widest text-accent">
                    {labels.modelPicks}
                  </span>
                )}
                {isCorrectOne && !isPick && (
                  <span className="text-[10px] uppercase tracking-widest text-done">
                    {labels.correctAnswer}
                  </span>
                )}
              </div>
            );
          })}
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
              { key: "correct" as Choice, title: labels.optCorrect },
              { key: "wrong" as Choice, title: labels.optWrong },
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

          {/* what to do about hallucinations */}
          <div className="rounded-xl border border-border bg-bg/40 px-4 py-3">
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.whatToDo}
            </div>
            <p className="mt-1 text-sm text-fg/90 whitespace-pre-line">{labels.tipsList}</p>
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
