// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { productRepository } from "@/lib/repositories/productRepository";
import { productSchema } from "@/lib/validation/schemas";
import { auditLogRepository } from "@/lib/repositories/auditLogRepository";
import { ProductImage } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const status = searchParams.get("status");

    let products;

    if (sellerId) {
      products = await productRepository.findBySeller(sellerId);
    } else if (status === "pending") {
      const authResult = await requireAuth(req, ["admin"]);
      if ("error" in authResult) {
        return NextResponse.json(
          {
            error:
              "Unauthorized: Admin privileges required to view pending products.",
          },
          { status: authResult.status }
        );
      }
      products = await productRepository.findPending();
    } else {
      products = await productRepository.findApproved();
    }

    return NextResponse.json({
      products,
      message: "Products retrieved successfully.",
    });
  } catch (error: unknown) {
    console.error("GET /api/products error:", error);

    const message =
      error instanceof Error
        ? `Failed to retrieve products: ${error.message}`
        : "An unexpected error occurred while fetching products.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["seller"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in as a seller to add a product." },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      const errorDetails = validation.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");

      return NextResponse.json(
        { error: `Invalid product data provided: ${errorDetails}` },
        { status: 400 }
      );
    }

    const productId = await productRepository.create({
      ...validation.data,
      sellerId: authResult.user.uid,
      sellerName: authResult.user.email,
      images: (body.images || []) as ProductImage[],
      status: "pending",
      averageRating: 0,
      reviewCount: 0,
    });

    await auditLogRepository.create({
      userId: authResult.user.uid,
      action: "add_product",
      metadata: {
        targetId: productId,
        details: `Added new product: ${validation.data.title}`,
      },
    });

    return NextResponse.json(
      {
        productId,
        message:
          "Product submitted successfully and is now pending admin approval.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/products error:", error);

    const message =
      error instanceof Error
        ? `Failed to add product: ${error.message}`
        : "An unexpected error occurred while adding the product.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
