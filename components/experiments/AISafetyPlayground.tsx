"use client";

import { useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optSafe: string;
  optRisky: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  scenario1: string;
  scenario1Answer: string;
  scenario1Why: string;
  scenario2: string;
  scenario2Answer: string;
  scenario2Why: string;
  scenario3: string;
  scenario3Answer: string;
  scenario3Why: string;
  scenario4: string;
  scenario4Answer: string;
  scenario4Why: string;
  scenario5: string;
  scenario5Answer: string;
  scenario5Why: string;
  scoreLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "safe" | "risky";

type Scenario = {
  text: string;
  answer: Choice;
  answerLabel: string;
  why: string;
};

function getScenarios(labels: Labels): Scenario[] {
  return [
    {
      text: labels.scenario1,
      answer: "safe",
      answerLabel: labels.scenario1Answer,
      why: labels.scenario1Why,
    },
    {
      text: labels.scenario2,
      answer: "risky",
      answerLabel: labels.scenario2Answer,
      why: labels.scenario2Why,
    },
    {
      text: labels.scenario3,
      answer: "safe",
      answerLabel: labels.scenario3Answer,
      why: labels.scenario3Why,
    },
    {
      text: labels.scenario4,
      answer: "risky",
      answerLabel: labels.scenario4Answer,
      why: labels.scenario4Why,
    },
    {
      text: labels.scenario5,
      answer: "risky",
      answerLabel: labels.scenario5Answer,
      why: labels.scenario5Why,
    },
  ];
}

export function AISafetyPlayground({ labels }: { labels: Labels }) {
  const scenarios = getScenarios(labels);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(Choice | null)[]>(
    new Array(scenarios.length).fill(null),
  );
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"answering" | "revealed">("answering");

  const scenario = scenarios[currentIdx];
  const allAnswered = answers.every((a) => a !== null);

  const onAnswer = () => {
    if (!choice) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = choice;
    setAnswers(newAnswers);

    if (currentIdx < scenarios.length - 1) {
      setCurrentIdx((i) => i + 1);
      setChoice(null);
    } else {
      setPhase("revealed");
    }
  };

  const onReshuffle = () => {
    setCurrentIdx(0);
    setAnswers(new Array(scenarios.length).fill(null));
    setChoice(null);
    setPhase("answering");
  };

  const correctCount = answers.filter(
    (a, i) => a === scenarios[i].answer,
  ).length;
  const isGood = correctCount >= 4;

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

      {/* progress dots */}
      <div className="flex items-center gap-2">
        {scenarios.map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-2.5 w-2.5 rounded-full transition",
              i === currentIdx && phase === "answering"
                ? "bg-accent"
                : answers[i] !== null
                  ? answers[i] === scenarios[i].answer
                    ? "bg-done"
                    : "bg-accent/50"
                  : "bg-border",
            )}
          />
        ))}
      </div>

      {/* current scenario */}
      {phase === "answering" && (
        <>
          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <div className="text-xs text-muted">
              {currentIdx + 1}/{scenarios.length}
            </div>
            <p className="mt-2 text-lg font-semibold leading-relaxed">
              {scenario.text}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold text-accent">
              {labels.prediction}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { key: "safe" as Choice, title: labels.optSafe },
                { key: "risky" as Choice, title: labels.optRisky },
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
                onClick={onAnswer}
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
        </>
      )}

      {/* results */}
      {phase === "revealed" && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>

          <div className="text-center">
            <span className="text-sm text-muted">{labels.scoreLabel}</span>
            <div className="text-4xl font-bold">
              {correctCount}/{scenarios.length}
            </div>
          </div>

          {/* all scenarios with answers */}
          <div className="flex flex-col gap-3">
            {scenarios.map((s, i) => {
              const userAnswer = answers[i];
              const correct = userAnswer === s.answer;
              return (
                <div
                  key={i}
                  className={clsx(
                    "rounded-xl border px-4 py-3",
                    correct
                      ? "border-done/40 bg-done/5"
                      : "border-accent/40 bg-accent/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{s.text}</p>
                    <span
                      className={clsx(
                        "shrink-0 text-[10px] uppercase tracking-widest",
                        correct ? "text-done" : "text-accent",
                      )}
                    >
                      {correct ? "+" : "−"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    <span className="font-semibold">{s.answerLabel}</span>
                    {" — "}
                    {s.why}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={clsx(
            "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
            isGood ? "border-done/70" : "border-accent/70",
          )}>
            <div className={clsx("text-[11px] uppercase tracking-widest", isGood ? "text-done" : "text-accent")}>
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
