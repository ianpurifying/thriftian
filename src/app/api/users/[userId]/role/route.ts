// app/api/users/[userId]/role/route.ts

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { userRepository } from "@/lib/repositories/userRepository";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["buyer", "seller", "admin"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json();
    const validation = roleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    await userRepository.updateRole(params.userId, validation.data.role);
    const updatedUser = await userRepository.findById(params.userId);
    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    let message = "Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
