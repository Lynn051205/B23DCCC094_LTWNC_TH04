"use client";

import { useActionState, useState } from "react";
import {
  setCompletionAction,
  type CompletionActionState,
} from "@/app/(app)/dashboard/actions";

const initialState: CompletionActionState = { message: "" };

export default function CompletionControl({
  deadlineId,
  completed,
  onCompletedChange,
}: {
  deadlineId: string;
  completed: boolean;
  onCompletedChange?: (completed: boolean) => void;
}) {
  const [localCompletion, setLocalCompletion] = useState({
    sourceValue: completed,
    value: completed,
  });
  const isCompleted =
    localCompletion.sourceValue === completed
      ? localCompletion.value
      : completed;
  const [state, action, pending] = useActionState(
    async (previous: CompletionActionState, formData: FormData) => {
      const result = await setCompletionAction(previous, formData);

      if (!result.error) {
        const nextCompleted = formData.get("completed") === "true";
        setLocalCompletion({ sourceValue: completed, value: nextCompleted });
        onCompletedChange?.(nextCompleted);
      }

      return result;
    },
    initialState,
  );

  return (
    <div className="completion-control">
      <form action={action}>
        <input name="deadlineId" type="hidden" value={deadlineId} />
        <input name="completed" type="hidden" value={String(!isCompleted)} />
        <button className="button-secondary" disabled={pending} type="submit">
          {pending
            ? "Đang lưu…"
            : isCompleted
              ? "Đánh dấu chưa xong"
              : "Đánh dấu hoàn thành"}
        </button>
      </form>
      {state.message ? (
        <span
          className={state.error ? "form-message-error" : "form-message-success"}
          role={state.error ? "alert" : "status"}
        >
          {state.message}
        </span>
      ) : null}
    </div>
  );
}
