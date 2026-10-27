import { z } from "zod";

export function isValidVietnameseDateTime(value: string): boolean {
  const timestamp = Date.parse(`${value}:00+07:00`);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return new Date(timestamp + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)
    .replace("Z", "") === value;
}

export const deadlineInputSchema = z.object({
  subjectId: z.string().trim().min(1).max(100),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(2000),
  dueAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/)
    .refine(isValidVietnameseDateTime),
  submissionType: z.string().trim().min(2).max(100),
  instructions: z.string().trim().min(3).max(2000),
});
