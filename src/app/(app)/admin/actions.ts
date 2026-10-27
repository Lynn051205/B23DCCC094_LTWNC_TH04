"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { deadlineInputSchema } from "@/lib/deadline-validation";
import { revalidateDeadlinePages } from "@/lib/revalidation";
import { getAuthorizedActionUser } from "@/lib/auth-server";
import { createDeadline, deleteDeadline } from "@/lib/data";

const deadlineIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9-]*$/);

export interface AdminActionState {
  message: string;
  error?: boolean;
}

export async function createDeadlineAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const authorization = await getAuthorizedActionUser("create_deadline");

  if (!authorization.user) {
    return { message: authorization.error, error: true };
  }

  const parsed = deadlineInputSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueAt: formData.get("dueAt"),
    submissionType: formData.get("submissionType"),
    instructions: formData.get("instructions"),
  });

  if (!parsed.success) {
    return {
      message: "Vui lòng kiểm tra các trường bắt buộc và định dạng hạn nộp.",
      error: true,
    };
  }

  try {
    await createDeadline({
      ...parsed.data,
      dueAt: `${parsed.data.dueAt}:00+07:00`,
    });
  } catch (error) {
    console.error("Không thể tạo deadline:", error);
    return {
      message:
        error instanceof Error ? error.message : "Không thể lưu deadline.",
      error: true,
    };
  }

  revalidateDeadlinePages();
  return { message: "Đã thêm deadline và làm mới các trang liên quan." };
}

export async function deleteDeadlineAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const authorization = await getAuthorizedActionUser("delete_deadline");

  if (!authorization.user) {
    return { message: authorization.error, error: true };
  }

  const parsedId = deadlineIdSchema.safeParse(formData.get("deadlineId"));

  if (!parsedId.success) {
    return { message: "Mã deadline không hợp lệ.", error: true };
  }

  try {
    await deleteDeadline(parsedId.data);
  } catch (error) {
    console.error("Không thể xóa deadline:", error);
    return {
      message:
        error instanceof Error ? error.message : "Không thể xóa deadline.",
      error: true,
    };
  }

  revalidateDeadlinePages(parsedId.data);
  redirect("/admin?deleted=1");
}
