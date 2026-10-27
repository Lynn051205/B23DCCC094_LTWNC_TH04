"use client";

import { useActionState } from "react";
import {
  deleteDeadlineAction,
  type AdminActionState,
} from "@/app/(app)/admin/actions";

const initialState: AdminActionState = { message: "" };

export default function DeadlineDeleteButton({
  deadlineId,
  deadlineTitle,
}: {
  deadlineId: string;
  deadlineTitle: string;
}) {
  const [state, action, pending] = useActionState(
    deleteDeadlineAction,
    initialState,
  );

  return (
    <div className="delete-control">
      <form
        action={action}
        onSubmit={(event) => {
          if (!window.confirm(`Xóa deadline "${deadlineTitle}"?`)) {
            event.preventDefault();
          }
        }}
      >
        <input name="deadlineId" type="hidden" value={deadlineId} />
        <button
          aria-label={`Xóa ${deadlineTitle}`}
          className="button-danger"
          disabled={pending}
          type="submit"
        >
          {pending ? "Đang xóa…" : "Xóa"}
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
