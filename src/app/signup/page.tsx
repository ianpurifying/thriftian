// src/app/signup/page.tsx
import SignupForm from "@/components/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-rye text-amber-900 text-center mb-3 retro-text-shadow">
        Join the Club
      </h1>
      <p className="text-center text-teal-700 font-pacifico text-xl mb-8">
        ~ Create your account ~
      </p>

      <SignupForm />

      <p className="text-center mt-6 font-nunito text-gray-700">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-amber-800 hover:text-amber-600 underline decoration-wavy"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
