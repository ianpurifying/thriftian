// app/api/reports/[reportId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { adminDb } from "@/lib/firebase/adminApp";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["reviewed", "dismissed"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await adminDb.collection("reports").doc(params.reportId).update({
      status: validation.data.status,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
