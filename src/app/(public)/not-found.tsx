import Link from "next/link";

export default function PublicNotFound() {
  return (
    <section className="not-found-state">
      <p className="eyebrow">404 · Không tìm thấy</p>
      <h1>Nội dung này không tồn tại</h1>
      <p>
        Môn học hoặc deadline bạn đang tìm có thể đã bị xóa hoặc đường dẫn không
        chính xác.
      </p>
      <Link className="button-secondary" href="/">
        Về trang chủ
      </Link>
    </section>
  );
}
