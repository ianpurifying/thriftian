// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { orderRepository } from "@/lib/repositories/orderRepository";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in to access order details." },
      { status: authResult.status }
    );
  }

  try {
    const order = await orderRepository.findById(params.orderId);

    if (!order) {
      return NextResponse.json(
        { error: `Order not found. (Order ID: ${params.orderId})` },
        { status: 404 }
      );
    }

    // Authorization check
    const isAuthorized =
      authResult.user.role === "admin" ||
      order.buyerId === authResult.user.uid ||
      order.sellerId === authResult.user.uid;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            "Access denied: You are not authorized to view this order's details.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order,
      message: "Order retrieved successfully.",
    });
  } catch (error: unknown) {
    console.error("GET /api/orders/[orderId] error:", error);

    const message =
      error instanceof Error
        ? `Failed to retrieve order details: ${error.message}`
        : "An unexpected error occurred while retrieving the order.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
