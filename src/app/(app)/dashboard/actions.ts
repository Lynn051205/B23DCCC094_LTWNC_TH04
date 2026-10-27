"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthorizedActionUser } from "@/lib/auth-server";
import { setUserDeadlineCompletion } from "@/lib/data";

const completionSchema = z.object({
  deadlineId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9][A-Za-z0-9-]*$/),
  completed: z.enum(["true", "false"]),
});

export type CompletionActionState = {
  message: string;
  error?: boolean;
};

export async function setCompletionAction(
  _previousState: CompletionActionState,
  formData: FormData,
): Promise<CompletionActionState> {
  const authorization = await getAuthorizedActionUser("complete_deadline");

  if (!authorization.user) {
    return { message: authorization.error, error: true };
  }

  const parsed = completionSchema.safeParse({
    deadlineId: formData.get("deadlineId"),
    completed: formData.get("completed"),
  });

  if (!parsed.success) {
    return { message: "Dữ liệu cập nhật tiến độ không hợp lệ.", error: true };
  }

  try {
    await setUserDeadlineCompletion(
      authorization.user.id,
      parsed.data.deadlineId,
      parsed.data.completed === "true",
    );
  } catch (error) {
    console.error("Không thể cập nhật tiến độ deadline:", error);
    return {
      message: error instanceof Error ? error.message : "Không thể lưu tiến độ.",
      error: true,
    };
  }

  revalidatePath("/dashboard");
  return { message: "Đã cập nhật tiến độ." };
}
