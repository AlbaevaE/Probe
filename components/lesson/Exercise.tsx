"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Exercise as ExerciseType } from "@/lib/graph-schema";

export function Exercise({ exercise }: { exercise: ExerciseType }) {
  const t = useTranslations("exercise");
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    const norm = value.trim().toLowerCase();
    const ok = exercise.accept.some((a) => a.trim().toLowerCase() === norm);
    setState(ok ? "correct" : "wrong");
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <p className="text-fg/90">{exercise.prompt}</p>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (state !== "idle") setState("idle");
        }}
        placeholder={t("placeholder")}
        className="min-h-[80px] w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
        data-testid="exercise-input"
      />
      {exercise.hint && state === "wrong" && (
        <p className="text-xs text-muted">{exercise.hint}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={check}
          className="rounded-full border border-accent/50 bg-accent/10 px-4 py-1.5 text-sm hover:bg-accent/20"
          data-testid="exercise-check"
        >
          {t("check")}
        </button>
        <button
          onClick={() => setRevealed((r) => !r)}
          className="rounded-full border border-border px-4 py-1.5 text-sm text-muted hover:text-fg"
        >
          {t("reveal")}
        </button>
        {state === "correct" && (
          <span className="text-sm text-done">{t("correct")}</span>
        )}
        {state === "wrong" && (
          <span className="text-sm text-muted">{t("incorrect")}</span>
        )}
      </div>
      {revealed && (
        <div className="rounded-lg border border-border bg-bg/50 p-3 text-sm text-fg/80">
          {exercise.solution}
        </div>
      )}
    </div>
  );
}
