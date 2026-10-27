import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { can, type Action } from "@/lib/permissions";

export async function requirePermission(action: Action) {
  return requirePermissionForPath(action, "/dashboard");
}

export async function requirePermissionForPath(action: Action, path: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  if (!can(session.user.role, action)) {
    redirect("/403");
  }

  return session.user;
}

export async function getAuthorizedActionUser(action: Action) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Bạn cần đăng nhập để thực hiện thao tác này." } as const;
  }

  if (!can(session.user.role, action)) {
    return { error: "Bạn không có quyền thực hiện thao tác này." } as const;
  }

  return { user: session.user } as const;
}
