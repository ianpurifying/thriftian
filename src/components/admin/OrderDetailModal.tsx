// src/components/admin/OrderDetailModal.tsx
import { useState } from "react";
import { Order } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onRefresh: () => void;
}

export default function OrderDetailModal({
  order,
  onClose,
  onRefresh,
}: OrderDetailModalProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ""
  );
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!firebaseUser) return;
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        showToast("Order status updated successfully", "success");
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update order status", "error");
      }
    } catch {
      showToast("Failed to update order status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!firebaseUser || !trackingNumber.trim()) {
      showToast("Please enter a tracking number", "error");
      return;
    }
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${order.id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (response.ok) {
        showToast("Tracking number updated successfully", "success");
        onRefresh();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update tracking number", "error");
      }
    } catch {
      showToast("Failed to update tracking number", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 10) {
      showToast("Cancellation reason must be at least 10 characters", "error");
      return;
    }

    await handleUpdateStatus("cancelled");
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500 font-mono">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₱{order.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Payment Method
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {order.paymentMethod}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Buyer Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Name:</span>{" "}
                  <span className="text-gray-900">{order.buyerName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-600">ID:</span>{" "}
                  <span className="text-gray-900 font-mono text-xs">
                    {order.buyerId}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Seller Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Name:</span>{" "}
                  <span className="text-gray-900">{order.sellerName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-600">ID:</span>{" "}
                  <span className="text-gray-900 font-mono text-xs">
                    {order.sellerId}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Shipping Address
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">
                {order.shippingAddress.street}
              </p>
              <p className="text-sm text-gray-900">
                {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                {order.shippingAddress.zip}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ₱{item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Tracking Information
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                disabled={
                  order.status === "delivered" || order.status === "cancelled"
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100"
              />
              <button
                onClick={handleUpdateTracking}
                disabled={
                  loading ||
                  order.status === "delivered" ||
                  order.status === "cancelled" ||
                  trackingNumber === order.trackingNumber
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Update
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Timeline</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-600">Created:</span>{" "}
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600">Last Updated:</span>{" "}
                <span className="text-gray-900">
                  {new Date(order.updatedAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Order Actions
              </h3>
              {!showCancelInput ? (
                <div className="flex gap-3">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus("confirmed")}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus("shipped")}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus("delivered")}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button
                    onClick={() => setShowCancelInput(true)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    Cancel Order
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Cancel Order
                  </h4>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {loading ? "Processing..." : "Confirm Cancellation"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelInput(false);
                        setCancelReason("");
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
        colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
