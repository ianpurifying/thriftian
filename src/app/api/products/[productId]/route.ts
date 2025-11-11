// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { productRepository } from "@/lib/repositories/productRepository";
import { productSchema } from "@/lib/validation/schemas";
import { cloudinaryService } from "@/lib/services/cloudinaryService";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await productRepository.findById(params.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const authResult = await requireAuth(req, ["seller"]);
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

    if (product.sellerId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = productSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await productRepository.update(params.productId, validation.data);

    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: "update_product",
      metadata: {
        targetId: params.productId,
        details: `Updated product: ${product.title}`,
      },
    });

    const updatedProduct = await productRepository.findById(params.productId);
    return NextResponse.json({ product: updatedProduct });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const authResult = await requireAuth(req, ["seller"]);
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

    if (product.sellerId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete images from Cloudinary
    const publicIds = product.images.map((img) => img.publicId);
    if (publicIds.length > 0) {
      await cloudinaryService.deleteMultipleImages(publicIds);
    }

    await productRepository.delete(params.productId);

    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: "delete_product",
      metadata: {
        targetId: params.productId,
        details: `Deleted product: ${product.title}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
