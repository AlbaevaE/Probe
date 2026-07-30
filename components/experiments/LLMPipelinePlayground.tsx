"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

type Sample = { input: string; output: string };

type Labels = {
  label: string;
  title: string;
  situation: string;
  samples: Sample[];
  prediction: string;
  optOnce: string;
  optOnceHint: string;
  optPerWord: string;
  optPerWordHint: string;
  optPerToken: string;
  optPerTokenHint: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  stageInput: string;
  stageInputDesc: string;
  stageTokenizer: string;
  stageTokenizerDesc: string;
  stageEmbedding: string;
  stageEmbeddingDesc: string;
  stageAttention: string;
  stageAttentionDesc: string;
  stageGeneration: string;
  stageGenerationDesc: string;
  stageCost: string;
  stageCostDesc: string;
  next: string;
  prev: string;
  inputTokens: string;
  outputTokens: string;
  totalPasses: string;
  costEstimate: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "once" | "perWord" | "perToken";

/* ── simple token simulation ───────────────────────────────── */
// Approximate BPE: split on word boundaries, punctuation,
// and split long words into 2-3 char subwords.
// This is intentionally simplified and honest about it.
export function simpleTokenize(text: string): string[] {
  const tokens: string[] = [];
  // Split by spaces, keeping punctuation separate. Unicode letter classes, not
  // an а-я range: Kyrgyz ө/ү/ң sit outside it and would each split off as
  // punctuation, mangling every other word in the Kyrgyz samples.
  const raw = text.match(/[\p{L}\p{N}]+|[^\s]/gu) || [];
  for (const word of raw) {
    if (word.length <= 4) {
      tokens.push(word);
    } else {
      // Split longer words into ~3-char subwords (BPE approximation)
      for (let i = 0; i < word.length; i += 3) {
        tokens.push(word.slice(i, Math.min(i + 3, word.length)));
      }
    }
  }
  return tokens;
}

const TOKEN_COLORS = [
  "#E05C4A", "#7B5EA7", "#2A7F8C", "#8b5e3c",
  "#6a5acd", "#b8860b", "#2e8b57", "#cd5c5c",
];

const STAGES = [
  "input",
  "tokenizer",
  "embedding",
  "attention",
  "generation",
  "cost",
] as const;

type Stage = (typeof STAGES)[number];

export function LLMPipelinePlayground({ labels }: { labels: Labels }) {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "pipeline" | "revealed">("idle");
  const [stageIdx, setStageIdx] = useState(0);

  // Prompts come from the locale file: the pipeline tokenizes the learner's
  // own language, not Russian text sitting under Kyrgyz chrome.
  const sample = labels.samples[sampleIdx % labels.samples.length];
  const inputTokens = useMemo(() => simpleTokenize(sample.input), [sample.input]);
  const outputTokens = useMemo(() => simpleTokenize(sample.output), [sample.output]);
  const totalTokens = inputTokens.length + outputTokens.length;

  const stage = STAGES[stageIdx];

  const stageName = (s: Stage) => {
    const map: Record<Stage, string> = {
      input: labels.stageInput,
      tokenizer: labels.stageTokenizer,
      embedding: labels.stageEmbedding,
      attention: labels.stageAttention,
      generation: labels.stageGeneration,
      cost: labels.stageCost,
    };
    return map[s];
  };

  const stageDesc = (s: Stage) => {
    const map: Record<Stage, string> = {
      input: labels.stageInputDesc,
      tokenizer: labels.stageTokenizerDesc,
      embedding: labels.stageEmbeddingDesc,
      attention: labels.stageAttentionDesc,
      generation: labels.stageGenerationDesc,
      cost: labels.stageCostDesc,
    };
    return map[s];
  };

  const onRun = () => {
    if (!choice) return;
    setPhase("pipeline");
    setStageIdx(0);
  };

  const onNext = () => {
    if (stageIdx < STAGES.length - 1) {
      setStageIdx((i) => i + 1);
    } else {
      setPhase("revealed");
    }
  };

  const onPrev = () => {
    if (stageIdx > 0) setStageIdx((i) => i - 1);
  };

  const onReshuffle = () => {
    setSampleIdx((i) => i + 1);
    setChoice(null);
    setPhase("idle");
    setStageIdx(0);
  };

  const isRight = choice === "perToken";

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

      {/* chat preview */}
      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              ?
            </div>
            <div className="rounded-xl rounded-tl-none bg-bg/60 px-4 py-2.5 text-sm">
              {sample.input}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-done/15 text-xs font-bold text-done">
              AI
            </div>
            <div className="rounded-xl rounded-tl-none bg-bg/60 px-4 py-2.5 text-sm">
              {sample.output}
            </div>
          </div>
        </div>
      </div>

      {/* pipeline stages */}
      {phase === "pipeline" && (
        <div className="flex flex-col gap-5">
          {/* stage progress */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STAGES.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={clsx(
                    "flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold transition",
                    i === stageIdx
                      ? "bg-accent/15 text-accent"
                      : i < stageIdx
                        ? "bg-done/10 text-done"
                        : "bg-bg/60 text-muted/50",
                  )}
                >
                  {stageName(s)}
                </div>
                {i < STAGES.length - 1 && (
                  <span className="mx-0.5 text-muted/30">&rarr;</span>
                )}
              </div>
            ))}
          </div>

          {/* stage visualization */}
          <div className="rounded-2xl border border-border bg-surface/60 p-5">
            <h3 className="font-display text-lg font-bold">{stageName(stage)}</h3>
            <p className="mt-2 text-sm text-muted">{stageDesc(stage)}</p>

            {/* stage-specific visual */}
            <div className="mt-4">
              {stage === "input" && (
                <div className="rounded-xl bg-bg/60 p-4 text-sm font-mono">
                  {sample.input}
                </div>
              )}

              {stage === "tokenizer" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1">
                    {inputTokens.map((t, i) => (
                      <span
                        key={i}
                        className="rounded px-1.5 py-0.5 text-sm font-mono text-white"
                        style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted">
                    {labels.inputTokens}: <span className="font-semibold text-fg">{inputTokens.length}</span>
                  </div>
                </div>
              )}

              {stage === "embedding" && (
                <div className="flex flex-col gap-2">
                  {inputTokens.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span
                        className="w-16 rounded px-1.5 py-0.5 text-center text-xs font-mono text-white"
                        style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                      >
                        {t}
                      </span>
                      <span className="text-xs text-muted">&rarr;</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 8 }).map((_, j) => {
                          const h = 8 + Math.abs(Math.sin(i * 3 + j * 7)) * 16;
                          return (
                            <div
                              key={j}
                              className="w-2 rounded-sm"
                              style={{
                                height: h,
                                background: TOKEN_COLORS[i % TOKEN_COLORS.length],
                                opacity: 0.4 + Math.abs(Math.sin(i * 5 + j * 3)) * 0.6,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {inputTokens.length > 5 && (
                    <span className="text-xs text-muted">...+{inputTokens.length - 5}</span>
                  )}
                </div>
              )}

              {stage === "attention" && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <svg viewBox="0 0 400 160" className="h-auto w-full">
                    {inputTokens.slice(0, 6).map((t, i) => {
                      const x = 40 + i * 60;
                      return (
                        <g key={i}>
                          <rect
                            x={x - 22}
                            y={20}
                            width={44}
                            height={22}
                            rx="4"
                            fill={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                            opacity="0.8"
                          />
                          <text
                            x={x}
                            y={35}
                            fontSize="11"
                            fill="white"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {t.length > 4 ? t.slice(0, 4) : t}
                          </text>
                          {/* attention arcs to other tokens */}
                          {inputTokens.slice(0, 6).map((_, j) => {
                            if (j === i) return null;
                            const x2 = 40 + j * 60;
                            const strength = Math.abs(Math.sin(i * 4 + j * 7)) * 0.8 + 0.1;
                            return (
                              <line
                                key={`${i}-${j}`}
                                x1={x}
                                y1={42}
                                x2={x2}
                                y2={42}
                                stroke="#E05C4A"
                                strokeWidth={strength * 2.5}
                                opacity={strength * 0.4}
                                style={{ transition: "all 300ms" }}
                              />
                            );
                          })}
                          <rect
                            x={x - 22}
                            y={60}
                            width={44}
                            height={22}
                            rx="4"
                            fill={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                            opacity="0.5"
                          />
                          <text
                            x={x}
                            y={75}
                            fontSize="11"
                            fill="#241F1A"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {t.length > 4 ? t.slice(0, 4) : t}
                          </text>
                        </g>
                      );
                    })}
                    {/* bottom label */}
                    <text x="200" y="110" fontSize="13" fill="#8A8175" textAnchor="middle">
                      attention scores
                    </text>
                    {/* arrows between layers */}
                    {inputTokens.slice(0, 6).map((_, i) => {
                      const x = 40 + i * 60;
                      return (
                        <line
                          key={`arr-${i}`}
                          x1={x}
                          y1={82}
                          x2={x}
                          y2={100}
                          stroke="#E5DFD2"
                          strokeWidth="1"
                          markerEnd="url(#arrow)"
                        />
                      );
                    })}
                    <defs>
                      <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6" fill="#E5DFD2" />
                      </marker>
                    </defs>
                    {/* output blocks */}
                    {inputTokens.slice(0, 6).map((t, i) => {
                      const x = 40 + i * 60;
                      return (
                        <rect
                          key={`out-${i}`}
                          x={x - 22}
                          y={100}
                          width={44}
                          height={22}
                          rx="4"
                          fill={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                          opacity="0.3"
                        />
                      );
                    })}
                  </svg>
                </div>
              )}

              {stage === "generation" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1">
                    {outputTokens.map((t, i) => (
                      <span
                        key={i}
                        className="rounded px-1.5 py-0.5 text-sm font-mono text-white"
                        style={{
                          background: TOKEN_COLORS[i % TOKEN_COLORS.length],
                          opacity: 0.6 + (i / outputTokens.length) * 0.4,
                          animation: `fadeIn 200ms ease-out ${i * 30}ms both`,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted">
                    {labels.outputTokens}: <span className="font-semibold text-fg">{outputTokens.length}</span>
                    {" "}&mdash; {labels.totalPasses}: <span className="font-semibold text-fg">{outputTokens.length}</span>
                  </div>
                </div>
              )}

              {stage === "cost" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-bg/40 px-4 py-3">
                    <div className="text-xs text-muted">{labels.inputTokens}</div>
                    <div className="text-2xl font-bold">{inputTokens.length}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-bg/40 px-4 py-3">
                    <div className="text-xs text-muted">{labels.outputTokens}</div>
                    <div className="text-2xl font-bold">{outputTokens.length}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-bg/40 px-4 py-3">
                    <div className="text-xs text-muted">{labels.totalPasses}</div>
                    <div className="text-2xl font-bold">{outputTokens.length}</div>
                  </div>
                  <div className="col-span-full rounded-xl border border-done/40 bg-done/5 px-4 py-3">
                    <div className="text-xs text-muted">{labels.costEstimate}</div>
                    <div className="text-lg font-bold text-done">
                      ~${((inputTokens.length * 0.003 + outputTokens.length * 0.015) / 1000).toFixed(6)}
                    </div>
                    <div className="text-xs text-muted">
                      ({inputTokens.length} &times; $0.003 + {outputTokens.length} &times; $0.015) / 1000
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* nav buttons */}
            <div className="mt-5 flex items-center gap-3">
              {stageIdx > 0 && (
                <button
                  onClick={onPrev}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted hover:bg-surface hover:text-fg"
                >
                  &larr; {labels.prev}
                </button>
              )}
              <button
                onClick={onNext}
                className="rounded-full border border-accent/60 bg-accent/15 px-5 py-2 text-sm font-semibold hover:bg-accent/25"
              >
                {stageIdx < STAGES.length - 1 ? labels.next : labels.resultsHeading} &rarr;
              </button>
            </div>
          </div>
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
              { key: "once" as Choice, title: labels.optOnce, hint: labels.optOnceHint },
              { key: "perWord" as Choice, title: labels.optPerWord, hint: labels.optPerWordHint },
              { key: "perToken" as Choice, title: labels.optPerToken, hint: labels.optPerTokenHint },
            ]).map((opt) => (
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
          <div className={clsx(
            "rounded-xl border-l-2 bg-bg/40 px-4 py-3",
            isRight ? "border-done/70" : "border-accent/70",
          )}>
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
