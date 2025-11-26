// src/components/seller/AnalyticsCards.tsx
"use client";

import { Analytics } from "@/lib/types";
import { ProductWithMetrics } from "./types";

interface AnalyticsCardsProps {
  analytics: Analytics | null;
  products: ProductWithMetrics[];
  lowStockCount: number;
  salesGrowth: number;
  conversionRate: string;
}

export default function AnalyticsCards({
  analytics,
  products,
  lowStockCount,
  salesGrowth,
  conversionRate,
}: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Revenue Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Total Revenue
          </span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold text-gray-900">
            ₱
            {(analytics?.totalSales || 0).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center text-sm">
            <span
              className={`font-medium ${
                salesGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {salesGrowth >= 0 ? "↑" : "↓"} {Math.abs(salesGrowth).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Orders</span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold text-gray-900">
            {analytics?.totalOrders || 0}
          </p>
          <div className="flex items-center text-sm">
            <span className="font-medium text-green-600">↑ 8.2%</span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
      </div>

      {/* Products Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Products</span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold text-gray-900">
            {products.length}
          </p>
          {lowStockCount > 0 && (
            <div className="flex items-center text-sm">
              <span className="font-medium text-orange-600">
                {lowStockCount} low stock
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Conversion Rate
          </span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-semibold text-gray-900">
            {conversionRate}%
          </p>
          <div className="text-sm text-gray-500">Views to sales</div>
        </div>
      </div>
    </div>
  );
}
