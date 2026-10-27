import type { Deadline } from "@/types";

const vietnameseDateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatDueDate(value: string): string {
  return vietnameseDateTime.format(new Date(value));
}

export function getDeadlineStatus(deadline: Deadline, now = Date.now()) {
  const dueAt = Date.parse(deadline.dueAt);
  const remainingMilliseconds = dueAt - now;
  const oneWeekMilliseconds = 7 * 24 * 60 * 60 * 1000;

  if (remainingMilliseconds < 0) {
    return { label: "Quá hạn", className: "status-overdue" };
  }

  if (remainingMilliseconds <= oneWeekMilliseconds) {
    return { label: "Sắp đến hạn", className: "status-soon" };
  }

  return { label: "Còn hạn", className: "status-upcoming" };
}
