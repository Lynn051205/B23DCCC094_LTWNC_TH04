export interface Subject {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export type Role = "guest" | "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Exclude<Role, "guest">;
}

export interface Deadline {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueAt: string;
  submissionType: string;
  instructions: string;
  createdAt: string;
}

export interface DeadlineWithSubject extends Deadline {
  subject: Subject;
  status: DeadlineStatus;
}

export interface DeadlineStatus {
  label: string;
  className: string;
}

export interface UserProgress {
  userId: string;
  deadlineId: string;
  completed: boolean;
  completedAt: string | null;
}
