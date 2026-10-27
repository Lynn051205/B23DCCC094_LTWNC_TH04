import Link from "next/link";
import type { Subject } from "@/types";

export default function SubjectCard({
  subject,
  deadlineCount,
}: {
  subject: Subject;
  deadlineCount: number;
}) {
  return (
    <article className="subject-card">
      <span aria-hidden="true" className="subject-icon">
        {subject.name.slice(0, 2).toLocaleUpperCase("vi")}
      </span>
      <h3>{subject.name}</h3>
      {subject.description ? <p>{subject.description}</p> : null}
      <span className="subject-deadline-count">
        {deadlineCount} deadline
        {deadlineCount === 1 ? "" : "s"}
      </span>
      <Link className="subject-card-link" href={`/subjects/${subject.slug}`}>
        Xem môn học <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
