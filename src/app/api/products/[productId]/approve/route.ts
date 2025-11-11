// app/api/products/[productId]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { productRepository } from "@/lib/repositories/productRepository";
import { notificationRepository } from "@/lib/repositories/notificationRepository";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const product = await productRepository.findById(params.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await productRepository.updateStatus(params.productId, "approved");

    await notificationRepository.create({
      userId: product.sellerId,
      title: "Product Approved",
      message: `Your product "${product.title}" has been approved and is now live.`,
      type: "listing",
      isRead: false,
    });

    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: "approve_listing",
      metadata: {
        targetId: params.productId,
        details: `Approved product: ${product.title}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Email send error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
