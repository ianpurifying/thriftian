// src/components/auth/SignupForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/user";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const getDashboardPathForRole = (r: UserRole) => {
    if (r === "admin") return "/admin/dashboard";
    if (r === "seller") return "/seller/dashboard";
    return "/user/dashboard";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup({ email, password, role });

      // Redirect immediately using the role selected in the form
      const redirectPath = getDashboardPathForRole(role);
      router.replace(redirectPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEE3CB] px-4">
      <div className="w-full max-w-md bg-[#B7C4CF] rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-[#967E76] text-center mb-6">
          Sign Up
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
              minLength={6}
              className="w-full px-4 py-2 bg-[#EEE3CB] border border-[#D7C0AE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#967E76] text-[#967E76]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-[#967E76] text-sm font-medium mb-2"
            >
              I am a
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 bg-[#EEE3CB] border border-[#D7C0AE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#967E76] text-[#967E76]"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D7C0AE] hover:bg-[#967E76] text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-[#967E76] text-sm mt-6">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="underline hover:text-[#D7C0AE] transition-colors"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
