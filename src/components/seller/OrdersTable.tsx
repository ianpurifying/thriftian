// src/components/seller/OrdersTable.tsx
"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Order, OrderStatus } from "@/lib/types";
import OrderActionMenu from "./OrderActionMenu";

type OrderFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onAddTracking: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (order: Order) => void;
  onExport: () => void;
  updatingOrderId: string | null;
}

export default function OrdersTable({
  orders,
  onViewDetails,
  onAddTracking,
  onUpdateStatus,
  onCancelOrder,
  onExport,
  updatingOrderId,
}: OrdersTableProps) {
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearch, setOrderSearch] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters: OrderFilter[] = [
    "all",
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onExport} className="text-sm">
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          placeholder="Search orders..."
          className="flex-1"
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setOrderFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                orderFilter === filter
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter !== "all" && (
                <span className="ml-1.5">
                  ({orders.filter((o) => o.status === filter).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tracking
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="font-mono text-sm text-indigo-600 hover:underline"
                  >
                    #{order.id.substring(0, 8)}
                  </button>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US")}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {order.buyerName}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {order.items.length}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  ₱
                  {order.totalAmount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "confirmed"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {order.trackingNumber ? (
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {order.trackingNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <OrderActionMenu
                    order={order}
                    onViewDetails={onViewDetails}
                    onAddTracking={onAddTracking}
                    onUpdateStatus={onUpdateStatus}
                    onCancelOrder={onCancelOrder}
                    isUpdating={updatingOrderId === order.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">
            {orderSearch || orderFilter !== "all"
              ? "No orders match your filters"
              : "Orders will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
