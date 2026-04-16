const LAYERS = [3, 5, 4, 2];
const W = 320;
const H = 220;
const PAD_X = 40;

function nodePositions() {
  const cols: Array<Array<{ x: number; y: number }>> = [];
  const colCount = LAYERS.length;
  const colStep = (W - PAD_X * 2) / (colCount - 1);
  LAYERS.forEach((count, colIdx) => {
    const x = PAD_X + colIdx * colStep;
    const rowStep = (H - 40) / (count + 1);
    const nodes: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      nodes.push({ x, y: 20 + rowStep * (i + 1) });
    }
    cols.push(nodes);
  });
  return cols;
}

export function NeuralNet() {
  const cols = nodePositions();
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let c = 0; c < cols.length - 1; c++) {
    for (const a of cols[c]) {
      for (const b of cols[c + 1]) {
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="#d6d0c8"
          strokeWidth="0.8"
          opacity="0.85"
        />
      ))}
      {cols.map((col, ci) =>
        col.map((n, ni) => (
          <g key={`${ci}-${ni}`}>
            <circle
              cx={n.x}
              cy={n.y}
              r="8"
              fill="#fafaf9"
              stroke="#9b3e14"
              strokeWidth="1.5"
            />
          </g>
        )),
      )}
      <text
        x={cols[0][0].x - 6}
        y="14"
        fontSize="10"
        fill="#6b5f54"
        fontFamily='ui-serif, "Iowan Old Style", Georgia, serif'
      >
        вход
      </text>
      <text
        x={cols[1][0].x - 14}
        y="14"
        fontSize="10"
        fill="#6b5f54"
        fontFamily='ui-serif, "Iowan Old Style", Georgia, serif'
      >
        скрытый
      </text>
      <text
        x={cols[2][0].x - 14}
        y="14"
        fontSize="10"
        fill="#6b5f54"
        fontFamily='ui-serif, "Iowan Old Style", Georgia, serif'
      >
        скрытый
      </text>
      <text
        x={cols[cols.length - 1][0].x - 10}
        y="14"
        fontSize="10"
        fill="#6b5f54"
        fontFamily='ui-serif, "Iowan Old Style", Georgia, serif'
      >
        выход
      </text>
    </svg>
  );
}
