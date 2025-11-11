// app/api/audit-logs/route.ts
export const dynamic = "force-dynamic"; // <-- ensures server-only execution

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let logs;
    if (userId) {
      logs = await auditLogRepository.findByUser(userId);
    } else {
      logs = await auditLogRepository.getRecent();
    }

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    let message = "An unknown error occurred";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
