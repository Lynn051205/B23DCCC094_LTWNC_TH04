import "server-only";

import { randomUUID } from "node:crypto";
import { open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { getDeadlineStatus } from "@/lib/format";
import type {
  Deadline,
  DeadlineWithSubject,
  Subject,
  UserProgress,
} from "@/types";

const dataDirectory = path.join(process.cwd(), "data");
const deadlineCacheSeconds = 60;
let writeQueue: Promise<void> = Promise.resolve();

export interface NewDeadline {
  subjectId: string;
  title: string;
  description: string;
  dueAt: string;
  submissionType: string;
  instructions: string;
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isSubject(value: unknown): value is Subject {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.slug) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.description)
  );
}

function isDeadline(value: unknown): value is Deadline {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.subjectId) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isValidDate(value.dueAt) &&
    isNonEmptyString(value.submissionType) &&
    isNonEmptyString(value.instructions) &&
    isValidDate(value.createdAt)
  );
}

function isUserProgress(value: unknown): value is UserProgress {
  return (
    isRecord(value) &&
    isNonEmptyString(value.userId) &&
    isNonEmptyString(value.deadlineId) &&
    typeof value.completed === "boolean" &&
    (value.completedAt === null || isValidDate(value.completedAt))
  );
}

function assertUnique(values: string[], label: string, fileName: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`Dữ liệu ${fileName} có ${label} bị trùng.`);
  }
}

async function readJson(fileName: string): Promise<unknown> {
  const filePath = path.join(dataDirectory, fileName);
  let contents: string;

  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") {
      throw new Error(`Không tìm thấy tệp dữ liệu bắt buộc: ${filePath}`);
    }

    throw error;
  }

  try {
    return JSON.parse(contents) as unknown;
  } catch (error) {
    throw new Error(`Tệp dữ liệu ${filePath} không phải JSON hợp lệ.`, {
      cause: error,
    });
  }
}

async function writeJsonAtomically(fileName: string, value: unknown): Promise<void> {
  const destination = path.join(dataDirectory, fileName);
  const temporary = `${destination}.${process.pid}.${randomUUID()}.tmp`;
  const file = await open(temporary, "wx");

  try {
    await file.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
    await file.sync();
    await file.close();
    await rename(temporary, destination);
  } catch (error) {
    await file.close().catch((closeError: unknown) => {
      if (!isRecord(closeError) || closeError.code !== "EBADF") {
        throw closeError;
      }
    });
    await unlink(temporary).catch((cleanupError: unknown) => {
      if (!isRecord(cleanupError) || cleanupError.code !== "ENOENT") {
        throw cleanupError;
      }
    });
    throw new Error(`Không thể ghi tệp dữ liệu ${destination}.`, { cause: error });
  }
}

async function readSubjectsFile(): Promise<Subject[]> {
  const data = await readJson("subjects.json");

  if (!Array.isArray(data) || !data.every(isSubject)) {
    throw new Error("Dữ liệu subjects.json không đúng cấu trúc Subject[].");
  }

  assertUnique(data.map((subject) => subject.id), "id môn học", "subjects.json");
  assertUnique(data.map((subject) => subject.slug), "slug môn học", "subjects.json");

  return data;
}

async function readDeadlinesFile(subjects: Subject[]): Promise<Deadline[]> {
  const data = await readJson("deadlines.json");

  if (!Array.isArray(data) || !data.every(isDeadline)) {
    throw new Error("Dữ liệu deadlines.json không đúng cấu trúc Deadline[].");
  }

  assertUnique(data.map((deadline) => deadline.id), "id deadline", "deadlines.json");

  const subjectIds = new Set(subjects.map((subject) => subject.id));
  const invalidDeadline = data.find((deadline) => !subjectIds.has(deadline.subjectId));

  if (invalidDeadline) {
    throw new Error(
      `Deadline "${invalidDeadline.id}" tham chiếu subjectId không tồn tại.`,
    );
  }

  return data;
}

async function readProgressFile(deadlines: Deadline[]): Promise<UserProgress[]> {
  const data = await readJson("progress.json");

  if (!Array.isArray(data) || !data.every(isUserProgress)) {
    throw new Error("Dữ liệu progress.json không đúng cấu trúc UserProgress[].");
  }

  const progressKeys = data.map(
    (progress) => `${progress.userId}:${progress.deadlineId}`,
  );
  assertUnique(progressKeys, "cặp userId/deadlineId", "progress.json");

  const deadlineIds = new Set(deadlines.map((deadline) => deadline.id));
  const invalidProgress = data.find(
    (progress) => !deadlineIds.has(progress.deadlineId),
  );

  if (invalidProgress) {
    throw new Error(
      `Tiến độ của user "${invalidProgress.userId}" tham chiếu deadline không tồn tại.`,
    );
  }

  return data;
}

function joinSubjects(
  deadlines: Deadline[],
  subjects: Subject[],
): DeadlineWithSubject[] {
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));

  return deadlines.map((deadline) => {
    const subject = subjectsById.get(deadline.subjectId);

    if (!subject) {
      throw new Error(
        `Không tìm thấy môn học "${deadline.subjectId}" của deadline "${deadline.id}".`,
      );
    }

    return { ...deadline, subject, status: getDeadlineStatus(deadline) };
  });
}

