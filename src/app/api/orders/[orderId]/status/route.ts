// app/api/orders/[orderId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { emailService } from "@/lib/services/emailService";
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

    // Send email notifications based on status
    try {
      const buyer = await userRepository.findById(order.buyerId);
      if (buyer) {
        switch (validation.data.status) {
          case "confirmed":
            // Order has been confirmed by seller
            await emailService.sendGenericEmail(
              buyer.email,
              buyer.name,
              "Order Confirmed - Thriftian Marketplace",
              `<p>Hello ${buyer.name},</p>
               <p>Your order #${params.orderId} has been confirmed and is being prepared for shipment.</p>
               <p>You will receive another notification once your order has been shipped.</p>
               <p>Thank you for shopping with Thriftian Marketplace!</p>`
            );
            break;

          case "shipped":
            // Order has been shipped (tracking number should be set separately)
            if (order.trackingNumber) {
              await emailService.sendTrackingUpdate(
                buyer.email,
                buyer.name,
                params.orderId,
                order.trackingNumber
              );
            }
            break;

          case "delivered":
            // Order has been delivered
            await emailService.sendOrderDelivered(
              buyer.email,
              buyer.name,
              params.orderId,
              order.trackingNumber || "N/A"
            );
            break;

          case "cancelled":
            // Order has been cancelled
            await emailService.sendGenericEmail(
              buyer.email,
              buyer.name,
              "Order Cancelled - Thriftian Marketplace",
              `<p>Hello ${buyer.name},</p>
               <p>Your order #${params.orderId} has been cancelled.</p>
               <p>If you have any questions, please contact our support team.</p>
               <p>Thank you for your understanding.</p>`
            );
            break;
        }
      }
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      // Don't fail the request if email fails
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
