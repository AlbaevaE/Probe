"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  prediction: string;
  optUp: string;
  optDown: string;
  optSame: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  toggleHint: string;
  inputLabel: string;
  outputLabel: string;
  hiddenLabel: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "up" | "down" | "same";

/* ── seeded RNG ─────────────────────────────────────────────── */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── network math ───────────────────────────────────────────── */
function relu(x: number) {
  return Math.max(0, x);
}

export type Network = {
  inputWeights: number[][]; // [hidden][input]
  hiddenBias: number[];
  outputWeights: number[]; // [hidden]
  outputBias: number;
};

export function generateNetwork(seed: number): Network {
  const rng = mulberry32(seed);
  const r = () => (rng() - 0.5) * 2;
  return {
    inputWeights: [
      [r(), r()],
      [r(), r()],
      [r(), r()],
    ],
    hiddenBias: [r() * 0.5, r() * 0.5, r() * 0.5],
    outputWeights: [r(), r(), r()],
    outputBias: r() * 0.5,
  };
}

export function forward(
  net: Network,
  inputs: number[],
  disabledNodes: Set<number>,
): { hidden: number[]; output: number } {
  const hidden = net.inputWeights.map((w, i) => {
    if (disabledNodes.has(i)) return 0;
    const sum = w[0] * inputs[0] + w[1] * inputs[1] + net.hiddenBias[i];
    return relu(sum);
  });
  let output = net.outputBias;
  for (let i = 0; i < hidden.length; i++) {
    output += net.outputWeights[i] * hidden[i];
  }
  return { hidden, output: Math.round(output * 100) / 100 };
}

/* ── layout constants ───────────────────────────────────────── */
const W = 480;
const H = 280;
const LAYERS_X = [80, 240, 400];
const INPUT_Y = [100, 180];
const HIDDEN_Y = [70, 140, 210];
const OUTPUT_Y = [140];

