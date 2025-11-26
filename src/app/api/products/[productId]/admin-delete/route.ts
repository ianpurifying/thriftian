// app/api/products/[productId]/admin-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { productRepository } from "@/lib/repositories/productRepository";
import { cloudinaryService } from "@/lib/services/cloudinaryService";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  // Require admin role for this endpoint
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

    // Delete images from Cloudinary
    const publicIds = product.images.map((img) => img.publicId);
    if (publicIds.length > 0) {
      await cloudinaryService.deleteMultipleImages(publicIds);
    }

    // Delete the product
    await productRepository.delete(params.productId);

    // Log the admin action
    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: "admin_delete_product",
      metadata: {
        targetId: params.productId,
        details: `Admin deleted product: ${product.title} (Seller: ${product.sellerName})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
