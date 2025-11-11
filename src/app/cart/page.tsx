// app/cart/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function CartPage() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [address, setAddress] = useState({
    street: user?.address.street || "",
    city: user?.address.city || "",
    province: user?.address.province || "",
    zip: user?.address.zip || "",
  });
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!firebaseUser || !user) {
      router.push("/login");
      return;
    }

    if (!user.verified) {
      alert("Please verify your email before placing an order");
      return;
    }

    if (items.length === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        clearCart();
        router.push(`/orders/${data.orderId}`);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Please sign in to view your cart</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 border rounded-lg p-4"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-lg font-medium mb-2">
                      ₱{item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <Input
                  label="Street Address"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  required
                />
                <Input
                  label="City"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  required
                />
                <Input
                  label="Province"
                  value={address.province}
                  onChange={(e) =>
                    setAddress({ ...address, province: e.target.value })
                  }
                  required
                />
                <Input
                  label="ZIP Code"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  required
                />
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Payment Method: Cash on Delivery
              </p>

              <Button
                onClick={handleCheckout}
                className="w-full"
                disabled={loading || !address.street || !address.city}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
