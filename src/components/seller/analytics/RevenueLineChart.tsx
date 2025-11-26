// src/components/seller/analytics/RevenueLineChart.tsx
"use client";

import { SalesDataPoint } from "../types";

interface RevenueLineChartProps {
  salesData: SalesDataPoint[];
}

export default function RevenueLineChart({ salesData }: RevenueLineChartProps) {
  if (salesData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          30-Day Revenue Trend
        </h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No revenue data available
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...salesData.map((d) => d.amount), 1);
  const totalRevenue = salesData.reduce((sum, d) => sum + d.amount, 0);
  const daysWithRevenue = salesData.filter((d) => d.amount > 0).length;
  const avgDailyRevenue =
    daysWithRevenue > 0 ? totalRevenue / daysWithRevenue : 0;

  // Create SVG path for line chart - connects only non-zero points
  const createPath = () => {
    const points = salesData.map((d, i) => {
      const x = (i / (salesData.length - 1)) * 100;
      const y = 100 - (d.amount / maxAmount) * 85 - 5; // 5% padding at top
      return `${x},${y}`;
    });
    return points.join(" ");
  };

  // Create area fill path
  const createAreaPath = () => {
    const points = salesData.map((d, i) => {
      const x = (i / (salesData.length - 1)) * 100;
      const y = 100 - (d.amount / maxAmount) * 85 - 5;
      return `${x},${y}`;
    });
    return `0,100 ${points.join(" ")} 100,100`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_0.6s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            30-Day Revenue Trend
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Daily revenue over the last 30 days
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Avg Daily Revenue</p>
          <p className="text-xs text-gray-400 mb-1">
            ({daysWithRevenue} {daysWithRevenue === 1 ? "day" : "days"} with
            sales)
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            ₱
            {avgDailyRevenue.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="relative h-80">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.2"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill with gradient */}
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polygon
            points={createAreaPath()}
            fill="url(#revenueGradient)"
            className="animate-[fadeIn_1s_ease-out]"
          />

          {/* Line */}
          <polyline
            points={createPath()}
            fill="none"
            stroke="#6366f1"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[draw_1.5s_ease-out]"
          />

          {/* Data points - highlight only days with revenue */}
          {salesData.map((d, i) => {
            const x = (i / (salesData.length - 1)) * 100;
            const y = 100 - (d.amount / maxAmount) * 85 - 5;

            if (d.amount === 0) return null;

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="1.2"
                  fill="#6366f1"
                  stroke="#fff"
                  strokeWidth="0.3"
                  className="hover:r-2 transition-all cursor-pointer"
                />
                <title>
                  {new Date(d.date).toLocaleDateString()}: ₱
                  {d.amount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  ({d.orders} {d.orders === 1 ? "order" : "orders"})
                </title>
              </g>
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>
            ₱{maxAmount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
          </span>
          <span>
            ₱
            {(maxAmount * 0.75).toLocaleString("en-PH", {
              maximumFractionDigits: 0,
            })}
          </span>
          <span>
            ₱
            {(maxAmount * 0.5).toLocaleString("en-PH", {
              maximumFractionDigits: 0,
            })}
          </span>
          <span>
            ₱
            {(maxAmount * 0.25).toLocaleString("en-PH", {
              maximumFractionDigits: 0,
            })}
          </span>
          <span>₱0</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <span>
          {new Date(salesData[0].date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>
          {new Date(
            salesData[Math.floor(salesData.length / 2)].date
          ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <span>
          {new Date(salesData[salesData.length - 1].date).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          )}
        </span>
      </div>

      {/* Revenue summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-lg font-bold text-gray-900">
            ₱
            {totalRevenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Days with Sales</p>
          <p className="text-lg font-bold text-gray-900">
            {daysWithRevenue} / 30
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Peak Day</p>
          <p className="text-lg font-bold text-gray-900">
            ₱{maxAmount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}
