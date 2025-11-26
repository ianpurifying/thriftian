// src/components/seller/TopProductsWidget.tsx
"use client";

import { ProductWithMetrics } from "./types";

interface TopProductsWidgetProps {
  products: ProductWithMetrics[];
}

export default function TopProductsWidget({
  products,
}: TopProductsWidgetProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
      <div className="space-y-4">
        {products.map((product, idx) => (
          <div
            key={product.id}
            className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            <span className="text-lg font-semibold text-gray-400 w-6">
              {idx + 1}
            </span>
            {product.images[0] && (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {product.title}
              </p>
              <p className="text-sm text-gray-500">
                {product.salesCount} sales
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              ₱
              {product.price.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-500 text-center py-8 text-sm">
            No sales data yet
          </p>
        )}
      </div>
    </div>
  );
}
