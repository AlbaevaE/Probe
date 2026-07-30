"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  kbHeading: string;
  doc1Title: string;
  doc1Body: string;
  doc2Title: string;
  doc2Body: string;
  doc3Title: string;
  doc3Body: string;
  queryLabel: string;
  query: string;
  prediction: string;
  optDoc1: string;
  optDoc2: string;
  optDoc3: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  matchesLabel: string;
  pickedLabel: string;
  assistantAnswerLabel: string;
  assistantAnswer: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaMeaningTitle: string;
  deltaMeaningBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type DocKey = "doc1" | "doc2" | "doc3";
type Phase = "idle" | "running" | "revealed";

/* ── keyword search, computed live ──────────────────────────── */
// Lowercase word tokens, ≥4 letters (drops particles like «ли», «у», «бар»).
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((t) => t.length >= 4);
}

// Naive stemming: two tokens match when one is a prefix of the other,
// so «телефон» still hits «телефонду» / «телефону».
export function tokensMatch(a: string, b: string): boolean {
  return a.startsWith(b) || b.startsWith(a);
}

export function scoreDoc(query: string, docBody: string): number {
  const queryTokens = tokenize(query);
  return tokenize(docBody).filter((dt) =>
    queryTokens.some((qt) => tokensMatch(dt, qt)),
  ).length;
}

function HighlightedBody({ body, query }: { body: string; query: string }) {
  const queryTokens = tokenize(query);
  const parts = body.split(/([^\p{L}]+)/u);
  return (
    <>
      {parts.map((part, i) => {
        const isWord = /\p{L}/u.test(part);
        const hit =
          isWord &&
          part.length >= 4 &&
          queryTokens.some((qt) => tokensMatch(part.toLowerCase(), qt));
        return hit ? (
          <span key={i} className="rounded bg-accent/20 px-0.5 font-semibold text-accent">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

export function RetrievalPlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<DocKey | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  const docs = useMemo(
    () =>
      [
        { key: "doc1" as DocKey, title: labels.doc1Title, body: labels.doc1Body },
        { key: "doc2" as DocKey, title: labels.doc2Title, body: labels.doc2Body },
        { key: "doc3" as DocKey, title: labels.doc3Title, body: labels.doc3Body },
      ].map((d) => ({ ...d, score: scoreDoc(labels.query, d.body) })),
    [labels],
  );

  const winner = useMemo(
    () => docs.reduce((best, d) => (d.score > best.score ? d : best), docs[0]),
    [docs],
  );
  const maxScore = Math.max(...docs.map((d) => d.score), 1);

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= docs.length) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 650);
    return () => clearTimeout(timer);
  }, [phase, animStep, docs.length]);

  const onRun = () => {
    if (!choice) return;
    setAnimStep(0);
    setPhase("running");
  };

  const onReshuffle = () => {
    setChoice(null);
    setAnimStep(0);
    setPhase("idle");
  };

  const isRight = choice === winner.key;
  const delta = isRight
    ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
    : choice === "doc2"
      ? { title: labels.deltaMeaningTitle, body: labels.deltaMeaningBody, done: false }
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
      </header>

      {/* query */}
      <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
        <div className="text-[11px] uppercase tracking-widest text-accent">
          {labels.queryLabel}
        </div>
        <p className="mt-2 font-display text-xl font-bold">{labels.query}</p>
      </div>

      {/* knowledge base */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[11px] uppercase tracking-widest text-muted">
          {labels.kbHeading}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {docs.map((doc, di) => {
            const scored = phase === "revealed" || (phase === "running" && di < animStep);
            const picked = phase === "revealed" && doc.key === winner.key;
            return (
              <div
                key={doc.key}
                className={clsx(
                  "flex flex-col gap-2 rounded-2xl border p-4 transition",
                  picked ? "border-accent bg-accent/10" : "border-border bg-surface/60",
                )}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {doc.title}
                </div>
                <p className="text-sm leading-relaxed text-fg/90">
                  {scored ? (
                    <HighlightedBody body={doc.body} query={labels.query} />
                  ) : (
                    doc.body
                  )}
                </p>
                {phase !== "idle" && (
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <span className="text-[11px] text-muted">{labels.matchesLabel}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg/60">
                      <div
                        className="h-full rounded-full bg-accent/80 transition-all duration-700"
                        style={{ width: scored ? `${(doc.score / maxScore) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-4 text-right text-xs font-semibold tabular-nums">
                      {scored ? doc.score : "–"}
                    </span>
                  </div>
                )}
                {picked && (
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-accent">
                    {labels.pickedLabel}
                  </div>
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
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: "doc1" as DocKey, title: labels.optDoc1 },
              { key: "doc2" as DocKey, title: labels.optDoc2 },
              { key: "doc3" as DocKey, title: labels.optDoc3 },
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

      {/* results */}
      {phase === "revealed" && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>
          <div className="rounded-xl border border-border bg-bg/40 px-4 py-3">
            <div className="text-[11px] uppercase tracking-widest text-muted">
              {labels.assistantAnswerLabel}
            </div>
            <p className="mt-1 text-sm italic text-fg/90">
              «{labels.assistantAnswer}»
            </p>
          </div>
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
