import type { Metadata } from "next";
import Link from "next/link";
import DeadlineCard from "@/components/DeadlineCard";
import StatCard from "@/components/StatCard";
import SubjectCard from "@/components/SubjectCard";
import { getHomePageData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "Quản lý môn học và theo dõi các hạn nộp bài tập sắp tới tại Class Deadline Hub.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { subjects, deadlines, upcomingDeadlines } = await getHomePageData();
  const overdueCount = deadlines.filter(
    (deadline) => deadline.status.className === "status-overdue",
  ).length;
  const upcomingCount = deadlines.length - overdueCount;

  return (
    <>
      <header className="page-heading dashboard-welcome">
        <div>
          <p className="eyebrow">Tổng quan lớp học</p>
          <h1>Mọi hạn nộp, trong tầm mắt.</h1>
          <p>
            Theo dõi deadline theo môn học và chủ động sắp xếp kế hoạch học tập.
          </p>
        </div>
        <Link className="button-primary" href="/deadlines">
          <span>Xem tất cả deadline</span>
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section aria-label="Thống kê lớp học" className="dashboard-stats-grid">
        <StatCard
          hint="Trong danh sách hiện tại"
          icon="calendar"
          label="Tổng deadline"
          tone="navy"
          value={deadlines.length}
        />
        <StatCard
          hint="Chưa quá hạn"
          icon="clock"
          label="Còn hạn"
          tone="teal"
          value={upcomingCount}
        />
        <StatCard
          hint="Cần ưu tiên xử lý"
          icon="admin"
          label="Quá hạn"
          tone="red"
          value={overdueCount}
        />
        <StatCard
          hint="Môn học đang theo dõi"
          icon="book"
          label="Môn học"
          tone="amber"
          value={subjects.length}
        />
      </section>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Học tập chủ động hơn</p>
          <h2>Chia nhỏ kế hoạch, hoàn thành đúng hạn.</h2>
          <p className="hero-description">
            Theo dõi deadline theo từng môn học, sắp xếp ưu tiên và dành thời
            gian cho điều quan trọng nhất: học tập.
          </p>
          <Link className="button-primary" href="/deadlines">
            Xem các deadline
          </Link>
        </div>
      </section>

      <section aria-labelledby="upcoming-title" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Đừng bỏ lỡ</p>
            <h2 id="upcoming-title">Deadline sắp tới</h2>
            <p>Các hạn nộp gần nhất từ những môn học của bạn.</p>
          </div>
          <Link className="text-link" href="/deadlines">
            Xem tất cả →
          </Link>
        </div>
        {upcomingDeadlines.length > 0 ? (
          <div className="deadline-list">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineCard
                deadline={deadline}
                key={deadline.id}
                showStatus
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">Hiện chưa có deadline sắp tới.</div>
        )}
      </section>

      <section
        aria-labelledby="subjects-title"
        className="content-section"
        id="subjects"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Không gian học tập</p>
            <h2 id="subjects-title">Môn học của bạn</h2>
            <p>Chọn một môn để xem thông tin và các bài cần hoàn thành.</p>
          </div>
        </div>
        <div className="subject-grid">
          {subjects.map((subject) => {
            const deadlineCount = deadlines.filter(
              (deadline) => deadline.subjectId === subject.id,
            ).length;

            return (
              <SubjectCard
                deadlineCount={deadlineCount}
                key={subject.id}
                subject={subject}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
