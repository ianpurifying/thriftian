// app/api/disputes/[disputeId]/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { adminDb } from "@/lib/firebase/adminApp";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

const resolveSchema = z.object({
  status: z.enum(["resolved", "rejected"]),
  resolutionNotes: z.string().min(10),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { disputeId: string } }
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
    const validation = resolveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const disputeRef = adminDb.collection("disputes").doc(params.disputeId);
    const disputeDoc = await disputeRef.get();

    if (!disputeDoc.exists) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const dispute = disputeDoc.data();

    await disputeRef.update({
      status: validation.data.status,
      adminId: authResult.user.uid,
      resolutionNotes: validation.data.resolutionNotes,
      updatedAt: Timestamp.now(),
    });

    // Notify buyer and seller
    await notificationRepository.create({
      userId: dispute?.buyerId,
      title: "Dispute Resolved",
      message: `Your dispute for order #${dispute?.orderId} has been ${validation.data.status}`,
      type: "dispute",
      isRead: false,
    });

    await notificationRepository.create({
      userId: dispute?.sellerId,
      title: "Dispute Resolved",
      message: `Dispute for order #${dispute?.orderId} has been ${validation.data.status}`,
      type: "dispute",
      isRead: false,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "An unknown error occurred";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
