"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/routing";
import { useProgress, isAvailable, missingPrerequisites } from "@/lib/progress";
import { Exercise } from "./Exercise";
import { Quiz } from "./Quiz";
import { LessonHook } from "./LessonHook";
import { MissingPrereqsBanner } from "./MissingPrereqsBanner";
import { NextDoors } from "./NextDoors";
import type { LessonFrontmatter } from "@/lib/graph-schema";

type Labels = {
  back: string;
  backList: string;
  hook: string;
  concept: string;
  example: string;
  exercise: string;
  quiz: string;
  prev: string;
  nextDoors: string;
  noNext: string;
  prereqHint: string;
  minutes: string;
};

type LessonMeta = {
  id: string;
  title: string;
  prerequisites: string[];
  hookQuestion: string;
};

export function LessonShell({
  children,
  frontmatter,
  allLessons,
  labels,
  visual,
}: {
  children: ReactNode;
  frontmatter: LessonFrontmatter;
  allLessons: LessonMeta[];
  labels: Labels;
  visual?: ReactNode;
}) {
  const done = useProgress((s) => s.done);
  const hydrated = useProgress((s) => s.hasHydrated);
  const markDone = useProgress((s) => s.markDone);

  const missingIds = hydrated
    ? missingPrerequisites(frontmatter.prerequisites, done)
    : [];
  const missingMeta = missingIds
    .map((id) => allLessons.find((l) => l.id === id))
    .filter((x): x is LessonMeta => Boolean(x));

  const currentIndex = allLessons.findIndex((l) => l.id === frontmatter.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

  const doors = useMemo(() => {
    const picked: LessonMeta[] = [];
    const seen = new Set<string>([frontmatter.id]);

    // 1. Direct children: lessons that list the current one as a prerequisite.
    for (const lesson of allLessons) {
      if (seen.has(lesson.id)) continue;
      if (lesson.prerequisites.includes(frontmatter.id)) {
        picked.push(lesson);
        seen.add(lesson.id);
      }
    }

    // 2. Fill with any other available (prereqs met), not-done lessons.
    const doneWithCurrent = { ...done, [frontmatter.id]: true } as Record<
      string,
      true
    >;
    if (picked.length < 3) {
      for (const lesson of allLessons) {
        if (picked.length >= 3) break;
        if (seen.has(lesson.id)) continue;
        if (doneWithCurrent[lesson.id]) continue;
        if (isAvailable(lesson.prerequisites, doneWithCurrent)) {
          picked.push(lesson);
          seen.add(lesson.id);
        }
      }
    }

    return picked.slice(0, 3);
  }, [done, allLessons, frontmatter.id]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4 text-sm text-muted">
          <Link href="/lessons" className="no-underline hover:text-fg">
            ← {labels.backList}
          </Link>
          <Link href="/graph" className="no-underline hover:text-fg">
            {labels.back}
          </Link>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {frontmatter.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{labels.minutes}</span>
          {frontmatter.group && <span>· {frontmatter.group}</span>}
        </div>
        <p className="max-w-2xl text-muted">{frontmatter.summary}</p>
        <MissingPrereqsBanner missing={missingMeta} label={labels.prereqHint} />
      </div>

      <div
        className={clsx(
          "grid gap-8",
          visual ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-1",
        )}
      >
        <div className="flex min-w-0 flex-col gap-8">
          <LessonHook hook={frontmatter.hook} label={labels.hook} />

          <section className="flex flex-col gap-2">
            <SectionHeader label={labels.concept} />
            {children}
          </section>

          {frontmatter.exercise && (
            <section className="flex flex-col gap-2">
              <SectionHeader label={labels.exercise} />
              <Exercise exercise={frontmatter.exercise} />
            </section>
          )}

          <section className="flex flex-col gap-2">
            <SectionHeader label={labels.quiz} />
            <Quiz
              items={frontmatter.quiz}
              passThreshold={frontmatter.passThreshold}
              onPass={() => markDone(frontmatter.id)}
            />
          </section>
        </div>

        {visual && (
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
              <div className="text-[11px] uppercase tracking-widest text-accent">
                {labels.example}
              </div>
              <div className="overflow-hidden">{visual}</div>
              {frontmatter.visualCaption && (
                <p className="text-xs leading-relaxed text-muted">
                  {frontmatter.visualCaption}
                </p>
              )}
            </div>
          </aside>
        )}
      </div>

      <div className="border-t border-border/60 pt-6">
        <NextDoors
          doors={doors.map((d) => ({
            id: d.id,
            title: d.title,
            question: d.hookQuestion,
          }))}
          heading={labels.nextDoors}
          emptyLabel={labels.noNext}
        />
        {prevLesson && (
          <div className="mt-6 flex">
            <Link
              href={`/lessons/${prevLesson.id}`}
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-xs text-muted no-underline hover:text-fg hover:bg-surface"
            >
              ← {labels.prev}: {prevLesson.title}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="text-[11px] uppercase tracking-widest text-accent">
      {label}
    </div>
  );
}
