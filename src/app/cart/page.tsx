"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Button from "@/components/Button";
import Input from "@/components/Input";

interface CartItem {
  productId: string;
  imageUrl?: string;
  title: string;
  price: number;
  quantity: number;
  stock: number;
  // add other fields your cart item contains if needed
}

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
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [itemsLoading, setItemsLoading] = useState(true);

  const shippingCost = items.length > 0 ? 50 : 0;
  const finalTotal = total + shippingCost;

  useEffect(() => {
    if (user) {
      setAddress({
        street: user.address.street || "",
        city: user.address.city || "",
        province: user.address.province || "",
        zip: user.address.zip || "",
      });
    }
    setTimeout(() => setItemsLoading(false), 300);
  }, [user]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCheckout = async () => {
    if (!firebaseUser || !user) {
      router.push("/login");
      return;
    }

    if (!user.verified) {
      setNotification({
        type: "warning",
        message: "Please verify your email before placing an order",
      });
      return;
    }

    if (items.length === 0) {
      setNotification({ type: "error", message: "Your cart is empty" });
      return;
    }

    if (!address.street || !address.city || !address.province || !address.zip) {
      setNotification({
        type: "warning",
        message: "Please complete your shipping address",
      });
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
        setNotification({
          type: "success",
          message: "Order placed successfully!",
        });
        setTimeout(() => router.push(`/orders/${data.orderId}`), 1000);
      } else {
        const data = await response.json();
        setNotification({
          type: "error",
          message: data.error || "Failed to place order",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setNotification({ type: "error", message: "Failed to place order" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setRemovingItem(productId);
    setTimeout(() => {
      removeItem(productId);
      setRemovingItem(null);
      setNotification({ type: "success", message: "Item removed from cart" });
    }, 300);
  };

  const getStockStatus = (item: CartItem) => {
    if (item.stock === 0) return { text: "Out of Stock", color: "red" };
    if (item.stock <= 5)
      return { text: `Low Stock (${item.stock} left)`, color: "yellow" };
    return { text: "In Stock", color: "green" };
  };

  const isCheckoutDisabled = () => {
    if (loading) return true;
    if (items.length === 0) return true;
    if (!address.street || !address.city || !address.province || !address.zip)
      return true;
    return false;
  };

  const getCheckoutButtonText = () => {
    if (loading) return "Processing...";
    if (items.length === 0) return "Cart is Empty";
    if (!address.street || !address.city || !address.province || !address.zip)
      return "Complete Address";
    return "Place Order";
  };

  const CartSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
        >
          <div className="flex gap-4">
            <div className="w-28 h-28 bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to view your cart
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access your shopping cart
          </p>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transition-all duration-300 animate-in slide-in-from-top ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : notification.type === "warning"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`font-medium ${
              notification.type === "success"
                ? "text-green-800"
                : notification.type === "warning"
                ? "text-yellow-800"
                : "text-red-800"
            }`}
          >
            {notification.message}
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you have not added anything to your cart yet.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => router.push("/products")}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Browse Products
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32 lg:pb-8">
            <div className="lg:col-span-2">
              {itemsLoading ? (
                <CartSkeleton />
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <div
                        key={item.productId}
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-300 ${
                          removingItem === item.productId
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex gap-4">
                          <div
                            className="w-28 h-28 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                              router.push(`/product/${item.productId}`)
                            }
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors truncate"
                              onClick={() =>
                                router.push(`/product/${item.productId}`)
                              }
                            >
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-3">
                              <p className="text-xl font-bold text-gray-900">
                                ₱{item.price.toFixed(2)}
                              </p>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  stockStatus.color === "green"
                                    ? "bg-green-50 text-green-700"
                                    : stockStatus.color === "yellow"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {stockStatus.text}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  className="px-4 py-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={item.quantity >= item.stock}
                                  className="px-4 py-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-600 mb-1">
                              Subtotal
                            </p>
                            <p className="text-xl font-bold text-gray-900">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 md:hidden">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Subtotal
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Shipping Address
                  </h2>

                  <div className="space-y-4">
                    <Input
                      label="Street Address"
                      placeholder="123 Main Street"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        placeholder="Manila"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Province"
                        placeholder="Metro Manila"
                        value={address.province}
                        onChange={(e) =>
                          setAddress({ ...address, province: e.target.value })
                        }
                        required
                      />
                    </div>

                    <Input
                      label="ZIP Code"
                      placeholder="1000"
                      value={address.zip}
                      onChange={(e) =>
                        setAddress({ ...address, zip: e.target.value })
                      }
                      required
                    />
                  </div>

                  {user?.address.street && (
                    <button
                      onClick={() =>
                        setAddress({
                          street: user.address.street || "",
                          city: user.address.city || "",
                          province: user.address.province || "",
                          zip: user.address.zip || "",
                        })
                      }
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Use saved address
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal ({items.length} items)</span>
                      <span className="font-medium">₱{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-medium">
                        {shippingCost > 0
                          ? `₱${shippingCost.toFixed(2)}`
                          : "FREE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₱{finalTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      Payment Method
                    </p>
                    <p className="text-sm text-blue-700">Cash on Delivery</p>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 text-base font-semibold"
                    disabled={isCheckoutDisabled()}
                  >
                    {getCheckoutButtonText()}
                  </Button>

                  {!user.verified && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Email verification required to
                        checkout
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Secure checkout
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Easy returns
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">
                  Total ({items.length} items)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{finalTotal.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={handleCheckout}
                className="px-8 h-12 text-base font-semibold"
                disabled={isCheckoutDisabled()}
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </div>
            {(!address.street ||
              !address.city ||
              !address.province ||
              !address.zip) && (
              <p className="text-xs text-yellow-700 text-center">
                Complete shipping address to checkout
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
