// app/api/users/[userId]/wishlish/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { userRepository } from "@/lib/repositories/userRepository";
import { z } from "zod";

const wishlistSchema = z.object({ productId: z.string() });

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  if (authResult.user.uid !== params.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = wishlistSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await userRepository.addToWishlist(
      params.userId,
      validation.data.productId
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  if (authResult.user.uid !== params.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId)
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );

    await userRepository.removeFromWishlist(params.userId, productId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = "Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
