// app/api/orders/[orderId]/tracking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { emailService } from "@/lib/services/emailService";
import { trackingNumberSchema } from "@/lib/validation/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const authResult = await requireAuth(req, ["seller"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const order = await orderRepository.findById(params.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.sellerId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = trackingNumberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await orderRepository.updateTrackingNumber(
      params.orderId,
      validation.data.trackingNumber
    );

    // Notify buyer
    await notificationRepository.create({
      userId: order.buyerId,
      title: "Order Shipped",
      message: `Your order #${params.orderId} has been shipped. Tracking: ${validation.data.trackingNumber}`,
      type: "order",
      isRead: false,
    });

    // Send email
    try {
      const buyer = await userRepository.findById(order.buyerId);
      if (buyer) {
        await emailService.sendTrackingUpdate(
          buyer.email,
          buyer.name,
          params.orderId,
          validation.data.trackingNumber
        );
      }
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "An unknown error occurred";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
