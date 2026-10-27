"use client";

import Link from "next/link";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import AppIcon from "@/components/AppIcon";
import { can } from "@/lib/permissions";

const roleLabels = {
  admin: "Quản trị viên",
  user: "Sinh viên",
} as const;

const navigation = [
  { href: "/", label: "Tổng quan", icon: "dashboard" as const },
  { href: "/#subjects", label: "Môn học", icon: "book" as const },
  { href: "/deadlines", label: "Tất cả deadline", icon: "calendar" as const },
];

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ShellContent>{children}</ShellContent>
    </SessionProvider>
  );
}

function ShellContent({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = session?.user.role;
  const isAdmin = role ? can(role, "create_deadline") : false;
  const currentPage = pathname.startsWith("/deadlines/")
    ? "Chi tiết deadline"
    : pathname.startsWith("/subjects/")
      ? "Chi tiết môn học"
      : pathname.startsWith("/deadlines")
        ? "Tất cả deadline"
        : pathname.startsWith("/dashboard")
          ? "Deadline của tôi"
          : pathname.startsWith("/admin")
            ? "Quản trị deadline"
            : pathname.startsWith("/login")
              ? "Đăng nhập"
              : pathname.startsWith("/403")
                ? "Không đủ quyền"
                : "Tổng quan";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div
      className={[
        "app-frame",
        collapsed ? "app-frame-collapsed" : "",
        mobileOpen ? "app-frame-mobile-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {mobileOpen ? (
        <button
          aria-label="Đóng menu"
          className="sidebar-backdrop"
          onClick={closeMobileMenu}
          type="button"
        />
      ) : null}
      <aside aria-label="Thanh điều hướng chính" className="app-sidebar">
        <Link
          aria-label="Class Deadline Hub - Tổng quan"
          className="sidebar-brand"
          href="/"
          onClick={closeMobileMenu}
        >
          <span aria-hidden="true" className="sidebar-brand-mark">
            CD
          </span>
          <span className="sidebar-brand-name">Class Deadline Hub</span>
        </Link>

        <div className="sidebar-user">
          <span aria-hidden="true" className="sidebar-avatar">
            {(session?.user.name ?? "CD").slice(0, 1).toLocaleUpperCase("vi")}
          </span>
          <span className="sidebar-user-copy">
            <strong>{session?.user.name ?? "Không gian học tập"}</strong>
            <span>
              {status === "loading"
                ? "Đang kiểm tra phiên…"
                : role
                  ? roleLabels[role]
                  : "Khách"}
            </span>
          </span>
        </div>

        <p className="sidebar-section-label">Điều hướng</p>
        <nav aria-label="Menu" className="sidebar-nav">
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={isActive(item.href) ? "sidebar-link sidebar-link-active" : "sidebar-link"}
              href={item.href}
              key={item.href}
              onClick={closeMobileMenu}
              title={item.label}
            >
              <AppIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
          {role ? (
            <Link
              aria-current={isActive("/dashboard") ? "page" : undefined}
              className={
                isActive("/dashboard")
                  ? "sidebar-link sidebar-link-active"
                  : "sidebar-link"
              }
              href="/dashboard"
              onClick={closeMobileMenu}
              title="Deadline của tôi"
            >
              <AppIcon name="check" />
              <span>Deadline của tôi</span>
            </Link>
          ) : null}
          {isAdmin ? (
            <Link
              aria-current={isActive("/admin") ? "page" : undefined}
              className={
                isActive("/admin")
                  ? "sidebar-link sidebar-link-active"
                  : "sidebar-link"
              }
              href="/admin"
              onClick={closeMobileMenu}
              title="Quản trị deadline"
            >
              <AppIcon name="admin" />
              <span>Quản trị deadline</span>
            </Link>
          ) : null}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-bottom-mark" aria-hidden="true">
            <AppIcon name="spark" />
          </span>
          <span>
            <strong>Kế hoạch học tập</strong>
            <span>Mỗi deadline đều trong tầm mắt.</span>
          </span>
        </div>
      </aside>

      <div className="app-main-column">
        <header className="app-topbar">
          <div className="topbar-leading">
            <button
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
              className="sidebar-toggle"
              onClick={() => {
                if (window.matchMedia("(max-width: 900px)").matches) {
                  setMobileOpen((open) => !open);
                } else {
                  setCollapsed((value) => !value);
                }
              }}
              type="button"
            >
              <AppIcon name={mobileOpen ? "close" : "menu"} />
            </button>
            <nav aria-label="Breadcrumb" className="topbar-breadcrumb">
              <Link href="/">Class Deadline Hub</Link>
              <AppIcon name="chevron" />
              <span aria-current="page">{currentPage}</span>
            </nav>
          </div>
          <div className="topbar-actions">
            {session?.user ? (
              <>
                <span aria-hidden="true" className="topbar-account-avatar">
                  {(session.user.name ?? session.user.email ?? "CD")
                    .slice(0, 1)
                    .toLocaleUpperCase("vi")}
                </span>
                <span className="topbar-account-copy">
                  <strong>{session.user.name}</strong>
                  <span>{role ? roleLabels[role] : ""}</span>
                </span>
                <button
                  aria-label="Đăng xuất"
                  className="topbar-icon-button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Đăng xuất"
                  type="button"
                >
                  <AppIcon name="signout" />
                </button>
              </>
            ) : status === "loading" ? (
              <span className="topbar-loading">Đang kiểm tra phiên…</span>
            ) : (
              <Link className="topbar-login" href="/login">
                Đăng nhập
              </Link>
            )}
          </div>
        </header>
        <main className="workspace-main">{children}</main>
        <footer className="workspace-footer">
          <span>Class Deadline Hub</span>
          <span>Theo dõi hạn nộp, chủ động học tập.</span>
        </footer>
      </div>
    </div>
  );
}
