type TrendPoint = {
  label: string
  value: number
}

type TrendChartProps = {
  title: string
  points: TrendPoint[]
  unit?: string
}

export default function TrendChart({ title, points, unit = '' }: TrendChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1)

  return (
    <article className="trend-card">
      <h4>{title}</h4>
      <div className="trend-bars" role="img" aria-label={`${title} trend`}> 
        {points.map((point) => (
          <div key={point.label} className="trend-bars__item">
            <div
              className="trend-bars__bar"
              style={{ height: `${Math.max((point.value / max) * 100, 8)}%` }}
              title={`${point.label}: ${point.value.toLocaleString()}${unit}`}
            />
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
