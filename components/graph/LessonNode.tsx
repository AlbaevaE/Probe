"use client";

import { Handle, Position } from "@xyflow/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import clsx from "clsx";
import type { Locale } from "@/i18n/routing";

export const NODE_W = 240;
export const NODE_H = 110;

export type LessonNodeData = {
  id: string;
  title: string;
  summary: string;
  group?: string;
  estimatedMinutes: number;
  status: "done" | "available" | "suggested";
  locale: Locale;
};

export function LessonNode({ data }: { data: LessonNodeData }) {
  const t = useTranslations("lesson");

  const inner = (
    <div
      className={clsx(
        "flex h-full w-full flex-col gap-1.5 rounded-xl border px-4 py-3 text-left transition",
        data.status === "done" &&
          "border-done/60 bg-done/10 hover:border-done",
        data.status === "available" &&
          "border-accent/60 bg-accent/10 hover:border-accent",
        data.status === "suggested" &&
          "border-dashed border-border/80 bg-surface/40 hover:border-accent/60 hover:bg-accent/5",
      )}
      style={{ width: NODE_W, height: NODE_H }}
      data-testid={`lesson-node-${data.id}`}
      data-status={data.status}
    >
      {data.group && (
        <div className="text-[10px] uppercase tracking-wide text-muted">
          {data.group}
        </div>
      )}
      <div className="text-sm font-semibold leading-snug">{data.title}</div>
      <div className="mt-auto text-[11px] text-muted">
        {t("estimatedMinutes", { m: data.estimatedMinutes })}
      </div>
    </div>
  );

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Link href={`/lessons/${data.id}`} className="no-underline">
        {inner}
      </Link>
      <Handle type="source" position={Position.Right} className="!bg-border" />
    </>
  );
}