export function NeuralNetworkPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(7);
  const [disabledNodes, setDisabledNodes] = useState<Set<number>>(new Set());
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "revealed">("idle");
  const [challengeNode, setChallengeNode] = useState(1);

  const net = useMemo(() => generateNetwork(seed), [seed]);
  const inputs = useMemo(() => {
    const rng = mulberry32(seed + 1000);
    return [Math.round((rng() * 8 + 1) * 10) / 10, Math.round((rng() * 8 + 1) * 10) / 10];
  }, [seed]);

  const baseResult = useMemo(
    () => forward(net, inputs, disabledNodes),
    [net, inputs, disabledNodes],
  );

  const challengeResult = useMemo(() => {
    const newDisabled = new Set(disabledNodes);
    newDisabled.add(challengeNode);
    return forward(net, inputs, newDisabled);
  }, [net, inputs, disabledNodes, challengeNode]);

  const correctAnswer: Choice = useMemo(() => {
    const diff = challengeResult.output - baseResult.output;
    if (Math.abs(diff) < 0.01) return "same";
    return diff > 0 ? "up" : "down";
  }, [baseResult, challengeResult]);

  const onRun = () => {
    if (!choice) return;
    setPhase("revealed");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setDisabledNodes(new Set());
    setChoice(null);
    setPhase("idle");
    const rng = mulberry32(seed + 999);
    setChallengeNode(Math.floor(rng() * 3));
  };

  const toggleNode = (idx: number) => {
    if (phase !== "revealed") return;
    setDisabledNodes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const isRight = choice === correctAnswer;

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

      <div className="overflow-hidden rounded-2xl border border-border bg-surface/60">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          style={{ fontFamily: 'ui-serif, "Iowan Old Style", Georgia, serif' }}
        >
          {/* layer labels */}
          <text x={LAYERS_X[0]} y={30} fontSize="14" fill="#8A8175" textAnchor="middle">
            {labels.inputLabel}
          </text>
          <text x={LAYERS_X[1]} y={30} fontSize="14" fill="#8A8175" textAnchor="middle">
            {labels.hiddenLabel}
          </text>
          <text x={LAYERS_X[2]} y={30} fontSize="14" fill="#8A8175" textAnchor="middle">
            {labels.outputLabel}
          </text>

          {/* edges: input → hidden */}
          {INPUT_Y.map((iy, ii) =>
            HIDDEN_Y.map((hy, hi) => {
              const disabled = disabledNodes.has(hi);
              const w = net.inputWeights[hi][ii];
              return (
                <line
                  key={`ih-${ii}-${hi}`}
                  x1={LAYERS_X[0] + 18}
                  y1={iy}
                  x2={LAYERS_X[1] - 18}
                  y2={hy}
                  stroke={w > 0 ? "#2A7F8C" : "#E05C4A"}
                  strokeWidth={Math.min(3, Math.abs(w) * 2 + 0.5)}
                  opacity={disabled ? 0.15 : 0.6}
                  style={{ transition: "opacity 300ms" }}
                />
              );
            }),
          )}

          {/* edges: hidden → output */}
          {HIDDEN_Y.map((hy, hi) => {
            const disabled = disabledNodes.has(hi);
            const w = net.outputWeights[hi];
            return (
              <line
                key={`ho-${hi}`}
                x1={LAYERS_X[1] + 18}
                y1={hy}
                x2={LAYERS_X[2] - 18}
                y2={OUTPUT_Y[0]}
                stroke={w > 0 ? "#2A7F8C" : "#E05C4A"}
                strokeWidth={Math.min(3, Math.abs(w) * 2 + 0.5)}
                opacity={disabled ? 0.15 : 0.6}
                style={{ transition: "opacity 300ms" }}
              />
            );
          })}

          {/* input nodes */}
          {INPUT_Y.map((y, i) => (
            <g key={`in-${i}`}>
              <circle cx={LAYERS_X[0]} cy={y} r="18" fill="#FFFDF8" stroke="#E05C4A" strokeWidth="1.5" />
              <text x={LAYERS_X[0]} y={y + 5} fontSize="14" fill="#241F1A" textAnchor="middle" fontWeight="600">
                {inputs[i]}
              </text>
            </g>
          ))}

          {/* hidden nodes */}
          {HIDDEN_Y.map((y, i) => {
            const disabled = disabledNodes.has(i);
            const isChallenge = i === challengeNode && phase === "idle";
            return (
              <g
                key={`hid-${i}`}
                onClick={() => toggleNode(i)}
                style={{ cursor: phase === "revealed" ? "pointer" : "default" }}
              >
                {isChallenge && (
                  <circle
                    cx={LAYERS_X[1]}
                    cy={y}
                    r="24"
                    fill="none"
                    stroke="#E05C4A"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    opacity="0.6"
                  />
                )}
                <circle
                  cx={LAYERS_X[1]}
                  cy={y}
                  r="18"
                  fill={disabled ? "#E5DFD2" : "#FFFDF8"}
                  stroke={disabled ? "#F2B134" : "#E05C4A"}
                  strokeWidth="1.5"
                  style={{ transition: "fill 300ms, stroke 300ms" }}
                />
                <text
                  x={LAYERS_X[1]}
                  y={y + 4}
                  fontSize="13"
                  fill={disabled ? "#F2B134" : "#241F1A"}
                  textAnchor="middle"
                  fontWeight="600"
                  style={{ transition: "fill 300ms" }}
                >
                  {disabled ? "—" : baseResult.hidden[i].toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* output node */}
          <g>
            <circle cx={LAYERS_X[2]} cy={OUTPUT_Y[0]} r="22" fill="#FFFDF8" stroke="#2A7F8C" strokeWidth="2" />
            <text
              x={LAYERS_X[2]}
              y={OUTPUT_Y[0] + 5}
              fontSize="16"
              fill="#241F1A"
              textAnchor="middle"
              fontWeight="700"
            >
              {baseResult.output.toFixed(1)}
            </text>
          </g>
        </svg>
        {phase === "revealed" && (
          <div className="border-t border-border/60 px-5 py-3 text-xs italic text-muted">
            {labels.toggleHint}
          </div>
        )}
      </div>

      {/* prediction */}
      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { key: "up" as Choice, title: labels.optUp },
                { key: "down" as Choice, title: labels.optDown },
                { key: "same" as Choice, title: labels.optSame },
              ]
            ).map((opt) => (
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

      {/* reveal */}
      {phase === "revealed" && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border px-4 py-3">
              <span className="text-xs text-muted">Output before</span>
              <div className="text-lg font-bold">{baseResult.output.toFixed(2)}</div>
            </div>
            <div className={clsx("rounded-xl border px-4 py-3", isRight ? "border-done/60 bg-done/10" : "border-accent/60 bg-accent/5")}>
              <span className="text-xs text-muted">Output after removing node</span>
              <div className="text-lg font-bold">{challengeResult.output.toFixed(2)}</div>
            </div>
          </div>
          <div className={clsx("rounded-xl border-l-2 bg-bg/40 px-4 py-3", isRight ? "border-done/70" : "border-accent/70")}>
            <div className={clsx("text-[11px] uppercase tracking-widest", isRight ? "text-done" : "text-accent")}>
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
