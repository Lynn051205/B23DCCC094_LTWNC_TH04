"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import AppIcon from "@/components/AppIcon";
import CompletionControl from "@/components/CompletionControl";
import { can } from "@/lib/permissions";
import { formatDueDate } from "@/lib/format";
import type { DeadlineWithSubject, Subject } from "@/types";

type StatusFilter = "all" | "upcoming" | "overdue" | "completed";

export default function DeadlineExplorer({
  deadlines,
  subjects,
  initialCompletedIds,
  initialProgressUserId,
  showStats = true,
}: {
  deadlines: DeadlineWithSubject[];
  subjects: Subject[];
  initialCompletedIds?: string[];
  initialProgressUserId?: string;
  showStats?: boolean;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [query, setQuery] = useState("");
  const [subjectId, setSubjectId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [progress, setProgress] = useState<{
    userId: string;
    completedIds: Set<string>;
    error: string;
  } | null>(
    initialCompletedIds && initialProgressUserId
      ? {
          userId: initialProgressUserId,
          completedIds: new Set(initialCompletedIds),
          error: "",
        }
      : null,
  );
  const userId = session?.user.id;
  const initialProgressMatches =
    Boolean(initialCompletedIds) && initialProgressUserId === userId;
  const completedIds = useMemo(() => {
    if (initialProgressMatches) {
      return new Set(initialCompletedIds ?? []);
    }

    return progress && progress.userId === userId ? progress.completedIds : null;
  }, [initialCompletedIds, initialProgressMatches, progress, userId]);
  const progressError =
    progress && progress.userId === userId ? progress.error : "";
  const canComplete = Boolean(
    session?.user.role && can(session.user.role, "complete_deadline"),
  );

  useEffect(() => {
    if (initialProgressMatches) {
      return;
    }

    if (sessionStatus === "loading" || !userId) {
      return;
    }
    const activeUserId = userId;

    const controller = new AbortController();

    async function loadProgress() {
      try {
        const response = await fetch("/api/progress", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Không thể tải tiến độ cá nhân.");
        }

        const data = (await response.json()) as {
          completedDeadlineIds: string[];
        };
        setProgress({
          userId: activeUserId,
          completedIds: new Set(data.completedDeadlineIds),
          error: "",
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setProgress({
          userId: activeUserId,
          completedIds: new Set(),
          error:
            error instanceof Error
              ? error.message
              : "Không thể tải tiến độ cá nhân.",
        });
      }
    }

    void loadProgress();
    return () => controller.abort();
  }, [initialProgressMatches, sessionStatus, userId]);

  const filteredDeadlines = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");

    return deadlines.filter((deadline) => {
      const matchesQuery =
        !normalizedQuery ||
        deadline.title.toLocaleLowerCase("vi").includes(normalizedQuery) ||
        deadline.subject.name.toLocaleLowerCase("vi").includes(normalizedQuery);
      const matchesSubject =
        subjectId === "all" || deadline.subjectId === subjectId;
      const isCompleted = completedIds?.has(deadline.id) ?? false;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "upcoming" &&
          deadline.status.className !== "status-overdue") ||
        (statusFilter === "overdue" &&
          deadline.status.className === "status-overdue") ||
        (statusFilter === "completed" && isCompleted);

      return matchesQuery && matchesSubject && matchesStatus;
    });
  }, [completedIds, deadlines, query, statusFilter, subjectId]);

  const completedCount = completedIds
    ? deadlines.filter((deadline) => completedIds.has(deadline.id)).length
    : null;

  return (
    <>
      {showStats ? (
      <section aria-label="Thống kê deadline" className="stats-grid">
        <div className="stats-summary">
          <strong>{deadlines.length}</strong>
          <span>Tổng deadline</span>
        </div>
        <div className="stats-summary">
          <strong>
            {deadlines.filter(
              (deadline) => deadline.status.className !== "status-overdue",
            ).length}
          </strong>
          <span>Còn hạn</span>
        </div>
        <div className="stats-summary stats-summary-alert">
          <strong>
            {
              deadlines.filter(
                (deadline) => deadline.status.className === "status-overdue",
              ).length
            }
          </strong>
          <span>Quá hạn</span>
        </div>
        {session?.user ? (
          <div className="stats-summary">
            <strong>{completedCount ?? "…"}</strong>
            <span>Hoàn thành của bạn</span>
          </div>
        ) : null}
      </section>
      ) : null}

      <section aria-label="Tìm kiếm và lọc deadline" className="filter-panel">
        <label className="search-field">
          <AppIcon name="search" />
          <span className="visually-hidden">Tìm theo deadline hoặc môn học</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo deadline hoặc môn học"
            type="search"
            value={query}
          />
        </label>
        <label className="filter-field">
          <span>Môn học</span>
          <select
            onChange={(event) => setSubjectId(event.target.value)}
            value={subjectId}
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Trạng thái</span>
          <select
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            value={statusFilter}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="upcoming">Còn hạn</option>
            <option value="overdue">Quá hạn</option>
            {session?.user ? (
              <option value="completed">Đã hoàn thành</option>
            ) : null}
          </select>
        </label>
      </section>

      {progressError ? (
        <p className="form-message form-message-error" role="alert">
          {progressError}
        </p>
      ) : null}

      <div aria-live="polite" className="results-caption">
        Hiển thị {filteredDeadlines.length} / {deadlines.length} deadline
      </div>

      {filteredDeadlines.length > 0 ? (
        <div className="deadline-record-list">
          {filteredDeadlines.map((deadline) => {
            const completed = completedIds?.has(deadline.id) ?? false;

            return (
              <article className="deadline-record" key={deadline.id}>
                <div className="record-main">
                  <Link
                    className="deadline-subject"
                    href={`/subjects/${deadline.subject.slug}`}
                  >
                    {deadline.subject.name}
                  </Link>
                  <h2>
                    <Link href={`/deadlines/${deadline.id}`}>
                      {deadline.title}
                    </Link>
                  </h2>
                  <p>{deadline.description}</p>
                </div>
                <div className="record-due" data-label="Hạn nộp">
                  <span>{formatDueDate(deadline.dueAt)}</span>
                </div>
                <div className="record-status" data-label="Trạng thái">
                  {completed ? (
                    <span className="status-badge status-completed">
                      Đã hoàn thành
                    </span>
                  ) : (
                    <span
                      className={`status-badge ${deadline.status.className}`}
                    >
                      {deadline.status.label}
                    </span>
                  )}
                </div>
                <div className="record-actions">
                  {canComplete && completedIds ? (
                    <CompletionControl
                      completed={completed}
                      deadlineId={deadline.id}
                      onCompletedChange={(next) => {
                        if (!userId) {
                          return;
                        }

                        setProgress((current) => {
                          const updated = new Set(
                            current?.userId === userId
                              ? current.completedIds
                              : [],
                          );
                          if (next) {
                            updated.add(deadline.id);
                          } else {
                            updated.delete(deadline.id);
                          }
                          return { userId, completedIds: updated, error: "" };
                        });
                      }}
                    />
                  ) : null}
                  <Link
                    className="record-detail-link"
                    href={`/deadlines/${deadline.id}`}
                  >
                    Chi tiết <AppIcon name="chevron" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state filter-empty">
          <span aria-hidden="true">
            <AppIcon name="filter" />
          </span>
          <h2>Không tìm thấy deadline phù hợp</h2>
          <p>Thử đổi từ khóa hoặc bộ lọc để xem thêm kết quả.</p>
          <button
            className="button-secondary"
            onClick={() => {
              setQuery("");
              setSubjectId("all");
              setStatusFilter("all");
            }}
            type="button"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </>
  );
}
