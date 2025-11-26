// src/components/seller/analytics/RevenueShareDonutChart.tsx
"use client";

interface TopProduct {
  id: string;
  title: string;
  revenue: number;
}

interface RevenueShareDonutChartProps {
  topProducts: TopProduct[];
}

export function RevenueShareDonutChart({
  topProducts,
}: RevenueShareDonutChartProps) {
  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Share</h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const totalRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  let currentAngle = -90;
  const segments = topProducts.map((product, index) => {
    const percentage = (product.revenue / totalRevenue) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const start = polarToCartesian(100, 100, 80, endAngle);
    const end = polarToCartesian(100, 100, 80, startAngle);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const path = [
      `M 100 100`,
      `L ${start.x} ${start.y}`,
      `A 80 80 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `Z`,
    ].join(" ");

    currentAngle = endAngle;

    return {
      path,
      color: colors[index % colors.length],
      percentage,
      product,
    };
  });

  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_1s_ease-out]">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Share</h2>

      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-64 h-64">
          <circle cx="100" cy="100" r="60" fill="white" />
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <title>
                  {segment.product.title}: ₱
                  {segment.product.revenue.toLocaleString()} (
                  {segment.percentage.toFixed(1)}%)
                </title>
              </path>
            </g>
          ))}
          <circle cx="100" cy="100" r="60" fill="white" />
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            Total
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="text-lg font-bold fill-gray-900"
          >
            ₱{(totalRevenue / 1000).toFixed(1)}K
          </text>
        </svg>
      </div>

      <div className="mt-6 space-y-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700 truncate max-w-[150px]">
                {segment.product.title}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {segment.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
