// src/components/seller/analytics/SalesHeatmap.tsx
"use client";

interface HeatmapDay {
  day: string;
  orders: number;
}

interface SalesHeatmapProps {
  heatmapData: HeatmapDay[][];
}

export function SalesHeatmap({ heatmapData }: SalesHeatmapProps) {
  if (heatmapData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Activity</h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No activity data available
        </div>
      </div>
    );
  }

  const allOrders = heatmapData.flat().map((d) => d.orders);
  const maxOrders = Math.max(...allOrders, 1);

  const getColor = (orders: number) => {
    if (orders === 0) return "#f3f4f6";
    const intensity = orders / maxOrders;
    if (intensity < 0.25) return "#dbeafe";
    if (intensity < 0.5) return "#93c5fd";
    if (intensity < 0.75) return "#3b82f6";
    return "#1e40af";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_1.2s_ease-out]">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Heatmap</h2>
      <p className="text-sm text-gray-500 mb-4">Last 4 weeks activity</p>

      <div className="space-y-2">
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-2">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="flex-1 group relative"
                style={{
                  animationDelay: `${(weekIndex * 7 + dayIndex) * 50}ms`,
                }}
              >
                <div
                  className="h-12 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: getColor(day.orders) }}
                >
                  <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    {day.day}: {day.orders} orders
                  </div>
                </div>
                {weekIndex === 0 && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {day.day}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <div
              key={intensity}
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: getColor(Math.floor(intensity * maxOrders)),
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
