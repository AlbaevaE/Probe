"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { layoutGraph } from "./layout";
import { LessonNode, type LessonNodeData, NODE_W, NODE_H } from "./LessonNode";
import { useProgress, statusOf } from "@/lib/progress";
import type { Locale } from "@/i18n/routing";

type GraphNodeInput = {
  id: string;
  title: string;
  summary: string;
  prerequisites: string[];
  group?: string;
  estimatedMinutes: number;
};

const nodeTypes: NodeTypes = { lesson: LessonNode };

export function LessonGraph({
  nodes,
  locale,
}: {
  nodes: GraphNodeInput[];
  locale: Locale;
}) {
  const t = useTranslations("graph");
  const done = useProgress((s) => s.done);
  const reset = useProgress((s) => s.reset);
  const hydrated = useProgress((s) => s.hasHydrated);

  const { rfNodes, rfEdges } = useMemo(() => {
    const edges: Edge[] = [];
    for (const n of nodes) {
      for (const p of n.prerequisites) {
        edges.push({
          id: `${p}->${n.id}`,
          source: p,
          target: n.id,
          animated: false,
          style: { stroke: "#3a3f52", strokeWidth: 1.5 },
        });
      }
    }

    const positions = layoutGraph(
      nodes.map((n) => ({ id: n.id, width: NODE_W, height: NODE_H })),
      edges.map((e) => ({ source: e.source as string, target: e.target as string })),
    );

    const rfNodes: Node<LessonNodeData>[] = nodes.map((n) => {
      const status = hydrated
        ? statusOf(n.id, n.prerequisites, done)
        : n.prerequisites.length === 0
          ? "available"
          : "suggested";
      const pos = positions.get(n.id)!;
      return {
        id: n.id,
        type: "lesson",
        position: { x: pos.x, y: pos.y },
        data: {
          id: n.id,
          title: n.title,
          summary: n.summary,
          group: n.group,
          estimatedMinutes: n.estimatedMinutes,
          status,
          locale,
        },
      };
    });

    return { rfNodes, rfEdges: edges };
  }, [nodes, done, hydrated, locale]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-done" />
          {t("legendDone")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {t("legendAvailable")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-dashed border-border" />
          {t("legendSuggested")}
        </span>
        <button
          onClick={reset}
          className="ml-auto rounded-full border border-border px-3 py-1 text-xs hover:bg-surface"
        >
          {t("reset")}
        </button>
      </div>
      <div
        className="h-[600px] w-full overflow-hidden rounded-xl border border-border bg-surface"
        data-testid="lesson-graph"
      >
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
        >
          <Background color="#242836" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
