"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/deadlines", label: "Tất cả deadline" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside aria-label="Điều hướng Dashboard" className="dashboard-sidebar">
      <p className="eyebrow">Không gian của bạn</p>
      <nav className="dashboard-nav">
        {links.map((link) => (
          <Link
            aria-current={pathname === link.href ? "page" : undefined}
            className={pathname === link.href ? "dashboard-nav-active" : ""}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
