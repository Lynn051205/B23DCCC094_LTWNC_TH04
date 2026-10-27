import Link from "next/link";
import { formatDueDate } from "@/lib/format";
import type { DeadlineWithSubject } from "@/types";

export default function DeadlineCard({
  deadline,
  showStatus = false,
}: {
  deadline: DeadlineWithSubject;
  showStatus?: boolean;
}) {
  return (
    <article className="deadline-card">
      <div className="deadline-main">
        <Link
          className="deadline-subject"
          href={`/subjects/${deadline.subject.slug}`}
        >
          {deadline.subject.name}
        </Link>
        <h3>
          <Link href={`/deadlines/${deadline.id}`}>{deadline.title}</Link>
        </h3>
        <p>{deadline.description}</p>
      </div>
      <div className="deadline-meta">
        <time dateTime={deadline.dueAt}>{formatDueDate(deadline.dueAt)}</time>
        <span className={`status-badge ${deadline.status.className}`}>
          {deadline.status.label}
        </span>
        {showStatus ? (
          <Link className="record-detail-link" href={`/deadlines/${deadline.id}`}>
            Xem chi tiết <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
