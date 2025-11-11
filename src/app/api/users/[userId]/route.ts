// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { userRepository } from "@/lib/repositories/userRepository";
import { userSchema } from "@/lib/validation/schemas";

export async function GET(
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

  try {
    const user = await userRepository.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow users to view their own data or admins to view any
    if (
      authResult.user.uid !== params.userId &&
      authResult.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    let message = "Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
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

  // Only allow users to update their own data
  if (authResult.user.uid !== params.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validation = userSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await userRepository.update(params.userId, validation.data);
    const updatedUser = await userRepository.findById(params.userId);

    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    let message = "Error";

    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
