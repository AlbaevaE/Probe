const POINTS: Array<[number, number]> = [
  [10, 70],
  [25, 85],
  [40, 60],
  [55, 72],
  [72, 45],
  [88, 58],
  [105, 30],
  [122, 42],
  [140, 22],
];

function Plot({
  title,
  path,
  pathColor,
}: {
  title: string;
  path: string;
  pathColor: string;
}) {
  return (
    <g>
      <rect width="160" height="140" rx="10" fill="#FFFDF8" stroke="#E5DFD2" />
      <text
        x="12"
        y="20"
        fontSize="11"
        fontWeight="600"
        fill="#241F1A"
        fontFamily='ui-serif, "Iowan Old Style", Georgia, serif'
      >
        {title}
      </text>
      <line x1="14" y1="30" x2="14" y2="125" stroke="#E5DFD2" />
      <line x1="14" y1="125" x2="150" y2="125" stroke="#E5DFD2" />
      <path d={path} fill="none" stroke={pathColor} strokeWidth="2" />
      {POINTS.map(([x, y], i) => (
        <circle key={i} cx={14 + x} cy={125 - y} r="3" fill="#E05C4A" />
      ))}
    </g>
  );
}

export function OverfitPlot() {
  const goodPath = "M 16,85 Q 60,70 90,55 T 154,30";

  const overfitPath = POINTS.reduce((acc, [x, y], i) => {
    const px = 14 + x;
    const py = 125 - y;
    return i === 0 ? `M ${px},${py}` : `${acc} L ${px},${py}`;
  }, "");

  return (
    <svg viewBox="0 0 340 150" className="h-auto w-full">
      <Plot title="хорошо обобщает" path={goodPath} pathColor="#2A7F8C" />
      <g transform="translate(180,0)">
        <Plot title="переобучение" path={overfitPath} pathColor="#a83216" />
      </g>
    </svg>
  );
}
