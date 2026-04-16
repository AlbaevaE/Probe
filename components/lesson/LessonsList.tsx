"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useProgress, statusOf, missingPrerequisites } from "@/lib/progress";

type Item = {
  id: string;
  title: string;
  summary: string;
  group?: string;
  estimatedMinutes: number;
  prerequisites: string[];
};

export function LessonsList({ items }: { items: Item[] }) {
  const t = useTranslations("lesson");
  const done = useProgress((s) => s.done);
  const hydrated = useProgress((s) => s.hasHydrated);

  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, index) => {
        const status = hydrated
          ? statusOf(item.id, item.prerequisites, done)
          : item.prerequisites.length === 0
            ? "available"
            : "suggested";
        const missing = hydrated
          ? missingPrerequisites(item.prerequisites, done)
          : item.prerequisites;
        const missingTitles = missing
          .map((id) => items.find((l) => l.id === id)?.title)
          .filter((x): x is string => Boolean(x));

        return (
          <li key={item.id}>
            <Link href={`/lessons/${item.id}`} className="no-underline">
              <div
                className={clsx(
                  "group flex items-start gap-4 rounded-xl border px-4 py-3 transition",
                  status === "done" &&
                    "border-done/50 bg-surface hover:border-done/80",
                  status === "available" &&
                    "border-accent/40 bg-surface hover:border-accent/80",
                  status === "suggested" &&
                    "border-dashed border-border/80 bg-surface/60 hover:border-accent/60 hover:bg-surface",
                )}
                data-testid={`lesson-list-${item.id}`}
                data-status={status}
              >
                <div
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    status === "done" &&
                      "border-done/60 bg-done/10 text-done",
                    status === "available" &&
                      "border-accent/60 bg-accent/10 text-accent",
                    status === "suggested" &&
                      "border-dashed border-border text-muted",
                  )}
                >
                  {status === "done" ? "✓" : index + 1}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="text-base font-semibold">
                      {item.title}
                    </span>
                    {item.group && (
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        {item.group}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted">
                      {t("estimatedMinutes", { m: item.estimatedMinutes })}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{item.summary}</p>
                  {status === "suggested" && missingTitles.length > 0 && (
                    <p className="text-xs italic text-muted">
                      {t("prereqHint")}: {missingTitles.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
