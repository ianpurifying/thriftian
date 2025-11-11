export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { notificationRepository } from "@/lib/repositories/notificationRepository";

export async function POST(
  req: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    await notificationRepository.markAsRead(params.notificationId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Notification update error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
