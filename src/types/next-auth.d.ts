import type { DefaultSession } from "next-auth";
import type { Role } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Exclude<Role, "guest">;
    } & DefaultSession["user"];
  }

  interface User {
    role: Exclude<Role, "guest">;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Exclude<Role, "guest">;
  }
}
