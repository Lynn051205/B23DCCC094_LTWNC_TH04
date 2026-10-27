import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không có quyền truy cập",
};

export default function ForbiddenPage() {
  return (
    <section className="not-found-state">
      <p className="eyebrow">403 · Truy cập bị từ chối</p>
      <h1>Bạn không có quyền truy cập trang này</h1>
      <p>Trang quản trị chỉ dành cho tài khoản quản trị viên.</p>
      <Link className="button-secondary" href="/dashboard">
        Về Dashboard
      </Link>
    </section>
  );
}
