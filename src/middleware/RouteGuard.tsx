// src/middleware/RouteGuard.tsx

"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/user";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export function RouteGuard({
  children,
  allowedRoles,
  requireAuth = true,
}: RouteGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    // Redirect authenticated users away from auth pages
    if (user && role && (pathname === "/login" || pathname === "/signup")) {
      const dashboardPath = getDashboardPathForRole(role);
      router.replace(dashboardPath);
      return;
    }

    // Redirect unauthenticated users to login
    if (requireAuth && !user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    // Check role-based access
    if (user && role && allowedRoles && !allowedRoles.includes(role)) {
      const dashboardPath = getDashboardPathForRole(role);
      router.replace(dashboardPath);
      return;
    }

    // Redirect authenticated users from root to their dashboard
    if (user && role && pathname === "/") {
      const dashboardPath = getDashboardPathForRole(role);
      router.replace(dashboardPath);
      return;
    }
  }, [user, role, loading, pathname, router, requireAuth, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEE3CB]">
        <div className="text-[#967E76] text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

function getDashboardPathForRole(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    admin: "/admin/dashboard",
    seller: "/seller/dashboard",
    buyer: "/user/dashboard",
  };
  return paths[role];
}
