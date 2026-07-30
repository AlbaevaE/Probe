export function AiMlVenn() {
  return (
    <svg viewBox="0 0 360 280" className="h-auto w-full">
      <defs>
        <style>{`
          .ring { fill: none; stroke-width: 1.5; }
          .label { font: 600 12px ui-serif, "Iowan Old Style", Georgia, serif; fill: #241F1A; }
          .sub { font: 500 10px ui-serif, "Iowan Old Style", Georgia, serif; fill: #8A8175; }
        `}</style>
      </defs>

      <rect x="20" y="20" width="320" height="240" rx="18" className="ring" stroke="#E05C4A" opacity="0.9" fill="#E05C4A" fillOpacity="0.06" />
      <text x="34" y="42" className="label">ИИ / AI</text>
      <text x="34" y="55" className="sub">зонтичный термин</text>

      <rect x="50" y="70" width="260" height="170" rx="14" className="ring" stroke="#E05C4A" opacity="0.95" fill="#E05C4A" fillOpacity="0.1" />
      <text x="64" y="92" className="label">Машинное обучение</text>
      <text x="64" y="105" className="sub">учится на данных</text>

      <rect x="80" y="115" width="200" height="110" rx="12" className="ring" stroke="#E05C4A" fill="#E05C4A" fillOpacity="0.14" />
      <text x="94" y="137" className="label">Нейросети</text>
      <text x="94" y="150" className="sub">слои нелинейных функций</text>

      <rect x="110" y="165" width="140" height="50" rx="10" className="ring" stroke="#E05C4A" fill="#E05C4A" fillOpacity="0.22" />
      <text x="124" y="187" className="label">LLM</text>
      <text x="124" y="200" className="sub">большие языковые модели</text>
    </svg>
  );
}
