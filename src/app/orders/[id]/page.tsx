// app/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/lib/types";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && firebaseUser) {
      fetchOrder();
    }
  }, [params.id, firebaseUser]);

  const fetchOrder = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Please sign in to view order details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Order not found</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 hover:underline">
        ← Back to Orders
      </button>

      <div className="border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <span className={`px-4 py-2 rounded ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-700">
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.province}
              <br />
              {order.shippingAddress.zip}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Order Details</h3>
            <p className="text-sm text-gray-700">
              Payment Method: {order.paymentMethod}
              <br />
              {order.trackingNumber && (
                <>
                  Tracking Number: {order.trackingNumber}
                  <br />
                </>
              )}
              {user.role === "buyer" && <>Seller: {order.sellerName}</>}
              {user.role === "seller" && <>Buyer: {order.buyerName}</>}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-bold mb-4">Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">
                    ₱{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₱{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {user.role === "buyer" && order.status === "delivered" && (
        <div className="text-center">
          <Button
            onClick={() => router.push(`/product/${order.items[0].productId}`)}
          >
            Leave a Review
          </Button>
        </div>
      )}
    </div>
  );
}
