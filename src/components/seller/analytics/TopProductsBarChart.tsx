// src/components/seller/analytics/TopProductsBarChart.tsx
"use client";

interface TopProduct {
  id: string;
  title: string;
  salesCount: number;
  revenue: number;
  price: number;
  image: string;
}

interface TopProductsBarChartProps {
  topProducts: TopProduct[];
}

export default function TopProductsBarChart({
  topProducts,
}: TopProductsBarChartProps) {
  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Top Products by Revenue
        </h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          No product sales data available
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...topProducts.map((p) => p.revenue), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_0.7s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Top Products by Revenue
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your best performing products
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {topProducts.map((product, index) => {
          const percentage = (product.revenue / maxRevenue) * 100;

          return (
            <div
              key={product.id}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-400 w-6">
                  #{index + 1}
                </span>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {product.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.salesCount} sales
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ₱
                    {product.revenue.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, 
                      hsl(${220 + index * 15}, 70%, 60%), 
                      hsl(${220 + index * 15}, 70%, 50%))`,
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20" />
                </div>
                <div className="relative h-full flex items-center justify-between px-3">
                  <span className="text-xs font-medium text-gray-700">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              ₱
              {topProducts
                .reduce((sum, p) => sum + p.revenue, 0)
                .toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-xl font-bold text-gray-900">
              {topProducts.reduce((sum, p) => sum + p.salesCount, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
