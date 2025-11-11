// lib/middleware/auth.ts

import { adminAuth } from "../firebase/adminApp";
import { userRepository } from "../repositories/userRepository";
import { NextRequest } from "next/server";
import { UserRole } from "../types";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email: string;
    role: UserRole;
  };
}

export async function verifyAuth(
  req: NextRequest
): Promise<{ uid: string; email: string; role: UserRole } | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    const user = await userRepository.findById(decodedToken.uid);
    if (!user) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role: user.role,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export async function requireAuth(req: NextRequest, allowedRoles?: UserRole[]) {
  const user = await verifyAuth(req);

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}
