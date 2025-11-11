export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { userRepository } from "@/lib/repositories/userRepository";
import { z } from "zod";

// Schema for user creation (more lenient than the full userSchema)
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["buyer", "seller", "admin"]).optional(),
  verified: z.boolean().optional(),
  photoURL: z.string().url().nullable().optional(),
});

// GET all users (admin only)
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, ["admin"]);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const users = await userRepository.getAll();
    return NextResponse.json({ users });
  } catch (error: unknown) {
    let message = "Error";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { adminAuth } = await import("@/lib/firebase/adminApp");
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Parse and validate request body
    const body = await req.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Create user document in Firestore with default empty address
    await userRepository.create(decodedToken.uid, {
      name: validation.data.name,
      email: validation.data.email,
      role: validation.data.role || "buyer",
      verified: validation.data.verified || false,
      photoURL: validation.data.photoURL || null,
      phone: null,
      address: {
        street: "",
        city: "",
        province: "",
        zip: "",
      },
    });

    // Fetch and return the created user
    const user = await userRepository.findById(decodedToken.uid);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    let message = "Error creating user";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
