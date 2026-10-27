"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CompletionControl from "@/components/CompletionControl";
import { can } from "@/lib/permissions";

export default function DeadlineCompletion({
  deadlineId,
}: {
  deadlineId: string;
}) {
  const { data: session, status } = useSession();
  const [progress, setProgress] = useState<{
    userId: string;
    deadlineId: string;
    completed: boolean;
    error: string;
  } | null>(null);
  const userId = session?.user.id;
  const currentProgress =
    progress &&
    progress.userId === userId &&
    progress.deadlineId === deadlineId
      ? progress
      : null;

  useEffect(() => {
    if (status === "loading" || !userId) {
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
          deadlineId,
          completed: data.completedDeadlineIds.includes(deadlineId),
          error: "",
        });
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }

        setProgress({
          userId: activeUserId,
          deadlineId,
          completed: false,
          error:
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải tiến độ cá nhân.",
        });
      }
    }

    void loadProgress();
    return () => controller.abort();
  }, [deadlineId, status, userId]);

  if (!session?.user || !can(session.user.role, "complete_deadline")) {
    return null;
  }

  if (!currentProgress) {
    return (
      <span aria-live="polite" className="progress-loading">
        Đang tải tiến độ…
      </span>
    );
  }

  if (currentProgress.error) {
    return (
      <span className="form-message form-message-error" role="alert">
        {currentProgress.error}
      </span>
    );
  }

  return (
    <CompletionControl
      completed={currentProgress.completed}
      deadlineId={deadlineId}
      onCompletedChange={(completed) => {
        if (!userId) {
          return;
        }

        setProgress({ userId, deadlineId, completed, error: "" });
      }}
    />
  );
}
