// src/app/verify-email/page.tsx - Simplified version
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/clientApp";
import { applyActionCode } from "firebase/auth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyEmail = async () => {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");

      if (mode !== "verifyEmail" || !oobCode) {
        setStatus("error");
        setMessage("Invalid verification link. Please request a new one.");
        return;
      }

      try {
        // Apply the verification code to Firebase Auth
        await applyActionCode(auth, oobCode);

        // Check if user is currently logged in
        const currentUser = auth.currentUser;

        if (currentUser) {
          // User is logged in - reload to get updated status
          await currentUser.reload();

          setStatus("success");
          setMessage("Your email has been verified successfully!");

          // Redirect to home - AuthContext will sync Firestore automatically
          setTimeout(() => {
            router.push("/");
            // Force a page reload to trigger AuthContext sync
            window.location.href = "/";
          }, 2000);
        } else {
          // User is not logged in - that's okay!
          setStatus("success");
          setMessage("Email verified! Please log in to continue.");

          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");

        if (error instanceof Error) {
          if (error.message.includes("invalid-action-code")) {
            setMessage(
              "This verification link has expired or been used already."
            );
          } else if (error.message.includes("expired-action-code")) {
            setMessage(
              "This verification link has expired. Please request a new one."
            );
          } else {
            setMessage("Verification failed. Please try again.");
          }
        } else {
          setMessage(
            "An error occurred during verification. Please try again."
          );
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
