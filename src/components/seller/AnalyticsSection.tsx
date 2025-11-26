// src/components/seller/AnalyticsSection.tsx
"use client";

import { useState } from "react";
import Button from "@/components/Button";
import SellerAnalytics from "@/components/seller/SellerAnalytics";
import { Order } from "@/lib/types";

interface AnalyticsSectionProps {
  orders: Order[];
  sellerName?: string;
}

export default function AnalyticsSection({
  orders,
  sellerName,
}: AnalyticsSectionProps) {
  const [showAnalytics, setShowAnalytics] = useState(true);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <Button
          onClick={() => setShowAnalytics(!showAnalytics)}
          variant="secondary"
          className="text-sm"
        >
          {showAnalytics ? "Hide" : "Show"} Analytics
        </Button>
      </div>

      {showAnalytics && (
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-indigo-200">
          <SellerAnalytics orders={orders} sellerName={sellerName} />
        </div>
      )}
    </div>
  );
}
