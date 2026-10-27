"use client";

import Link from "next/link";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { can } from "@/lib/permissions";

const roleLabels = {
  admin: "Quản trị viên",
  user: "Sinh viên",
} as const;

export default function SiteHeader() {
  return (
    <SessionProvider>
      <HeaderContent />
    </SessionProvider>
  );
}

function HeaderContent() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const role = session?.user.role;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link aria-label="Class Deadline Hub - Trang chủ" className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            CD
          </span>
          <span>Class Deadline Hub</span>
        </Link>
        <nav aria-label="Điều hướng chính" className="main-nav">
          <Link aria-current={pathname === "/" ? "page" : undefined} href="/">
            Trang chủ
          </Link>
          <Link href="/#subjects">Môn học</Link>
          <Link
            aria-current={pathname.startsWith("/deadlines") ? "page" : undefined}
            href="/deadlines"
          >
            Deadline
          </Link>
          {role ? (
            <Link
              aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
              href="/dashboard"
            >
              Dashboard
            </Link>
          ) : null}
          {role && can(role, "create_deadline") ? (
            <Link
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              href="/admin"
            >
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="account-nav">
          {status === "loading" ? (
            <span className="account-loading">Đang kiểm tra…</span>
          ) : session?.user ? (
            <>
              <span className="account-identity">
                <strong>{session.user.name}</strong>
                <span>{roleLabels[session.user.role]}</span>
              </span>
              <button
                className="account-button"
                onClick={() => signOut({ callbackUrl: "/" })}
                type="button"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link className="account-button account-login" href="/login">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
