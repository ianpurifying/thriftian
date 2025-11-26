// src/components/seller/analytics/LowStockAlertsWidget.tsx
"use client";

import { ProductWithMetrics } from "../types";

interface LowStockAlertsWidgetProps {
  lowStockProducts: ProductWithMetrics[];
  criticalStockProducts: ProductWithMetrics[];
  onRestock: (productId: string) => void;
}

export function LowStockAlertsWidget({
  lowStockProducts,
  criticalStockProducts,
  onRestock,
}: LowStockAlertsWidgetProps) {
  const getStockStatus = (stock: number) => {
    if (stock <= 2)
      return {
        label: "Critical",
        color: "red",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    if (stock <= 5)
      return {
        label: "Low",
        color: "amber",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      };
    return {
      label: "Normal",
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    };
  };

  const getStockBarColor = (stock: number) => {
    if (stock <= 2) return "#ef4444";
    if (stock <= 5) return "#f59e0b";
    return "#10b981";
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_1.3s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ All Good
          </span>
        </div>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600">All products are well-stocked!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_1.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
          <p className="text-sm text-gray-500 mt-1">
            {criticalStockProducts.length} critical, {lowStockProducts.length}{" "}
            low
          </p>
        </div>
        {criticalStockProducts.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
            ⚠️ Action Required
          </span>
        )}
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {lowStockProducts.map((product, index) => {
          const status = getStockStatus(product.stock);
          const stockPercentage = (product.stock / 10) * 100; // Assuming max display is 10

          return (
            <div
              key={product.id}
              className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-md ${status.borderColor} ${status.bgColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                {product.images[0] && (
                  <div className="relative">
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    {product.stock <= 2 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
                        !
                      </div>
                    )}
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ₱
                        {product.price.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${status.textColor} ${status.bgColor} border ${status.borderColor}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Stock Level</span>
                      <span className={`font-bold ${status.textColor}`}>
                        {product.stock} units left
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out rounded-full"
                        style={{
                          width: `${Math.max(stockPercentage, 5)}%`,
                          backgroundColor: getStockBarColor(product.stock),
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Sales (30d)</p>
                      <p className="font-semibold text-gray-900">
                        {product.salesCount || 0} units
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estimated Days</p>
                      <p className="font-semibold text-gray-900">
                        {product.salesCount && product.salesCount > 0
                          ? Math.floor(
                              product.stock / (product.salesCount / 30)
                            )
                          : "∞"}{" "}
                        days
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onRestock(product.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                      product.stock <= 2
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }`}
                  >
                    {product.stock <= 2 ? "⚠️ Restock Now" : "Restock Product"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-900">
            {lowStockProducts.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Critical</p>
          <p className="text-2xl font-bold text-red-600">
            {criticalStockProducts.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">
            {lowStockProducts.length - criticalStockProducts.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LowStockAlertsWidget;
