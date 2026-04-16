import dagre from "dagre";

export type LayoutNode = { id: string; width: number; height: number };
export type LayoutEdge = { source: string; target: string };
export type Positioned = { id: string; x: number; y: number };

export function layoutGraph(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
): Map<string, Positioned> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of nodes) {
    g.setNode(n.id, { width: n.width, height: n.height });
  }
  for (const e of edges) {
    g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  const out = new Map<string, Positioned>();
  for (const n of nodes) {
    const pos = g.node(n.id);
    out.set(n.id, {
      id: n.id,
      x: pos.x - n.width / 2,
      y: pos.y - n.height / 2,
    });
  }
  return out;
}