export async function getSubjects(): Promise<Subject[]> {
  "use cache";
  cacheLife("max");
  cacheTag("subjects");

  return readSubjectsFile();
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  "use cache";
  cacheLife("max");
  cacheTag("subjects");

  const subjects = await readSubjectsFile();

  return subjects.find((subject) => subject.slug === slug) ?? null;
}

export async function getHomePageData(): Promise<{
  subjects: Subject[];
  deadlines: DeadlineWithSubject[];
  upcomingDeadlines: DeadlineWithSubject[];
}> {
  "use cache";
  cacheLife("max");
  cacheTag("subjects", "deadlines");

  const subjects = await readSubjectsFile();
  const deadlines = await readDeadlinesFile(subjects);
  const now = Date.now();
  const deadlinesWithSubjects = joinSubjects(deadlines, subjects);
  const upcomingDeadlines = deadlinesWithSubjects
    .filter((deadline) => Date.parse(deadline.dueAt) >= now)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
    .slice(0, 4);

  return { subjects, deadlines: deadlinesWithSubjects, upcomingDeadlines };
}

export async function getDeadlines(): Promise<DeadlineWithSubject[]> {
  "use cache";
  cacheLife({
    stale: deadlineCacheSeconds,
    revalidate: deadlineCacheSeconds,
    expire: 3600,
  });
  cacheTag("deadlines");

  const subjects = await getSubjects();
  const deadlines = await readDeadlinesFile(subjects);

  return joinSubjects(deadlines, subjects).sort(
    (a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt),
  );
}

export async function getDeadlinesForSubject(
  subjectId: string,
): Promise<DeadlineWithSubject[]> {
  "use cache";
  cacheLife("max");
  cacheTag("deadlines", `subject-deadlines:${subjectId}`);

  const subjects = await readSubjectsFile();
  const deadlines = await readDeadlinesFile(subjects);

  return joinSubjects(deadlines, subjects)
    .filter((deadline) => deadline.subjectId === subjectId)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

export async function getDeadlineById(
  id: string,
): Promise<DeadlineWithSubject | null> {
  "use cache";
  cacheLife({
    stale: deadlineCacheSeconds,
    revalidate: deadlineCacheSeconds,
    expire: 3600,
  });
  cacheTag("deadlines", `deadline:${id}`);

  const subjects = await getSubjects();
  const deadlines = await readDeadlinesFile(subjects);
  const deadline = deadlines.find((item) => item.id === id);

  return deadline ? joinSubjects([deadline], subjects)[0] : null;
}

export async function getProgressForUser(
  userId: string,
): Promise<UserProgress[]> {
  const subjects = await getSubjects();
  const deadlines = await readDeadlinesFile(subjects);
  const progress = await readProgressFile(deadlines);

  return progress.filter((item) => item.userId === userId);
}

export async function setUserDeadlineCompletion(
  userId: string,
  deadlineId: string,
  completed: boolean,
): Promise<void> {
  await withWriteLock(async () => {
    const subjects = await readSubjectsFile();
    const deadlines = await readDeadlinesFile(subjects);

    if (!deadlines.some((deadline) => deadline.id === deadlineId)) {
      throw new Error("Deadline không tồn tại.");
    }

    const progress = await readProgressFile(deadlines);
    const existing = progress.find(
      (item) => item.userId === userId && item.deadlineId === deadlineId,
    );
    const completedAt = completed ? new Date().toISOString() : null;

    if (existing) {
      existing.completed = completed;
      existing.completedAt = completedAt;
    } else {
      progress.push({ userId, deadlineId, completed, completedAt });
    }

    await writeJsonAtomically("progress.json", progress);
  });
}

export async function createDeadline(input: NewDeadline): Promise<Deadline> {
  return withWriteLock(async () => {
    const subjects = await readSubjectsFile();

    if (!subjects.some((subject) => subject.id === input.subjectId)) {
      throw new Error("Môn học không tồn tại.");
    }

    const deadlines = await readDeadlinesFile(subjects);
    const deadline: Deadline = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await writeJsonAtomically("deadlines.json", [...deadlines, deadline]);
    return deadline;
  });
}

export async function deleteDeadline(deadlineId: string): Promise<void> {
  await withWriteLock(async () => {
    const subjects = await readSubjectsFile();
    const deadlines = await readDeadlinesFile(subjects);
    const remainingDeadlines = deadlines.filter(
      (deadline) => deadline.id !== deadlineId,
    );

    if (remainingDeadlines.length === deadlines.length) {
      throw new Error("Deadline không tồn tại.");
    }

    const progress = await readProgressFile(deadlines);
    const remainingProgress = progress.filter(
      (item) => item.deadlineId !== deadlineId,
    );

    await writeJsonAtomically("progress.json", remainingProgress);
    try {
      await writeJsonAtomically("deadlines.json", remainingDeadlines);
    } catch (error) {
      try {
        await writeJsonAtomically("progress.json", progress);
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Không thể hoàn tất hoặc khôi phục thao tác xóa deadline.",
        );
      }

      throw error;
    }
  });
}
