// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { productRepository } from "@/lib/repositories/productRepository";
import { z } from "zod";
import { cloudinaryService } from "@/lib/services/cloudinaryService";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";

// Extended schema for updates that includes images
const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  brand: z.string().max(100).nullable().optional(),
  category: z.string().min(1).optional(),
  size: z.string().max(50).nullable().optional(),
  condition: z.enum(["New", "Like New", "Used", "Fair"]).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string(),
      })
    )
    .min(1)
    .max(5)
    .optional(),
});

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
  // Allow both sellers and admins to update products
  const authResult = await requireAuth(req, ["seller", "admin"]);
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

    // Check permissions: seller can only edit their own products, admin can edit any
    const isAdmin = authResult.user.role === "admin";
    const isOwner = product.sellerId === authResult.user.uid;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    // If images are being updated, handle the old images
    if (validation.data.images) {
      const oldPublicIds = product.images.map((img) => img.publicId);
      const newPublicIds = validation.data.images.map((img) => img.publicId);

      // Find images that were removed
      const removedPublicIds = oldPublicIds.filter(
        (id) => !newPublicIds.includes(id)
      );

      // Delete removed images from Cloudinary
      if (removedPublicIds.length > 0) {
        try {
          await cloudinaryService.deleteMultipleImages(removedPublicIds);
        } catch (error) {
          console.error("Failed to delete old images:", error);
          // Continue anyway - don't fail the update
        }
      }
    }

    await productRepository.update(params.productId, validation.data);

    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: isAdmin ? "admin_update_product" : "update_product",
      metadata: {
        targetId: params.productId,
        details: isAdmin
          ? `Admin updated product: ${product.title}`
          : `Updated product: ${product.title}`,
      },
    });

    const updatedProduct = await productRepository.findById(params.productId);
    return NextResponse.json({ product: updatedProduct });
  } catch (error: unknown) {
    console.error("Product update error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  // Only sellers can use this endpoint (for their own products)
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
