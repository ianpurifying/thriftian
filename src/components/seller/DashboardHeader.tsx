// src/components/seller/DashboardHeader.tsx
"use client";

import Button from "@/components/Button";

interface DashboardHeaderProps {
  onAddProduct: () => void;
}

export default function DashboardHeader({
  onAddProduct,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your store performance
            </p>
          </div>
          <Button
            onClick={onAddProduct}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Add Product
          </Button>
        </div>
      </div>
    </div>
  );
}
