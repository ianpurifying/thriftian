// app/api/analytics/[sellerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { analyticsRepository } from "@/lib/repositories/analyticsRepository";

export async function GET(
  req: NextRequest,
  { params }: { params: { sellerId: string } }
) {
  const authResult = await requireAuth(req, ["seller", "admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // Sellers can only view their own analytics
  if (
    authResult.user.role === "seller" &&
    authResult.user.uid !== params.sellerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const analytics = await analyticsRepository.findBySeller(params.sellerId);

    if (!analytics) {
      return NextResponse.json({
        analytics: {
          sellerId: params.sellerId,
          totalSales: 0,
          totalOrders: 0,
          topProducts: [],
        },
      });
    }

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    let message = "An unknown error occurred";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
