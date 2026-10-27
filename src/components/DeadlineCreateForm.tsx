"use client";

import { useActionState } from "react";
import {
  createDeadlineAction,
  type AdminActionState,
} from "@/app/(app)/admin/actions";
import type { Subject } from "@/types";

const initialState: AdminActionState = { message: "" };

export default function DeadlineCreateForm({
  subjects,
}: {
  subjects: Subject[];
}) {
  const [state, action, pending] = useActionState(
    createDeadlineAction,
    initialState,
  );

  return (
    <form action={action} className="admin-form">
      <div className="form-field">
        <label htmlFor="subjectId">Môn học</label>
        <select id="subjectId" name="subjectId" required>
          <option value="">Chọn môn học</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="title">Tên deadline</label>
        <input
          id="title"
          maxLength={160}
          name="title"
          placeholder="Ví dụ: Báo cáo bài tập lớn"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="dueAt">Hạn nộp (giờ Việt Nam)</label>
        <input id="dueAt" name="dueAt" required type="datetime-local" />
      </div>
      <div className="form-field">
        <label htmlFor="submissionType">Hình thức nộp</label>
        <input
          id="submissionType"
          maxLength={100}
          name="submissionType"
          placeholder="Ví dụ: PDF, mã nguồn"
          required
        />
      </div>
      <div className="form-field form-field-wide">
        <label htmlFor="description">Mô tả</label>
        <textarea
          id="description"
          maxLength={2000}
          name="description"
          placeholder="Mô tả ngắn nội dung deadline"
          required
          rows={3}
        />
      </div>
      <div className="form-field form-field-wide">
        <label htmlFor="instructions">Yêu cầu bài tập</label>
        <textarea
          id="instructions"
          maxLength={2000}
          name="instructions"
          placeholder="Nêu yêu cầu nộp bài và lưu ý cho sinh viên"
          required
          rows={3}
        />
      </div>

      {state.message ? (
        <p
          className={
            state.error
              ? "form-message form-message-error"
              : "form-message form-message-success"
          }
          role={state.error ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
      <div className="form-field-wide">
        <button
          className="button-primary form-submit"
          disabled={pending}
          type="submit"
        >
          {pending ? "Đang lưu…" : "Thêm deadline"}
        </button>
      </div>
    </form>
  );
}
