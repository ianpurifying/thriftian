// src/app/(user)/layout.tsx

"use client";

import { RouteGuard } from "@/middleware/RouteGuard";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["buyer"]} requireAuth={true}>
      {children}
    </RouteGuard>
  );
}
