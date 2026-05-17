"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type Labels = {
  label: string;
  title: string;
  situation: string;
  inboxHeading: string;
  assistantInstruction: string;
  email1From: string;
  email1Subject: string;
  email1Body: string;
  email2From: string;
  email2Subject: string;
  email2Body: string;
  email3From: string;
  email3Subject: string;
  email3Body: string;
  prediction: string;
  optNone: string;
  optEmail1: string;
  optEmail2: string;
  optEmail3: string;
  run: string;
  runHint: string;
  resultsHeading: string;
  reshuffle: string;
  assistantDid: string;
  actionSummarize: string;
  actionForward: string;
  actionDelete: string;
  hijackedMark: string;
  yourPick: string;
  truth: string;
  deltaRightTitle: string;
  deltaRightBody: string;
  deltaWrongTitle: string;
  deltaWrongBody: string;
};

type Choice = "none" | "email1" | "email2" | "email3";

type Email = {
  key: Choice;
  from: string;
  subject: string;
  body: string;
  hijacks: boolean;
  action: "summarize" | "forward" | "delete";
};

export function PromptInjectionPlayground({ labels }: { labels: Labels }) {
  const [seed, setSeed] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "revealed">("idle");
  const [animStep, setAnimStep] = useState(0);

  const emails: Email[] = [
    {
      key: "email1",
      from: labels.email1From,
      subject: labels.email1Subject,
      body: labels.email1Body,
      hijacks: false,
      action: "summarize",
    },
    {
      key: "email2",
      from: labels.email2From,
      subject: labels.email2Subject,
      body: labels.email2Body,
      hijacks: true,
      action: "forward",
    },
    {
      key: "email3",
      from: labels.email3From,
      subject: labels.email3Subject,
      body: labels.email3Body,
      hijacks: false,
      action: "summarize",
    },
  ];

  const hijackingEmail = emails.find((e) => e.hijacks)!;
  const correct: Choice = hijackingEmail.key;

  useEffect(() => {
    if (phase !== "running") return;
    setAnimStep(0);
    const timers = [
      setTimeout(() => setAnimStep(1), 400),
      setTimeout(() => setAnimStep(2), 900),
      setTimeout(() => setAnimStep(3), 1400),
      setTimeout(() => setPhase("revealed"), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const onRun = () => {
    if (!choice) return;
    setPhase("running");
  };

  const onReshuffle = () => {
    setSeed((s) => s + 1);
    setChoice(null);
    setPhase("idle");
    setAnimStep(0);
  };

  const isRight = choice === correct;

  const actionLabel = (a: Email["action"]) =>
    a === "summarize" ? labels.actionSummarize : a === "forward" ? labels.actionForward : labels.actionDelete;

  return (
    <div className="flex flex-col gap-8" key={seed}>
      <header className="flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-widest text-accent">
          {labels.label}
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {labels.title}
        </h1>
        <p className="max-w-2xl text-muted">{labels.situation}</p>
      </header>

      <div className="rounded-2xl border border-border bg-surface/60 p-5">
        <div className="text-[11px] uppercase tracking-widest text-muted">
          {labels.assistantInstruction}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">{labels.inboxHeading}</h3>
        {emails.map((email, idx) => {
          const isPick = choice === email.key;
          const isHijacker = phase === "revealed" && email.hijacks;
          return (
            <div
              key={email.key}
              className={clsx(
                "rounded-xl border px-4 py-3 transition",
                isHijacker
                  ? "border-accent bg-accent/10"
                  : isPick
                    ? "border-accent/70 bg-accent/5"
                    : "border-border bg-surface/60",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted">{email.from}</span>
                  <span className="font-semibold">{email.subject}</span>
                </div>
                {isHijacker && (
                  <span className="text-[10px] uppercase tracking-widest text-accent">
                    {labels.hijackedMark}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg/85">
                {email.body}
              </p>
              {phase !== "idle" && (
                <div
                  className="mt-3 flex items-center gap-2 text-xs"
                  style={{
                    opacity: animStep >= idx + 1 ? 1 : 0.2,
                    transition: "opacity 400ms ease-out",
                  }}
                >
                  <span className="text-muted">{labels.assistantDid}</span>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      email.action === "forward"
                        ? "bg-accent/20 text-accent"
                        : email.action === "delete"
                          ? "bg-accent/20 text-accent"
                          : "bg-done/15 text-done",
                    )}
                  >
                    {actionLabel(email.action)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {phase === "idle" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-accent">
            {labels.prediction}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { key: "none" as Choice, title: labels.optNone },
                { key: "email1" as Choice, title: labels.optEmail1 },
                { key: "email2" as Choice, title: labels.optEmail2 },
                { key: "email3" as Choice, title: labels.optEmail3 },
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

      {phase === "revealed" && (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-5">
          <h2 className="font-display text-xl font-bold">
            {labels.resultsHeading}
          </h2>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-muted">{labels.yourPick}: </span>
              <span className="font-semibold">
                {choice === "none"
                  ? labels.optNone
                  : choice === "email1"
                    ? labels.optEmail1
                    : choice === "email2"
                      ? labels.optEmail2
                      : labels.optEmail3}
              </span>
            </div>
            <div>
              <span className="text-muted">{labels.truth}: </span>
              <span className="font-semibold text-accent">
                {correct === "email1"
                  ? labels.optEmail1
                  : correct === "email2"
                    ? labels.optEmail2
                    : labels.optEmail3}
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
