// src/components/seller/analytics/RevenueByCategoryChart.tsx
"use client";

interface CategoryData {
  category: string;
  revenue: number;
}

interface RevenueByCategoryChartProps {
  categoryData: CategoryData[];
}

export function RevenueByCategoryChart({
  categoryData,
}: RevenueByCategoryChartProps) {
  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Revenue by Category
        </h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No category data available
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...categoryData.map((c) => c.revenue), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_1.1s_ease-out]">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Revenue by Category
      </h2>

      <div className="space-y-4">
        {categoryData.map((category, index) => {
          const percentage = (category.revenue / maxRevenue) * 100;

          return (
            <div key={category.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                  {category.category}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ₱
                  {category.revenue.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: `hsl(${220 + index * 30}, 70%, 55%)`,
                    animationDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
