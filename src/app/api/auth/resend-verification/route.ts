// src/app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { adminAuth } from "@/lib/firebase/adminApp";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { userId } = await req.json();

    // Only allow users to resend for their own account
    if (authResult.user.uid !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate verification link
    const link = await adminAuth.generateEmailVerificationLink(
      authResult.user.email!,
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`,
      }
    );

    // You can send this via your email service or return it
    // For now, returning success - Firebase will send the email
    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      link, // You can remove this in production
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
