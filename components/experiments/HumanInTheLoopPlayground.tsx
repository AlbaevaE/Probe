"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optSolo: string;
  optHuman: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  case1: string;
  case2: string;
  case3: string;
  case4: string;
  case5: string;
  stakesLabel: string;
  stakesLow: string;
  stakesHigh: string;
  rubricHeading: string;
  rubricBody: string;
  agreeLabel: string;
  disagreeLabel: string;
  scoreLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "solo" | "human";

type Case = {
  text: string;
  correct: Choice;
  stakes: "low" | "high";
};

export function HumanInTheLoopPlayground({ labels }: { labels: Labels }) {
  const cases: Case[] = [
    { text: labels.case1, correct: "solo", stakes: "low" },
    { text: labels.case2, correct: "human", stakes: "high" },
    { text: labels.case3, correct: "solo", stakes: "low" },
    { text: labels.case4, correct: "human", stakes: "high" },
    { text: labels.case5, correct: "human", stakes: "high" },
  ];

  const [answers, setAnswers] = useState<(Choice | null)[]>(
    new Array(cases.length).fill(null),
  );
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");
  const [animStep, setAnimStep] = useState(0);

  const allAnswered = answers.every((a) => a !== null);

  useEffect(() => {
    if (phase !== "running") return;
    setAnimStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < cases.length; i++) {
      timers.push(setTimeout(() => setAnimStep(i + 1), 300 + i * 300));
    }
    timers.push(
      setTimeout(() => setPhase("revealed"), 300 + cases.length * 300 + 200),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, cases.length]);

  const onRun = () => {
    if (!allAnswered) return;
    setPhase("running");
  };

  const onReshuffle = () => {
    setAnswers(new Array(cases.length).fill(null));
    setPhase("idle");
    setAnimStep(0);
  };

  const correctCount = answers.filter(
    (a, i) => a === cases[i].correct,
  ).length;
  const isGood = correctCount >= 4;

  const setAt = (idx: number, c: Choice) => {
    if (phase !== "idle") return;
    const next = [...answers];
    next[idx] = c;
    setAnswers(next);
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
        <h3 className="text-sm font-semibold text-muted">{labels.prediction}</h3>
        {cases.map((c, i) => {
          const answered = answers[i];
          const revealed = phase === "revealed" || animStep > i;
          const isCorrect = revealed && answered === c.correct;
          const isWrong = revealed && answered && answered !== c.correct;
          return (
            <div
              key={i}
              className={clsx(
                "rounded-xl border px-4 py-3 transition",
                isCorrect
                  ? "border-done/50 bg-done/5"
                  : isWrong
                    ? "border-accent/50 bg-accent/5"
                    : "border-border bg-surface/60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold leading-relaxed">{c.text}</p>
                {revealed && (
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest",
                      c.stakes === "high"
                        ? "bg-accent/15 text-accent"
                        : "bg-done/15 text-done",
                    )}
                  >
                    {c.stakes === "high" ? labels.stakesHigh : labels.stakesLow}
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    { key: "solo" as Choice, title: labels.optSolo },
                    { key: "human" as Choice, title: labels.optHuman },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.key}
                    disabled={phase !== "idle"}
                    onClick={() => setAt(i, opt.key)}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-left text-xs transition",
                      answered === opt.key
                        ? "border-accent bg-accent/10 font-semibold"
                        : "border-border bg-bg/40 hover:border-accent/60",
                      phase !== "idle" && "cursor-not-allowed",
                    )}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>
              {revealed && answered && (
                <div className="mt-2 text-xs">
                  <span
                    className={clsx(
                      isCorrect ? "text-done" : "text-accent",
                      "font-semibold",
                    )}
                  >
                    {isCorrect ? labels.agreeLabel : labels.disagreeLabel}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {phase === "idle" && (
        <div className="flex items-center gap-4">
          <button
            onClick={onRun}
            disabled={!allAnswered}
            className={clsx(
              "rounded-full border border-accent/60 bg-accent/15 px-6 py-2.5 text-sm font-semibold transition",
              !allAnswered && "opacity-40",
              allAnswered && "hover:bg-accent/25",
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

          <div className="text-center">
            <span className="text-sm text-muted">{labels.scoreLabel}</span>
            <div className="text-4xl font-bold">
              {correctCount}/{cases.length}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg/40 px-4 py-3">
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.rubricHeading}
            </div>
            <p className="mt-1 text-sm text-fg/90">{labels.rubricBody}</p>
          </div>

          <div
            className={clsx(
              "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
              isGood ? "border-done/70" : "border-accent/70",
            )}
          >
            <div
              className={clsx(
                "text-[11px] uppercase tracking-widest",
                isGood ? "text-done" : "text-accent",
              )}
            >
              {isGood ? labels.deltaRightTitle : labels.deltaWrongTitle}
            </div>
            <p className="mt-1 text-sm text-fg/90">
              {isGood ? labels.deltaRightBody : labels.deltaWrongBody}
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
