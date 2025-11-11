// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { cloudinaryService } from "@/lib/services/cloudinaryService";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { image, folder } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data required" },
        { status: 400 }
      );
    }

    const result = await cloudinaryService.uploadImage(
      image,
      folder || "products"
    );

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: unknown) {
    let message = "Upload error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
