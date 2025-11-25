// src/app/api/users/[userId]/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { userRepository } from "@/lib/repositories/userRepository";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log("=== Verify API Called ===");

  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    console.error("Auth failed:", authResult);
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { userId } = params;
    console.log("User ID from params:", userId);
    console.log("Authenticated user ID:", authResult.user.uid);

    // Only allow users to verify their own account
    if (authResult.user.uid !== userId) {
      console.error("User ID mismatch - unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update Firestore
    console.log("Updating Firestore verified field...");
    await userRepository.update(userId, {
      verified: true,
    });
    console.log("Firestore update successful");

    // Fetch updated user
    const updatedUser = await userRepository.findById(userId);
    console.log("Updated user verified status:", updatedUser?.verified);

    return NextResponse.json({
      success: true,
      message: "Email verification status updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verification update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update verification status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
