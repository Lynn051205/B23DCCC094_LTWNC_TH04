import type { Metadata } from "next";
import { connection } from "next/server";
import DeadlineCreateForm from "@/components/DeadlineCreateForm";
import DeadlineDeleteButton from "@/components/DeadlineDeleteButton";
import StatCard from "@/components/StatCard";
import { requirePermissionForPath } from "@/lib/auth-server";
import { getDeadlines, getSubjects } from "@/lib/data";
import { formatDueDate } from "@/lib/format";
import { can } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản trị deadline",
  robots: { index: false, follow: false },
};

interface AdminPageProps {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection();
  const query = await searchParams;
  const admin = await requirePermissionForPath("create_deadline", "/admin");
  const [deadlines, subjects] = await Promise.all([
    getDeadlines(),
    getSubjects(),
  ]);
  const canDelete = can(admin.role, "delete_deadline");
  const overdueCount = deadlines.filter(
    (deadline) => deadline.status.className === "status-overdue",
  ).length;
  const upcomingCount = deadlines.length - overdueCount;

  return (
    <>
      <header className="page-heading dashboard-welcome">
        <div>
          <p className="eyebrow">Khu vực quản trị</p>
          <h1>Quản lý deadline</h1>
          <p>Thêm, theo dõi hoặc xóa deadline của các môn học.</p>
        </div>
      </header>

      <section aria-label="Thống kê quản trị" className="dashboard-stats-grid">
        <StatCard
          hint="Tất cả môn học"
          icon="calendar"
          label="Tổng deadline"
          tone="navy"
          value={deadlines.length}
        />
        <StatCard
          hint="Đang trong thời hạn"
          icon="clock"
          label="Còn hạn"
          tone="teal"
          value={upcomingCount}
        />
        <StatCard
          hint="Đã qua hạn nộp"
          icon="admin"
          label="Quá hạn"
          tone="red"
          value={overdueCount}
        />
        <StatCard
          hint="Đang được quản lý"
          icon="book"
          label="Môn học"
          tone="amber"
          value={subjects.length}
        />
      </section>

      <section aria-labelledby="create-deadline-title" className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">Tạo dữ liệu mới</p>
            <h2 id="create-deadline-title">Thêm deadline</h2>
          </div>
          <span className="panel-count">{subjects.length} môn học</span>
        </div>
        <DeadlineCreateForm subjects={subjects} />
      </section>

      {query.deleted === "1" ? (
        <p className="form-message form-message-success" role="status">
          Đã xóa deadline và làm mới các trang liên quan.
        </p>
      ) : null}

      <section aria-labelledby="admin-deadlines-title" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dữ liệu hiện tại</p>
            <h2 id="admin-deadlines-title">Deadline ({deadlines.length})</h2>
            <p>Danh sách đầy đủ tên môn, hạn nộp và trạng thái.</p>
          </div>
        </div>
        {deadlines.length > 0 ? (
          <div className="admin-table">
            <div className="admin-table-head">
              <span>Deadline</span>
              <span>Môn học</span>
              <span>Hạn nộp</span>
              <span>Trạng thái</span>
              <span>Thao tác</span>
            </div>
            {deadlines.map((deadline) => (
              <article className="admin-deadline-row" key={deadline.id}>
                <div className="admin-cell admin-deadline-name" data-label="Deadline">
                  <h3>{deadline.title}</h3>
                  <p>Mã: {deadline.id}</p>
                </div>
                <div className="admin-cell" data-label="Môn học">
                  <span className="deadline-subject">
                    {deadline.subject.name}
                  </span>
                </div>
                <div className="admin-cell" data-label="Hạn nộp">
                  <time dateTime={deadline.dueAt}>
                    {formatDueDate(deadline.dueAt)}
                  </time>
                </div>
                <div className="admin-cell" data-label="Trạng thái">
                  <span
                    className={`status-badge ${deadline.status.className}`}
                  >
                    {deadline.status.label}
                  </span>
                </div>
                {canDelete ? (
                  <div className="admin-cell admin-cell-actions" data-label="Thao tác">
                    <DeadlineDeleteButton
                      deadlineId={deadline.id}
                      deadlineTitle={deadline.title}
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">Chưa có deadline nào.</div>
        )}
      </section>
    </>
  );
}
