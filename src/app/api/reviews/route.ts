// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { reviewRepository } from "@/lib/repositories/reviewRepository";
import { productRepository } from "@/lib/repositories/productRepository";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { reviewSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// ----------------------------
// GET: Fetch reviews by product
// ----------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required." },
        { status: 400 }
      );
    }

    const reviews = await reviewRepository.findByProduct(productId);

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/reviews error:", error);

    const message =
      error instanceof Error
        ? `Failed to fetch reviews: ${error.message}`
        : "An unexpected error occurred while fetching reviews.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ----------------------------
// POST: Add a new product review
// ----------------------------
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, ["buyer"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return NextResponse.json(
        { error: `Invalid review data: ${details}` },
        { status: 400 }
      );
    }

    const { productId, rating, comment } = validation.data;

    // 🔍 Check if user already reviewed this product
    const hasReviewed = await reviewRepository.hasUserReviewedProduct(
      authResult.user.uid,
      productId
    );

    if (hasReviewed) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 400 }
      );
    }

    // 🔍 Verify user purchased this product
    const orders = await orderRepository.findByBuyer(authResult.user.uid);
    const hasPurchased = orders.some(
      (order) =>
        order.items.some((item) => item.productId === productId) &&
        order.status === "delivered"
    );

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You can only review products you have purchased." },
        { status: 403 }
      );
    }

    // 🔍 Fetch user data for display name
    const user = await userRepository.findById(authResult.user.uid);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ✅ Create the review
    const reviewId = await reviewRepository.create({
      productId,
      buyerId: authResult.user.uid,
      buyerName: user.name,
      rating,
      comment,
    });

    // 🔁 Update product rating
    await productRepository.updateRating(productId, rating);

    return NextResponse.json(
      {
        reviewId,
        message: "Review submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/reviews error:", error);

    const message =
      error instanceof Error
        ? `Failed to add review: ${error.message}`
        : "An unexpected error occurred while adding review.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
