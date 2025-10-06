// src/app/(admin)/layout.tsx

"use client";

import { RouteGuard } from "@/middleware/RouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["admin"]} requireAuth={true}>
      {children}
    </RouteGuard>
  );
}
