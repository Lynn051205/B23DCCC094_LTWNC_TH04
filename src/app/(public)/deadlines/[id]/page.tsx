import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeadlineCompletion from "@/components/DeadlineCompletion";
import { getDeadlineById, getDeadlines } from "@/lib/data";
import { formatDueDate } from "@/lib/format";
import { serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";

interface DeadlinePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const deadlines = await getDeadlines();

  return deadlines.map((deadline) => ({ id: deadline.id }));
}

export async function generateMetadata({
  params,
}: DeadlinePageProps): Promise<Metadata> {
  const { id } = await params;
  const deadline = await getDeadlineById(id);

  if (!deadline) {
    notFound();
  }

  const path = `/deadlines/${encodeURIComponent(deadline.id)}`;
  const image = `${path}/opengraph`;

  return {
    title: deadline.title,
    description: deadline.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "vi_VN",
      siteName: "Class Deadline Hub",
      title: deadline.title,
      description: deadline.description,
      url: new URL(path, getSiteUrl()),
      publishedTime: deadline.createdAt,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${deadline.title} - ${deadline.subject.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: deadline.title,
      description: deadline.description,
      images: [image],
    },
  };
}

export default async function DeadlinePage({ params }: DeadlinePageProps) {
  const { id } = await params;
  const deadline = await getDeadlineById(id);

  if (!deadline) {
    notFound();
  }

  const pageUrl = new URL(
    `/deadlines/${encodeURIComponent(deadline.id)}`,
    getSiteUrl(),
  ).toString();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: new URL("/", getSiteUrl()).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Deadline",
        item: new URL("/deadlines", getSiteUrl()).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: deadline.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumb) }}
        type="application/ld+json"
      />
      <nav aria-label="Đường dẫn" className="breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/deadlines">Deadline</Link>
        <span aria-hidden="true">/</span>
        <span>{deadline.title}</span>
      </nav>
      <article className="detail-panel deadline-detail-panel">
        <p className="eyebrow">Chi tiết deadline</p>
        <Link
          className="deadline-subject"
          href={`/subjects/${deadline.subject.slug}`}
        >
          {deadline.subject.name}
        </Link>
        <h1>{deadline.title}</h1>
        <p className="detail-description">{deadline.description}</p>

        <dl className="detail-grid">
          <div className="detail-item">
            <dt>Hạn nộp</dt>
            <dd>
              <time dateTime={deadline.dueAt}>
                {formatDueDate(deadline.dueAt)}
              </time>
            </dd>
          </div>
          <div className="detail-item">
            <dt>Trạng thái</dt>
            <dd>
              <span
                className={`status-badge ${deadline.status.className}`}
              >
                {deadline.status.label}
              </span>
            </dd>
          </div>
          <div className="detail-item">
            <dt>Thời gian</dt>
            <dd>
              <time dateTime={deadline.dueAt}>
                {formatDueDate(deadline.dueAt)}
              </time>
            </dd>
          </div>
          <div className="detail-item">
            <dt>Hình thức nộp</dt>
            <dd>{deadline.submissionType}</dd>
          </div>
          <div className="detail-item">
            <dt>Môn học</dt>
            <dd>{deadline.subject.name}</dd>
          </div>
        </dl>

        <section aria-labelledby="instructions-title" className="detail-instructions">
          <h2 id="instructions-title">Yêu cầu bài tập</h2>
          <p>{deadline.instructions}</p>
        </section>
        <div className="detail-actions">
          <Link className="button-secondary" href="/deadlines">
            ← Quay lại danh sách
          </Link>
          <DeadlineCompletion deadlineId={deadline.id} />
        </div>
      </article>
    </>
  );
}
