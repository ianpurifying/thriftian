// app/api/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const authResult = await requireAuth(req, ["seller", "admin"]);
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

    if (
      authResult.user.role === "seller" &&
      order.sellerId !== authResult.user.uid
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await orderRepository.updateStatus(params.orderId, validation.data.status);

    // Notify buyer
    await notificationRepository.create({
      userId: order.buyerId,
      title: "Order Status Updated",
      message: `Your order #${params.orderId} status is now: ${validation.data.status}`,
      type: "order",
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
