export interface TrendChartProps {
  data: number[]
  height?: number
}

const VIEW_W = 600

export function TrendChart({ data, height = 120 }: TrendChartProps) {
  if (data.length < 2) return <p style={{ color: 'var(--ink-faint)' }}>–</p>

  const pad = 6
  const max = Math.max(...data, 20)
  const step = (VIEW_W - pad * 2) / (data.length - 1)

  const pts = data.map((v, i) => [pad + i * step, height - pad - (v / max) * (height - pad * 2)])
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${pad},${height} ${line} ${pad + step * (data.length - 1)},${height}`

  const lastY = pts[pts.length - 1][1]

  return (
    <div className="trend">
      <svg viewBox={`0 0 ${VIEW_W} ${height}`} role="img" aria-label="WPM trend">
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trend-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === pts.length - 1 ? 4.5 : 3}
            fill={i === pts.length - 1 ? 'var(--brand)' : 'var(--panel)'}
            stroke="var(--brand)"
            strokeWidth="2"
          />
        ))}
        <text
          x={VIEW_W - pad}
          y={Math.max(lastY - 8, 12)}
          textAnchor="end"
          fontSize="14"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          fill="var(--ink)"
        >
          {data[data.length - 1]}
        </text>
      </svg>
    </div>
  )
}