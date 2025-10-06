// src/app/(seller)/layout.tsx

"use client";

import { RouteGuard } from "@/middleware/RouteGuard";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["seller"]} requireAuth={true}>
      {children}
    </RouteGuard>
  );
}
