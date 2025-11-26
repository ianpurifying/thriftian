// src/components/seller/OrderModals.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Order } from "@/lib/types";

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({
  isOpen,
  order,
  onClose,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-mono font-medium text-gray-900">
                #{order.id.substring(0, 8)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
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
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{order.buyerName}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount</p>
              <p className="font-semibold text-gray-900">
                ₱
                {order.totalAmount.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
              {order.shippingAddress.zip}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    ₱{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-sm text-gray-900">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} className="flex-1" variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface TrackingModalProps {
  isOpen: boolean;
  order: Order | null;
  trackingNumber: string;
  onTrackingChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function TrackingModal({
  isOpen,
  order,
  trackingNumber,
  onTrackingChange,
  onSubmit,
  onClose,
}: TrackingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Tracking Number">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-mono font-medium text-gray-900">
                #{order?.id.substring(0, 8)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{order?.buyerName}</p>
            </div>
          </div>
        </div>

        <Input
          label="Tracking Number"
          value={trackingNumber}
          onChange={(e) => onTrackingChange(e.target.value)}
          placeholder="Enter tracking number"
        />

        <p className="text-xs text-gray-500">
          A tracking number has been generated for you. You can edit it or use
          as is.
        </p>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onSubmit}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            Add Tracking
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface CancelOrderModalProps {
  isOpen: boolean;
  order: Order | null;
  onCancel: (reason: string) => void;
  onClose: () => void;
  isUpdating: boolean;
}

export function CancelOrderModal({
  isOpen,
  order,
  onCancel,
  onClose,
  isUpdating,
}: CancelOrderModalProps) {
  const [cancelReason, setCancelReason] = useState("");

  const handleCancel = () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 10) {
      alert("Cancellation reason must be at least 10 characters");
      return;
    }
    onCancel(cancelReason);
    setCancelReason("");
  };

  const handleClose = () => {
    setCancelReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cancel Order">
      {order && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-2">
              Are you sure you want to cancel order{" "}
              <span className="font-mono font-semibold">
                #{order.id.substring(0, 8)}
              </span>
              ?
            </p>
            <p className="text-xs text-red-700">
              This action cannot be undone. Please provide a reason for
              cancellation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation (minimum 10 characters)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              {cancelReason.length}/10 characters minimum
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCancel}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isUpdating}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
