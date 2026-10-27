import type { Role } from "@/types";

export type Action =
  | "view_deadline"
  | "complete_deadline"
  | "create_deadline"
  | "delete_deadline";

const permissions: Record<Role, readonly Action[]> = {
  guest: ["view_deadline"],
  user: ["view_deadline", "complete_deadline"],
  admin: [
    "view_deadline",
    "complete_deadline",
    "create_deadline",
    "delete_deadline",
  ],
};

export function can(role: Role, action: Action): boolean {
  if (!Object.hasOwn(permissions, role)) {
    return false;
  }

  return permissions[role].includes(action);
}
