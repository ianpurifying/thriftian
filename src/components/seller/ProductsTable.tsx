// src/components/seller/ProductsTable.tsx
"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { ProductWithMetrics } from "./types";

interface ProductsTableProps {
  products: ProductWithMetrics[];
  onEdit: (productId: string) => void;
  onBulkDelete: (productIds: string[]) => void;
}

export default function ProductsTable({
  products,
  onEdit,
  onBulkDelete,
}: ProductsTableProps) {
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const showBulkActions = selectedProducts.size > 0;

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete(Array.from(selectedProducts));
    setSelectedProducts(new Set());
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        <Input
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full sm:w-64"
        />
      </div>

      {showBulkActions && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-900">
            {selectedProducts.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleBulkDelete}
              className="text-sm"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedProducts(new Set())}
              className="text-sm"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.size === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  ₱
                  {product.price.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`text-sm font-medium ${
                      product.stock < 5 ? "text-orange-600" : "text-gray-900"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {product.views || 0}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {product.salesCount || 0}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : product.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status.charAt(0).toUpperCase() +
                      product.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(product.id)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No products
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {productSearch
              ? "No products match your search"
              : "Get started by creating a new product"}
          </p>
        </div>
      )}
    </div>
  );
}
