import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";

export const instant = false;

export default function AppAreaLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
