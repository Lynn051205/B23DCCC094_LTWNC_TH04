import type { Metadata } from "next";
import { connection } from "next/server";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào Class Deadline Hub để quản lý tiến độ học tập.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await connection();
  const query = await searchParams;
  const callbackUrl = Array.isArray(query.callbackUrl)
    ? query.callbackUrl[0]
    : query.callbackUrl;

  return (
    <section className="login-layout">
      <div className="login-card">
        <p className="eyebrow">Chào mừng trở lại</p>
        <h1>Đăng nhập</h1>
        <p className="login-intro">
          Đăng nhập để theo dõi tiến độ học tập và quản lý deadline của bạn.
        </p>
        <LoginForm callbackUrl={getSafeCallbackUrl(callbackUrl)} />
        <aside className="demo-accounts">
          <strong>Tài khoản dùng thử</strong>
          <span>Admin: admin@ptit.edu.vn / admin123</span>
          <span>Sinh viên: sv@ptit.edu.vn / sv123456</span>
        </aside>
      </div>
    </section>
  );
}
