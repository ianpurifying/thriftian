// app/api/notifications/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { notificationRepository } from "@/lib/repositories/notificationRepository";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in to view notifications." },
      { status: authResult.status }
    );
  }

  try {
    const notifications = await notificationRepository.findByUser(
      authResult.user.uid
    );

    return NextResponse.json({
      notifications,
      message: "Notifications retrieved successfully.",
    });
  } catch (error: unknown) {
    console.error("GET /api/notifications error:", error);

    const message =
      error instanceof Error
        ? `Failed to load notifications: ${error.message}`
        : "An unexpected error occurred while retrieving notifications.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
