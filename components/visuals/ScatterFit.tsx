const POINTS: Array<[number, number]> = [
  [25, 95],
  [40, 82],
  [55, 88],
  [70, 72],
  [85, 70],
  [100, 55],
  [115, 62],
  [130, 48],
  [145, 50],
  [165, 36],
  [185, 28],
  [200, 32],
  [220, 18],
];

export function ScatterFit() {
  const x1 = 20;
  const x2 = 250;
  const y1 = 100 - (-0.35 * 0 + 95);
  const y2 = 100 - (-0.35 * 260 + 95);

  return (
    <svg viewBox="0 0 280 200" className="h-auto w-full">
      <defs>
        <style>{`
          .axis { stroke: #d6d0c8; stroke-width: 1; }
          .tick { stroke: #d6d0c8; stroke-width: 1; }
          .label { font: 500 10px ui-serif, "Iowan Old Style", Georgia, serif; fill: #6b5f54; }
          .point { fill: #9b3e14; }
          .fit { stroke: #4d6a23; stroke-width: 2; fill: none; }
        `}</style>
      </defs>

      <line x1="30" y1="20" x2="30" y2="170" className="axis" />
      <line x1="30" y1="170" x2="265" y2="170" className="axis" />

      <text x="30" y="15" className="label">цена</text>
      <text x="240" y="188" className="label">площадь</text>

      {POINTS.map(([x, y], i) => (
        <circle key={i} cx={30 + x} cy={170 - y} r="3.5" className="point" opacity="0.85" />
      ))}

      <line
        x1={30 + x1}
        y1={170 - (95 - 0.35 * x1)}
        x2={30 + x2}
        y2={170 - (95 - 0.35 * x2)}
        className="fit"
      />
    </svg>
  );
}
