// app/api/disputes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { adminDb } from "@/lib/firebase/adminApp";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { emailService } from "@/lib/services/emailService";
import { disputeSchema } from "@/lib/validation/schemas";
import { Timestamp, Query } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    let query: Query = adminDb
      .collection("disputes")
      .orderBy("createdAt", "desc");

    if (authResult.user.role === "buyer") {
      query = query.where("buyerId", "==", authResult.user.uid);
    } else if (authResult.user.role === "seller") {
      query = query.where("sellerId", "==", authResult.user.uid);
    }

    const snapshot = await query.limit(100).get();
    const disputes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });

    return NextResponse.json({ disputes });
  } catch (error: unknown) {
    let message = "An unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["buyer"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = disputeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const order = await orderRepository.findById(validation.data.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = Timestamp.now();
    const disputeRef = await adminDb.collection("disputes").add({
      orderId: validation.data.orderId,
      buyerId: authResult.user.uid,
      sellerId: order.sellerId,
      reason: validation.data.reason,
      status: "open",
      adminId: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
    });

    // Notify seller
    await notificationRepository.create({
      userId: order.sellerId,
      title: "Dispute Opened",
      message: `A dispute has been opened for order #${validation.data.orderId}`,
      type: "dispute",
      isRead: false, // ✅ required by type
    });

    // Send email to seller
    try {
      const seller = await userRepository.findById(order.sellerId);
      if (seller) {
        await emailService.sendDisputeAlert(
          seller.email,
          seller.name,
          validation.data.orderId,
          validation.data.reason
        );
      }
    } catch (emailError: unknown) {
      if (emailError instanceof Error) {
        console.error("Email send failed:", emailError.message);
      } else {
        console.error("Email send failed:", emailError);
      }
    }

    return NextResponse.json({ disputeId: disputeRef.id }, { status: 201 });
  } catch (error: unknown) {
    let message = "An unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
