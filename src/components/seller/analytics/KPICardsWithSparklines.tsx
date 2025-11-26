// src/components/seller/analytics/KPICardsWithSparklines.tsx
"use client";

interface KPICardsWithSparklinesProps {
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  conversionChange: number;
  aovChange: number;
  sparklineData: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="w-full h-12"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        className="animate-[draw_1s_ease-out]"
      />
    </svg>
  );
}

export default function KPICardsWithSparklines({
  totalRevenue,
  totalOrders,
  conversionRate,
  averageOrderValue,
  revenueChange,
  ordersChange,
  conversionChange,
  aovChange,
  sparklineData,
}: KPICardsWithSparklinesProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: revenueChange,
      color: "#6366f1",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: ordersChange,
      color: "#10b981",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(2)}%`,
      change: conversionChange,
      color: "#f59e0b",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      title: "Avg Order Value",
      value: `₱${averageOrderValue.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: aovChange,
      color: "#8b5cf6",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeIn_0.5s_ease-out]">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${card.color}20`,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {card.title}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  card.change >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {card.change >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(card.change).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs previous period</span>
            </div>

            <Sparkline data={sparklineData} color={card.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
