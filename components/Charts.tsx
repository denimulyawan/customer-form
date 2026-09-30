/**
 * Hand-drawn SVG charts.
 *
 * No charting library: the shapes are simple, they render on the server with
 * zero JavaScript, and nothing can break on a dependency upgrade.
 */

const COLORS = [
  '#1d4ed8',
  '#0e7490',
  '#7c3aed',
  '#b45309',
  '#be123c',
  '#15803d',
  '#9333ea',
  '#475467',
];

export type Slice = {
  label: string;
  value: number;
};

/* ============================== Donut ============================== */

export function DonutChart({
  data,
  centerLabel,
  emptyText,
}: {
  data: Slice[];
  centerLabel: string;
  emptyText: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="chart-empty">{emptyText}</p>;
  }

  const R = 70;
  const CIRC = 2 * Math.PI * R;
  const GAP = 2.5;

  let offset = 0;
  const segments = data.map((d, i) => {
    const length = (d.value / total) * CIRC;
    const seg = {
      color: COLORS[i % COLORS.length],
      dash: `${Math.max(length - GAP, 0.5)} ${CIRC - Math.max(length - GAP, 0.5)}`,
      offset: -offset,
    };
    offset += length;
    return seg;
  });

  return (
    <div className="donut-wrap">
      <div className="donut-box">
        <svg viewBox="0 0 200 200" className="donut" role="img" aria-label={centerLabel}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#eef1f5" strokeWidth="26" />
          <g transform="rotate(-90 100 100)">
            {segments.map((s, i) => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="26"
                strokeDasharray={s.dash}
                strokeDashoffset={s.offset}
              />
            ))}
          </g>
          <text
            x="100"
            y="96"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill="#101828"
          >
            {total}
          </text>
          <text x="100" y="116" textAnchor="middle" fontSize="11" fill="#98a2b3">
            {centerLabel}
          </text>
        </svg>
      </div>

      <ul className="legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <span
              className="legend-dot"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="legend-label">{d.label}</span>
            <span className="legend-value">{d.value}</span>
            <span className="legend-pct">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================ Column chart ============================ */

export function ColumnChart({
  data,
  emptyText,
  valueSuffix = '',
}: {
  data: Slice[];
  emptyText: string;
  valueSuffix?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <p className="chart-empty">{emptyText}</p>;
  }

  const W = 560;
  const H = 210;
  const padTop = 26;
  const padBottom = 30;
  const padSide = 10;

  const plotW = W - padSide * 2;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = plotW / data.length;
  const barW = Math.min(slot * 0.5, 54);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="columns"
      role="img"
      aria-label="Column chart"
    >
      {/* baseline */}
      <line
        x1={padSide}
        y1={H - padBottom}
        x2={W - padSide}
        y2={H - padBottom}
        stroke="#e4e7ec"
        strokeWidth="1"
      />

      {data.map((d, i) => {
        const h = (d.value / max) * plotH;
        const x = padSide + slot * i + (slot - barW) / 2;
        const y = H - padBottom - h;
        const naik = d.value > 0;

        return (
          <g key={d.label}>
            {naik ? (
              <>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="5"
                  fill="url(#gradBar)"
                />
                <text
                  x={x + barW / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="12.5"
                  fontWeight="700"
                  fill="#101828"
                >
                  {d.value}
                  {valueSuffix}
                </text>
              </>
            ) : (
              <rect
                x={x}
                y={H - padBottom - 3}
                width={barW}
                height={3}
                rx="1.5"
                fill="#e4e7ec"
              />
            )}
            <text
              x={x + barW / 2}
              y={H - padBottom + 18}
              textAnchor="middle"
              fontSize="12"
              fill="#667085"
            >
              {d.label}
            </text>
          </g>
        );
      })}

      <defs>
        <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
