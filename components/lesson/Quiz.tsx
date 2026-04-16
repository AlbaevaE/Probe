"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import type { QuizItem } from "@/lib/graph-schema";

type Answers = Record<number, number>;

export function Quiz({
  items,
  passThreshold,
  onPass,
}: {
  items: QuizItem[];
  passThreshold?: number;
  onPass: () => void;
}) {
  const t = useTranslations("quiz");
  const min = passThreshold ?? Math.max(1, Math.ceil(items.length * 0.7));
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = items.reduce(
    (acc, item, idx) => (answers[idx] === item.correct ? acc + 1 : acc),
    0,
  );
  const passed = submitted && correctCount >= min;

  const submit = () => {
    if (Object.keys(answers).length !== items.length) return;
    setSubmitted(true);
    if (correctCount >= min) onPass();
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          {item.scenario && (
            <div className="rounded-md border-l-2 border-accent/50 bg-bg/50 px-3 py-2 text-xs italic leading-relaxed text-fg/80">
              {item.scenario}
            </div>
          )}
          <div className="text-sm font-semibold leading-snug">
            {idx + 1}. {item.question}
          </div>
          <div className="flex flex-col gap-1.5">
            {item.options.map((opt, optIdx) => {
              const selected = answers[idx] === optIdx;
              const isCorrect = submitted && optIdx === item.correct;
              const isWrong = submitted && selected && optIdx !== item.correct;
              return (
                <button
                  key={optIdx}
                  disabled={submitted}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, [idx]: optIdx }))
                  }
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    !submitted && selected && "border-accent bg-accent/10",
                    !submitted && !selected && "border-border hover:bg-bg",
                    isCorrect && "border-done/70 bg-done/10",
                    isWrong && "border-red-500/60 bg-red-500/10",
                    submitted && !selected && !isCorrect && "border-border opacity-60",
                  )}
                  data-testid={`quiz-${idx}-opt-${optIdx}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && item.explanation && (
            <p className="text-xs text-muted">{item.explanation}</p>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {!submitted ? (
          <button
            onClick={submit}
            disabled={Object.keys(answers).length !== items.length}
            className="rounded-full border border-accent/50 bg-accent/10 px-4 py-1.5 text-sm disabled:opacity-40"
            data-testid="quiz-submit"
          >
            {t("submit")}
          </button>
        ) : (
          <button
            onClick={reset}
            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-bg"
          >
            {t("retry")}
          </button>
        )}
        {submitted && (
          <span className="text-sm" data-testid="quiz-score">
            {t("score", { correct: correctCount, total: items.length })} ·{" "}
            <span className={passed ? "text-done" : "text-muted"}>
              {passed ? t("passed") : t("failed")}
            </span>
          </span>
        )}
        {!submitted && (
          <span className="text-xs text-muted">
            {t("pass", { min })}
          </span>
        )}
      </div>
    </div>
  );
}
