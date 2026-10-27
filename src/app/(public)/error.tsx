"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi khi tải nội dung công khai:", error);
  }, [error]);

  return (
    <section className="error-state" role="alert">
      <p className="eyebrow">Đã xảy ra lỗi</p>
      <h1>Không thể tải nội dung</h1>
      <p>Đã có sự cố tạm thời. Vui lòng thử lại.</p>
      <button className="button-secondary" onClick={retry} type="button">
        Thử lại
      </button>
    </section>
  );
}
