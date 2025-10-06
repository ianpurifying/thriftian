// src/components/auth/LoginForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const getDashboardPathForRole = (r: string | null | undefined) => {
    if (r === "admin") return "/admin/dashboard";
    if (r === "seller") return "/seller/dashboard";
    return "/user/dashboard";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await login({ email, password });

      // Try to fetch profile role (AuthService.getUserProfile)
      const profile = await AuthService.getUserProfile(credential.user.uid);
      const redirectPath = getDashboardPathForRole(profile?.role);
      router.replace(redirectPath);
      // Router will also be able to handle it if RouteGuard is present,
      // but this makes the UX immediate.
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEE3CB] px-4">
      <div className="w-full max-w-md bg-[#B7C4CF] rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-[#967E76] text-center mb-6">
          Login
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[#967E76] text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#EEE3CB] border border-[#D7C0AE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#967E76] text-[#967E76]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[#967E76] text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#EEE3CB] border border-[#D7C0AE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#967E76] text-[#967E76]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D7C0AE] hover:bg-[#967E76] text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-[#967E76] text-sm mt-6">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="underline hover:text-[#D7C0AE] transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
