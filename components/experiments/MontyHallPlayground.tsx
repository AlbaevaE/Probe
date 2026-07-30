"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { mulberry32 } from "@/lib/rng";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optSame: string;
  optSwitch: string;
  optStick: string;
  run: string;
  runHint: string;
  stickLabel: string;
  switchLabel: string;
  winsLabel: string;
  gamesLabel: string;
  bothNote: string;
  resultsHeading: string;
  reshuffle: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaSameTitle: string;
  deltaSameBody: string;
  deltaStickTitle: string;
  deltaStickBody: string;
};

type Choice = "same" | "switch" | "stick";
type Phase = "idle" | "running" | "revealed";

export const GAMES = 300;
const PER_TICK = 15;

export type MontyGame = { stickWin: boolean; switchWin: boolean };

// A full game per trial: random car, random first pick, and a host who
// knows where the car is and always opens a goat door.
export function playMontyHall(n: number, rng: () => number): MontyGame[] {
  return Array.from({ length: n }, () => {
    const car = Math.floor(rng() * 3);
    const pick = Math.floor(rng() * 3);
    const hostOptions = [0, 1, 2].filter((d) => d !== pick && d !== car);
    const host = hostOptions[Math.floor(rng() * hostOptions.length)];
    const switchDoor = [0, 1, 2].find((d) => d !== pick && d !== host)!;
    return { stickWin: pick === car, switchWin: switchDoor === car };
  });
}

export function MontyHallPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(17);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [animStep, setAnimStep] = useState(0);

  // Every door and every pick is drawn from the RNG for real, in the browser.
  const games = useMemo(() => playMontyHall(GAMES, mulberry32(seed)), [seed]);

  const shown = phase === "idle" ? 0 : Math.min(animStep * PER_TICK, GAMES);
  const played = games.slice(0, shown);
  const stickWins = played.filter((g) => g.stickWin).length;
  const switchWins = played.filter((g) => g.switchWin).length;

  const totalTicks = GAMES / PER_TICK;

  useEffect(() => {
    if (phase !== "running") return;
    if (animStep >= totalTicks) {
      const done = setTimeout(() => setPhase("revealed"), 600);
      return () => clearTimeout(done);
    }
    const timer = setTimeout(() => setAnimStep((s) => s + 1), 120);
    return () => clearTimeout(timer);
  }, [phase, animStep, totalTicks]);

  const onRun = () => {
    if (!choice) return;
    setAnimStep(0);
    setPhase("running");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setAnimStep(0);
    setPhase("idle");
  };

  const outcome: "right" | "same" | "stick" | null =
    choice === "switch" ? "right" : choice;

  const delta =
    outcome === "right"
      ? { title: labels.deltaRightTitle, body: labels.deltaRightBody, done: true }
      : outcome === "same"
        ? { title: labels.deltaSameTitle, body: labels.deltaSameBody, done: false }
        : { title: labels.deltaStickTitle, body: labels.deltaStickBody, done: false };

  const strategies = [
    { key: "stick", label: labels.stickLabel, wins: stickWins, color: "#E05C4A" },
    { key: "switch", label: labels.switchLabel, wins: switchWins, color: "#2A7F8C" },
  ];

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

      {/* three doors, closed */}
      {phase === "idle" && (
        <svg viewBox="0 0 440 130" className="mx-auto w-full max-w-sm" role="img">
          {[0, 1, 2].map((d) => (
            <g key={d}>
              <rect
                x={60 + d * 120}
                y={15}
                width={80}
                height={100}
                rx={6}
                fill="#F2B134"
                opacity={0.35}
                stroke="#8A8175"
                strokeWidth={1.5}
              />
              <circle cx={128 + d * 120} cy={68} r={3} fill="#8A8175" />
              <text
                x={100 + d * 120}
                y={72}
                textAnchor="middle"
                fontSize={22}
                fill="#8A8175"
              >
                {d + 1}
              </text>
            </g>
          ))}
        </svg>
      )}

      {/* score race */}
      {phase !== "idle" && (
        <div className="flex flex-col gap-3">
          <div className="text-xs tabular-nums text-muted">
            {labels.gamesLabel}: {shown} / {GAMES}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {strategies.map((s) => {
              const pct = shown > 0 ? (s.wins / shown) * 100 : 0;
              return (
                <div
                  key={s.key}
                  className="rounded-2xl border border-border bg-surface/60 p-4"
                >
                  <div className="mb-1 text-[11px] uppercase tracking-widest text-muted">
                    {s.label}
                  </div>
                  <div className="font-display text-3xl font-bold tabular-nums">
                    {s.wins}
                    <span className="ml-2 text-base font-normal text-muted">
                      {labels.winsLabel} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-bg/60">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs italic text-muted">{labels.bothNote}</p>
        </div>
      )}

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: "same" as Choice, title: labels.optSame },
              { key: "switch" as Choice, title: labels.optSwitch },
              { key: "stick" as Choice, title: labels.optStick },
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
