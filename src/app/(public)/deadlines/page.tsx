import type { Metadata } from "next";
import DeadlineExplorer from "@/components/DeadlineExplorer";
import { getDeadlines, getSubjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Deadline",
  description: "Danh sách deadline của tất cả các môn học.",
  alternates: { canonical: "/deadlines" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Class Deadline Hub",
    title: "Deadline",
    description: "Danh sách deadline của tất cả các môn học.",
    url: "/deadlines",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Deadline - Class Deadline Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deadline",
    description: "Danh sách deadline của tất cả các môn học.",
    images: ["/opengraph-image"],
  },
};

export default async function DeadlinesPage() {
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);

  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Kế hoạch học tập</p>
          <h1>Tất cả deadline</h1>
          <p>
            Theo dõi hạn nộp, môn học và trạng thái của từng bài tập tại một nơi.
          </p>
        </div>
      </header>
      <DeadlineExplorer deadlines={deadlines} subjects={subjects} />
    </>
  );
}
