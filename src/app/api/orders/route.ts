// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { productRepository } from "@/lib/repositories/productRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { analyticsRepository } from "@/lib/repositories/analyticsRepository";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";
import { emailService } from "@/lib/services/emailService";
import { orderSchema } from "@/lib/validation/schemas";
import { adminDb } from "@/lib/firebase/adminApp";

// 🟢 GET - Fetch orders based on user role
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in to view your orders." },
      { status: authResult.status }
    );
  }

  try {
    const user = authResult.user;
    let orders;

    if (user.role === "admin") {
      orders = await orderRepository.getAll();
    } else if (user.role === "seller") {
      orders = await orderRepository.findBySeller(user.uid);
    } else {
      orders = await orderRepository.findByBuyer(user.uid);
    }

    return NextResponse.json({
      orders,
      message: "Orders retrieved successfully.",
    });
  } catch (error: unknown) {
    console.error("GET /api/orders error:", error);

    const message =
      error instanceof Error
        ? `Failed to fetch orders: ${error.message}`
        : "An unexpected error occurred while fetching orders.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 🟢 POST - Create a new order
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["buyer"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: "Unauthorized: Buyer login required." },
      { status: authResult.status }
    );
  }

  try {
    const buyer = await userRepository.findById(authResult.user.uid);
    if (!buyer) {
      return NextResponse.json(
        { error: "Order failed: Buyer account not found." },
        { status: 404 }
      );
    }

    if (!buyer.verified) {
      return NextResponse.json(
        { error: "Please verify your email before placing an order." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      const errorDetails = validation.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return NextResponse.json(
        { error: `Invalid order data: ${errorDetails}` },
        { status: 400 }
      );
    }

    type OrderItem = {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      imageUrl: string;
    };

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;
    let sellerId = "";
    let sellerName = "";

    for (const item of validation.data.items) {
      const product = await productRepository.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            error: `Order failed: Product with ID ${item.productId} not found.`,
          },
          { status: 404 }
        );
      }

      if (product.status !== "approved") {
        return NextResponse.json(
          {
            error: `Product "${product.title}" is not available for purchase.`,
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product "${product.title}".` },
          { status: 400 }
        );
      }

      orderItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.images[0]?.url ?? "",
      });

      totalAmount += product.price * item.quantity;
      sellerId = product.sellerId;
      sellerName = product.sellerName;
    }

    const orderId = await adminDb.runTransaction(async () => {
      for (const item of validation.data.items) {
        await productRepository.decrementStock(item.productId, item.quantity);
      }

      const newOrderId = await orderRepository.create({
        buyerId: authResult.user.uid,
        buyerName: buyer.name,
        sellerId,
        sellerName,
        items: orderItems,
        totalAmount,
        paymentMethod: "Cash on Delivery",
        status: "pending",
        shippingAddress: validation.data.shippingAddress,
        trackingNumber: null,
      });

      return newOrderId;
    });

    await analyticsRepository.incrementSales(sellerId, totalAmount);

    await notificationRepository.create({
      userId: authResult.user.uid,
      title: "Order Placed",
      message: `Your order #${orderId} has been placed successfully.`,
      type: "order",
      isRead: false,
    });

    await notificationRepository.create({
      userId: sellerId,
      title: "New Order",
      message: `You have received a new order #${orderId} from ${buyer.name}.`,
      type: "order",
      isRead: false,
    });

    try {
      await emailService.sendOrderConfirmation(
        buyer.email,
        buyer.name,
        orderId,
        totalAmount,
        orderItems
      );
    } catch (emailError: unknown) {
      console.error(
        "Email sending failed:",
        emailError instanceof Error ? emailError.message : emailError
      );
    }

    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: "place_order",
      metadata: {
        targetId: orderId,
        details: `Placed order with ${orderItems.length} items.`,
      },
    });

    return NextResponse.json(
      {
        orderId,
        message: "Order placed successfully and is now pending confirmation.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/orders error:", error);

    const message =
      error instanceof Error
        ? `Failed to place order: ${error.message}`
        : "An unexpected error occurred while processing the order.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
