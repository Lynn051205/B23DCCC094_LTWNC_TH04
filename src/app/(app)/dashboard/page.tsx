import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import DeadlineExplorer from "@/components/DeadlineExplorer";
import StatCard from "@/components/StatCard";
import { requirePermission } from "@/lib/auth-server";
import {
  getDeadlines,
  getProgressForUser,
  getSubjects,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  await connection();
  const user = await requirePermission("view_deadline");
  const [deadlines, subjects, userProgress] = await Promise.all([
    getDeadlines(),
    getSubjects(),
    getProgressForUser(user.id),
  ]);
  const completedIds = new Set(
    userProgress
      .filter((progress) => progress.completed)
      .map((progress) => progress.deadlineId),
  );
  const completedCount = deadlines.filter((item) =>
    completedIds.has(item.id),
  ).length;
  const remainingCount = deadlines.length - completedCount;
  const completionPercent =
    deadlines.length === 0
      ? 0
      : Math.round((completedCount / deadlines.length) * 100);
  const overdueCount = deadlines.filter(
    (deadline) =>
      deadline.status.className === "status-overdue" &&
      !completedIds.has(deadline.id),
  ).length;

  return (
    <>
      <header className="page-heading dashboard-welcome">
        <div>
          <p className="eyebrow">Tổng quan cá nhân</p>
          <h1>Xin chào, {user.name}</h1>
          <p>Theo dõi tiến độ hoàn thành deadline của riêng bạn.</p>
        </div>
        <Link className="button-primary" href="/deadlines">
          Khám phá deadline <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section aria-label="Thống kê tiến độ cá nhân" className="dashboard-stats-grid">
        <StatCard
          hint="Tất cả môn học"
          icon="calendar"
          label="Tổng deadline"
          tone="navy"
          value={deadlines.length}
        />
        <StatCard
          hint="Tiến độ cá nhân"
          icon="check"
          label="Đã hoàn thành"
          tone="teal"
          value={completedCount}
        />
        <StatCard
          hint="Chờ bạn hoàn thành"
          icon="clock"
          label="Chưa hoàn thành"
          tone="amber"
          value={remainingCount}
        />
        <StatCard
          hint="Chưa hoàn thành và quá hạn"
          icon="admin"
          label="Cần ưu tiên"
          tone="red"
          value={overdueCount}
        />
      </section>

      <section aria-label="Tỷ lệ hoàn thành" className="progress-panel">
        <div className="progress-panel-heading">
          <div>
            <p className="eyebrow">Tiến độ tổng thể</p>
            <h2>Hoàn thành {completionPercent}%</h2>
          </div>
          <strong>
            {completedCount} / {deadlines.length}
          </strong>
        </div>
        <div
          aria-label={`Đã hoàn thành ${completionPercent}% deadline`}
          className="progress-track"
          role="progressbar"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={completionPercent}
        >
          <span style={{ width: `${completionPercent}%` }} />
        </div>
      </section>

      <section aria-labelledby="my-deadlines-title" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Kế hoạch cá nhân</p>
            <h2 id="my-deadlines-title">Deadline của tôi</h2>
            <p>Các trạng thái hoàn thành chỉ hiển thị với tài khoản của bạn.</p>
          </div>
        </div>
        <DeadlineExplorer
          deadlines={deadlines}
          initialCompletedIds={[...completedIds]}
          initialProgressUserId={user.id}
          showStats={false}
          subjects={subjects}
        />
      </section>
    </>
  );
}
