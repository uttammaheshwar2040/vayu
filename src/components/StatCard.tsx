type StatCardProps = {
  label: string
  value: string
  helper: string
}

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__helper">{helper}</p>
    </article>
  )
}
