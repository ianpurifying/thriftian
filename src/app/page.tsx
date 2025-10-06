// src/app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        // Redirect to appropriate dashboard
        const dashboardPaths = {
          buyer: "/user/dashboard",
          seller: "/seller/dashboard",
          admin: "/admin/dashboard",
        };
        router.replace(dashboardPaths[role]);
      } else {
        // Redirect to login if not authenticated
        router.replace("/login");
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="">
      <div className="text-[#967E76] text-lg">Loading...</div>
    </div>
  );
}
