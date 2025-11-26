// src/components/seller/OrderActionMenu.tsx
"use client";

import { Order, OrderStatus } from "@/lib/types";

interface OrderActionMenuProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onAddTracking: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (order: Order) => void;
  isUpdating: boolean;
}

export default function OrderActionMenu({
  order,
  onViewDetails,
  onAddTracking,
  onUpdateStatus,
  onCancelOrder,
  isUpdating,
}: OrderActionMenuProps) {
  const handleToggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    const btn = event.currentTarget;
    const menu = btn.nextElementSibling as HTMLElement | null;
    if (menu) {
      menu.classList.toggle("hidden");
    }
  };

  return (
    <div className="relative inline-block group">
      <button
        onClick={handleToggleMenu}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        disabled={isUpdating}
      >
        Actions
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      <div className="hidden absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        <button
          onClick={() => onViewDetails(order)}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View Details
        </button>

        {order.status === "pending" && !order.trackingNumber && (
          <button
            onClick={() => onAddTracking(order)}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
            disabled={isUpdating}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Add Tracking
          </button>
        )}

        {order.status === "pending" && order.trackingNumber && (
          <button
            onClick={() => onUpdateStatus(order.id, "confirmed")}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
            disabled={isUpdating}
          >
            <svg
              className="w-4 h-4"
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
            {isUpdating ? "Confirming..." : "Confirm"}
          </button>
        )}

        {order.status === "confirmed" && (
          <button
            onClick={() => onUpdateStatus(order.id, "shipped")}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
            disabled={isUpdating}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m0 0v4"
              />
            </svg>
            {isUpdating ? "Updating..." : "Mark Shipped"}
          </button>
        )}

        {order.status === "shipped" && (
          <button
            onClick={() => onUpdateStatus(order.id, "delivered")}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
            disabled={isUpdating}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {isUpdating ? "Updating..." : "Mark Delivered"}
          </button>
        )}

        {order.status !== "delivered" && order.status !== "cancelled" && (
          <button
            onClick={() => onCancelOrder(order)}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            disabled={isUpdating}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
