// src/components/seller/analytics/ConversionFunnelChart.tsx
"use client";

interface ConversionFunnelChartProps {
  views: number;
  cart: number;
  orders: number;
  completed: number;
}

export default function ConversionFunnelChart({
  views,
  cart,
  orders,
  completed,
}: ConversionFunnelChartProps) {
  const stages = [
    { label: "Views", value: views, color: "#6366f1", icon: "👁️" },
    { label: "Cart", value: cart, color: "#8b5cf6", icon: "🛒" },
    { label: "Orders", value: orders, color: "#ec4899", icon: "📦" },
    { label: "Completed", value: completed, color: "#10b981", icon: "✓" },
  ];

  const maxValue = Math.max(views, 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_0.8s_ease-out]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Conversion Pipeline</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track customers through each stage
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const dropoffRate =
            index > 0 && stages[index - 1].value > 0
              ? (
                  ((stages[index - 1].value - stage.value) /
                    stages[index - 1].value) *
                  100
                ).toFixed(1)
              : "0";

          return (
            <div
              key={stage.label}
              className="group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{stage.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{stage.label}</p>
                    <p className="text-sm text-gray-500">
                      {stage.value.toLocaleString()} users
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: stage.color }}
                  >
                    {percentage.toFixed(1)}%
                  </p>
                  {index > 0 && (
                    <p className="text-xs text-red-600">
                      ↓ {dropoffRate}% drop
                    </p>
                  )}
                </div>
              </div>

              <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: stage.color,
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
                </div>
              </div>

              {index < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Overall Conversion</p>
          <p className="text-2xl font-bold text-indigo-600">
            {views > 0 ? ((completed / views) * 100).toFixed(2) : "0.00"}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {orders > 0 ? ((completed / orders) * 100).toFixed(2) : "0.00"}%
          </p>
        </div>
      </div>
    </div>
  );
}

// Add to global CSS:
/*
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
*/
