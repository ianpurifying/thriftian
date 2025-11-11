// app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { adminDb } from "@/lib/firebase/adminApp";
import { reportSchema } from "@/lib/validation/schemas";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const snapshot = await adminDb
      .collection("reports")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }));

    return NextResponse.json({ reports });
  } catch (error: unknown) {
    let message = "Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const reportRef = await adminDb.collection("reports").add({
      type: validation.data.type,
      targetId: validation.data.targetId,
      reportedBy: authResult.user.uid,
      reason: validation.data.reason,
      status: "pending",
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ reportId: reportRef.id }, { status: 201 });
  } catch (error: unknown) {
    let message = "Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
