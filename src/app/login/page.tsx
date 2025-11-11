import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-rye text-amber-900 text-center mb-3 retro-text-shadow">
        Welcome Back
      </h1>
      <p className="text-center text-teal-700 font-pacifico text-xl mb-8">
        ~ Sign in to continue ~
      </p>

      <LoginForm />

      <p className="text-center mt-6 font-nunito text-gray-700">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-bold text-amber-800 hover:text-amber-600 underline decoration-wavy"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
