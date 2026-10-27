import { can, type Action } from "@/lib/permissions";
import type { Role } from "@/types";

const permissionCases: {
  role: Role;
  action: Action;
  allowed: boolean;
}[] = [
  { role: "guest", action: "view_deadline", allowed: true },
  { role: "guest", action: "complete_deadline", allowed: false },
  { role: "guest", action: "create_deadline", allowed: false },
  { role: "guest", action: "delete_deadline", allowed: false },
  { role: "user", action: "view_deadline", allowed: true },
  { role: "user", action: "complete_deadline", allowed: true },
  { role: "user", action: "create_deadline", allowed: false },
  { role: "user", action: "delete_deadline", allowed: false },
  { role: "admin", action: "view_deadline", allowed: true },
  { role: "admin", action: "complete_deadline", allowed: true },
  { role: "admin", action: "create_deadline", allowed: true },
  { role: "admin", action: "delete_deadline", allowed: true },
];

test.each(permissionCases)(
  "$role permission for $action is $allowed",
  ({ role, action, allowed }) => {
    expect(can(role, action)).toBe(allowed);
  },
);
