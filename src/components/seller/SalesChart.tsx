// src/components/seller/SalesChart.tsx
"use client";

import { SalesDataPoint } from "./types";

interface SalesChartProps {
  salesData: SalesDataPoint[];
}

export default function SalesChart({ salesData }: SalesChartProps) {
  const maxAmount = Math.max(...salesData.map((d) => d.amount), 1);
  const totalRevenue = salesData.reduce((sum, d) => sum + d.amount, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeDays = salesData.filter((d) => d.orders > 0).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
        <div className="flex items-center space-x-2 text-sm">
          <button className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-md font-medium">
            30 days
          </button>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-1">
        {salesData.length > 0 ? (
          salesData.map((day, idx) => {
            const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end group relative h-full"
              >
                <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10 shadow-lg">
                  <div className="font-medium">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-gray-300 mt-1">
                    ₱
                    {day.amount.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-gray-300">
                    {day.orders} {day.orders === 1 ? "order" : "orders"}
                  </div>
                </div>
                <div
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all cursor-pointer min-h-[2px]"
                  style={{ height: `${Math.max(height, 1)}%` }}
                />
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
            No sales data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold text-gray-900">
            ₱
            {totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Orders</p>
          <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Average Order</p>
          <p className="text-2xl font-semibold text-gray-900">
            ₱
            {averageOrder.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Active Days</p>
          <p className="text-2xl font-semibold text-gray-900">{activeDays}</p>
        </div>
      </div>
    </div>
  );
}
