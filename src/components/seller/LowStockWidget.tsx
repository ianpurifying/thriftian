// src/components/seller/LowStockWidget.tsx
"use client";

import Button from "@/components/Button";
import { ProductWithMetrics } from "./types";

interface LowStockWidgetProps {
  products: ProductWithMetrics[];
  onRestock: (productId: string) => void;
}

export default function LowStockWidget({
  products,
  onRestock,
}: LowStockWidgetProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Low Stock Alerts
        </h2>
        {products.length > 0 && (
          <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">
            {products.length}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="font-medium text-gray-900 truncate">
                {product.title}
              </p>
              <p className="text-sm text-orange-600 font-medium">
                Only {product.stock} left
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => onRestock(product.id)}
              className="text-sm whitespace-nowrap"
            >
              Restock
            </Button>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-500 text-center py-8 text-sm">
            All products are well stocked
          </p>
        )}
      </div>
    </div>
  );
}
