import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeadlineCard from "@/components/DeadlineCard";
import { getDeadlinesForSubject, getSubjectBySlug, getSubjects } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

interface SubjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const subjects = await getSubjects();

  return subjects.map((subject) => ({ slug: subject.slug }));
}

export async function generateMetadata({
  params,
}: SubjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    return {};
  }

  const url = `/subjects/${encodeURIComponent(subject.slug)}`;

  return {
    title: subject.name,
    description: subject.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: "Class Deadline Hub",
      title: subject.name,
      description: subject.description,
      url: new URL(url, getSiteUrl()),
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${subject.name} - Class Deadline Hub`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: subject.name,
      description: subject.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const deadlines = await getDeadlinesForSubject(subject.id);

  return (
    <>
      <nav aria-label="Đường dẫn" className="breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/#subjects">Môn học</Link>
        <span aria-hidden="true">/</span>
        <span>{subject.name}</span>
      </nav>
      <header className="page-heading">
        <p className="eyebrow">Môn học</p>
        <h1>{subject.name}</h1>
        <p>{subject.description}</p>
        <p className="subject-deadline-count">
          {deadlines.length} deadline trong môn học này.
        </p>
      </header>

      <section aria-labelledby="subject-deadlines-title" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Kế hoạch môn học</p>
            <h2 id="subject-deadlines-title">Deadline của môn</h2>
          </div>
        </div>
        {deadlines.length > 0 ? (
          <div className="deadline-list">
            {deadlines.map((deadline) => (
              <DeadlineCard deadline={deadline} key={deadline.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">Môn học này chưa có deadline nào.</div>
        )}
      </section>

      <div className="content-section">
        <Link className="text-link" href="/deadlines">
          Xem tất cả deadline →
        </Link>
      </div>
    </>
  );
}
