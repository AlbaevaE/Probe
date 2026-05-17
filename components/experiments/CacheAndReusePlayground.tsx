"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optFaster: string;
  optFasterHint: string;
  optSame: string;
  optSameHint: string;
  optSlower: string;
  optSlowerHint: string;
  run: string;
  runHint: string;
  askFreshLabel: string;
  askCachedLabel: string;
  promptLabel: string;
  samplePrompt: string;
  energyLabel: string;
  waterLabel: string;
  latencyLabel: string;
  resultsHeading: string;
  reshuffle: string;
  totalFresh: string;
  totalCached: string;
  yourPick: string;
  truth: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "faster" | "same" | "slower";

const FRESH_DELAY_MS = 1800;
const CACHED_DELAY_MS = 40;
const ENERGY_PER_FRESH = 1;
const WATER_PER_FRESH_ML = 35;

export function CacheAndReusePlayground({ labels }: { labels: Labels }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");

  const [freshCount, setFreshCount] = useState(0);
  const [cachedCount, setCachedCount] = useState(0);
  const [freshLatency, setFreshLatency] = useState<number[]>([]);
  const [cachedLatency, setCachedLatency] = useState<number[]>([]);
  const [pendingKind, setPendingKind] = useState<null | "fresh" | "cached">(null);
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!pendingKind) return;
    const start = performance.now();
    const delay = pendingKind === "fresh" ? FRESH_DELAY_MS : CACHED_DELAY_MS;

    let raf = 0;
    const loop = () => {
      tickRef.current = performance.now() - start;
      setTick(tickRef.current);
      if (tickRef.current < delay) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);

    const t = setTimeout(() => {
      const elapsed = performance.now() - start;
      if (pendingKind === "fresh") {
        setFreshCount((c) => c + 1);
        setFreshLatency((l) => [...l, elapsed]);
      } else {
        setCachedCount((c) => c + 1);
        setCachedLatency((l) => [...l, elapsed]);
      }
      setPendingKind(null);
      setTick(0);
      tickRef.current = 0;
    }, delay);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [pendingKind]);

  const onAskFresh = () => {
    if (pendingKind || phase === "revealed") return;
    setPendingKind("fresh");
  };
  const onAskCached = () => {
    if (pendingKind || phase === "revealed") return;
    setPendingKind("cached");
  };

  const canReveal = freshCount >= 2 && cachedCount >= 2;

  const onReveal = () => {
    if (!choice || !canReveal) return;
    setPhase("revealed");
  };

  const onReshuffle = () => {
    setChoice(null);
    setPhase("idle");
    setFreshCount(0);
    setCachedCount(0);
    setFreshLatency([]);
    setCachedLatency([]);
    setPendingKind(null);
    setTick(0);
    tickRef.current = 0;
  };

  const avgFresh = freshLatency.length
    ? freshLatency.reduce((a, b) => a + b, 0) / freshLatency.length
    : 0;
  const avgCached = cachedLatency.length
    ? cachedLatency.reduce((a, b) => a + b, 0) / cachedLatency.length
    : 0;

  const energyUnits = freshCount * ENERGY_PER_FRESH;
  const waterMl = freshCount * WATER_PER_FRESH_ML;

  const truth: Choice = "faster";
  const isRight = choice === truth;

  const disabled = pendingKind !== null || phase === "revealed";

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

      {phase === "idle" && !canReveal && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { key: "faster" as Choice, title: labels.optFaster, hint: labels.optFasterHint },
                { key: "same" as Choice, title: labels.optSame, hint: labels.optSameHint },
                { key: "slower" as Choice, title: labels.optSlower, hint: labels.optSlowerHint },
              ]
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setChoice(opt.key)}
                className={clsx(
                  "flex flex-col gap-1.5 rounded-xl border bg-surface/60 px-4 py-3 text-left transition",
                  choice === opt.key
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/60",
                )}
              >
                <span className="font-semibold">{opt.title}</span>
                <span className="text-xs text-muted">{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="mb-3 text-[11px] uppercase tracking-widest text-muted">
          {labels.promptLabel}
        </div>
        <div className="rounded-lg bg-bg/60 px-3 py-2 font-mono text-sm">
          {labels.samplePrompt}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onAskFresh}
            disabled={disabled || !choice}
            className={clsx(
              "rounded-xl border border-accent/60 bg-accent/10 px-4 py-3 text-left transition",
              (disabled || !choice) && "opacity-40",
              !disabled && choice && "hover:bg-accent/20",
            )}
          >
            <div className="font-semibold">{labels.askFreshLabel}</div>
            <div className="text-xs text-muted">
              {labels.latencyLabel}: ~{FRESH_DELAY_MS} ms
            </div>
          </button>
          <button
            onClick={onAskCached}
            disabled={disabled || !choice}
            className={clsx(
              "rounded-xl border border-done/60 bg-done/10 px-4 py-3 text-left transition",
              (disabled || !choice) && "opacity-40",
              !disabled && choice && "hover:bg-done/20",
            )}
          >
            <div className="font-semibold">{labels.askCachedLabel}</div>
            <div className="text-xs text-muted">
              {labels.latencyLabel}: ~{CACHED_DELAY_MS} ms
            </div>
          </button>
        </div>

        {pendingKind && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-bg/60">
              <div
                className={clsx(
                  "h-full transition-[width]",
                  pendingKind === "fresh" ? "bg-accent/70" : "bg-done/70",
                )}
                style={{
                  width: `${Math.min(100, (tick / (pendingKind === "fresh" ? FRESH_DELAY_MS : CACHED_DELAY_MS)) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-1 text-right text-xs text-muted">
              {tick.toFixed(0)} ms
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-muted">
            {labels.totalFresh}
          </div>
          <div className="mt-1 text-2xl font-bold">{freshCount}</div>
          <div className="text-xs text-muted">
            {avgFresh > 0 && `${avgFresh.toFixed(0)} ms avg`}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-muted">
            {labels.totalCached}
          </div>
          <div className="mt-1 text-2xl font-bold">{cachedCount}</div>
          <div className="text-xs text-muted">
            {avgCached > 0 && `${avgCached.toFixed(0)} ms avg`}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-muted">
            {labels.energyLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{energyUnits}</span>
            <span className="text-xs text-muted">⚡</span>
          </div>
          <div className="text-xs text-muted">
            {labels.waterLabel}: ~{waterMl} ml
          </div>
        </div>
      </div>

      {phase === "idle" && (
        <div className="flex items-center gap-4">
          <button
            onClick={onReveal}
            disabled={!canReveal || !choice}
            className={clsx(
              "rounded-full border border-accent/60 bg-accent/15 px-6 py-2.5 text-sm font-semibold transition",
              (!canReveal || !choice) && "opacity-40",
              canReveal && choice && "hover:bg-accent/25",
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
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-muted">{labels.yourPick}: </span>
              <span className="font-semibold">
                {choice === "faster"
                  ? labels.optFaster
                  : choice === "same"
                    ? labels.optSame
                    : labels.optSlower}
              </span>
            </div>
            <div>
              <span className="text-muted">{labels.truth}: </span>
              <span className="font-semibold text-accent">
                {avgFresh.toFixed(0)} ms → {avgCached.toFixed(0)} ms (
                {avgFresh > 0 ? Math.round(avgFresh / Math.max(avgCached, 1)) : 0}×)
              </span>
            </div>
          </div>
          <div
            className={clsx(
              "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
              isRight ? "border-done/70" : "border-accent/70",
            )}
          >
            <div
              className={clsx(
                "text-[11px] uppercase tracking-widest",
                isRight ? "text-done" : "text-accent",
              )}
            >
              {isRight ? labels.deltaRightTitle : labels.deltaWrongTitle}
            </div>
            <p className="mt-1 text-sm text-fg/90">
              {isRight ? labels.deltaRightBody : labels.deltaWrongBody}
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
