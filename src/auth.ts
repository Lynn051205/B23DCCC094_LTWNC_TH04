import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthUser } from "@/types";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

const demoUsers: ReadonlyArray<AuthUser & { password: string }> = [
  {
    id: "user-admin",
    email: "admin@ptit.edu.vn",
    name: "Quản trị viên",
    role: "admin",
    password: "admin123",
  },
  {
    id: "user-student",
    email: "sv@ptit.edu.vn",
    name: "Sinh viên",
    role: "user",
    password: "sv123456",
  },
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email và mật khẩu",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const account = demoUsers.find((user) => user.email === email);

        if (!account || account.password !== password) {
          return null;
        }

        return {
          id: account.id,
          email: account.email,
          name: account.name,
          role: account.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      return new URL(getSafeCallbackUrl(url, baseUrl), baseUrl).toString();
    },
  },
};
