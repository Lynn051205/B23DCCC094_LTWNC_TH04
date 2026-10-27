import AppIcon from "@/components/AppIcon";

type StatIcon = "calendar" | "clock" | "admin" | "book" | "check";
type StatTone = "navy" | "teal" | "amber" | "red" | "green";

export default function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: StatIcon;
  label: string;
  value: number | string;
  hint: string;
  tone: StatTone;
}) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-copy">
        <span className="stat-card-label">{label}</span>
        <strong className="stat-card-value">{value}</strong>
        <span className="stat-card-hint">{hint}</span>
      </div>
      <span aria-hidden="true" className="stat-card-icon">
        <AppIcon name={icon} />
      </span>
    </article>
  );
}
