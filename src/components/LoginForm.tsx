"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setError("Email hoặc mật khẩu không chính xác.");
        return;
      }

      router.replace(getSafeCallbackUrl(result.url, window.location.origin));
      router.refresh();
    } catch (error) {
      console.error("Không thể gửi yêu cầu đăng nhập:", error);
      setError("Không thể kết nối để đăng nhập. Vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="email">Email</label>
      <input
        autoComplete="username"
        id="email"
        name="email"
        placeholder="ten@ptit.edu.vn"
        required
        type="email"
      />
      <label htmlFor="password">Mật khẩu</label>
      <input
        autoComplete="current-password"
        id="password"
        name="password"
        placeholder="Nhập mật khẩu"
        required
        type="password"
      />
      {error ? (
        <p className="form-message form-message-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button-primary login-submit" disabled={pending} type="submit">
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
