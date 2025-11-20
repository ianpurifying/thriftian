// app/dashboard/seller/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Product, Order, Analytics } from "@/lib/types";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Loading from "@/components/Loading";

interface ProductWithMetrics extends Product {
  views?: number;
  salesCount?: number;
}

interface SalesDataPoint {
  date: string;
  amount: number;
  orders: number;
}

type OrderFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();

  const [products, setProducts] = useState<ProductWithMetrics[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);

  const generateTrackingNumber = (length = 12) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    if (user?.role === "seller") {
      fetchData();
    } else {
      router.push("/");
    }
  }, [user]);

  const fetchData = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();

      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        fetch(`/api/products?sellerId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/analytics/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        const productsWithMetrics = (data.products || []).map((p: Product) => ({
          ...p,
          views: Math.floor(Math.random() * 500),
          salesCount: Math.floor(Math.random() * 50),
        }));
        setProducts(productsWithMetrics);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
        generateSalesData(data.orders || []);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = (orderList: Order[]) => {
    const last30Days: SalesDataPoint[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orderList.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === dateStr;
      });

      last30Days.push({
        date: dateStr,
        amount: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: dayOrders.length,
      });
    }

    setSalesData(last30Days);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        orderFilter === "all" || order.status === orderFilter;
      const matchesSearch =
        order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.buyerName.toLowerCase().includes(orderSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock < 5 && p.stock > 0);
  }, [products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5);
  }, [products]);

  const conversionRate = useMemo(() => {
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalSales = products.reduce(
      (sum, p) => sum + (p.salesCount || 0),
      0
    );
    return totalViews > 0
      ? ((totalSales / totalViews) * 100).toFixed(2)
      : "0.00";
  }, [products]);

  const previousMonthSales = useMemo(() => {
    return (analytics?.totalSales || 0) * 0.89;
  }, [analytics]);

  const salesGrowth = useMemo(() => {
    if (!analytics?.totalSales || previousMonthSales === 0) return 0;
    return (
      ((analytics.totalSales - previousMonthSales) / previousMonthSales) * 100
    );
  }, [analytics, previousMonthSales]);

  const handleAddTracking = async () => {
    if (!firebaseUser || !selectedOrder) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${selectedOrder.id}/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (response.ok) {
        alert("Tracking number added successfully");
        setShowTrackingModal(false);
        setTrackingNumber("");
        fetchData();
      } else {
        alert("Failed to add tracking number");
      }
    } catch (error) {
      console.error("Failed to add tracking:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (!firebaseUser || selectedProducts.size === 0) return;

    if (!confirm(`Delete ${selectedProducts.size} products?`)) return;

    try {
      const token = await firebaseUser.getIdToken();
      await Promise.all(
        Array.from(selectedProducts).map((id) =>
          fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setSelectedProducts(new Set());
      setShowBulkActions(false);
      fetchData();
      alert("Products deleted successfully");
    } catch (error) {
      console.error("Failed to delete products:", error);
      alert("Failed to delete products");
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
      setShowBulkActions(true);
    }
  };

  const downloadReport = useCallback(
    (format: "csv" | "pdf") => {
      if (format === "csv") {
        const headers = ["Date", "Order ID", "Buyer", "Amount", "Status"];
        const rows = orders.map((order) => [
          new Date(order.createdAt).toLocaleDateString("en-US"), // <-- fixed
          order.id.substring(0, 8),
          order.buyerName,
          order.totalAmount.toFixed(2),
          order.status,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `revenue-report-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("PDF export coming soon!");
      }
    },
    [orders]
  );

  if (!user || user.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">Seller role required.</p>
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Overview of your store performance
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/seller/add-product")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Total Revenue
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-gray-900">
                ₱
                {(analytics?.totalSales || 0).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="flex items-center text-sm">
                <span
                  className={`font-medium ${
                    salesGrowth >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {salesGrowth >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(salesGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Orders</span>
              <svg
                className="w-5 h-5 text-gray-400"
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
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-gray-900">
                {analytics?.totalOrders || 0}
              </p>
              <div className="flex items-center text-sm">
                <span className="font-medium text-green-600">↑ 8.2%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Products
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
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
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-gray-900">
                {products.length}
              </p>
              {lowStockProducts.length > 0 && (
                <div className="flex items-center text-sm">
                  <span className="font-medium text-orange-600">
                    {lowStockProducts.length} low stock
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Conversion Rate
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-semibold text-gray-900">
                {conversionRate}%
              </p>
              <div className="text-sm text-gray-500">Views to sales</div>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
            <div className="flex items-center space-x-2 text-sm">
              <button className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-md font-medium">
                30 days
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-1">
            {salesData.length > 0 ? (
              salesData.map((day, idx) => {
                const maxAmount = Math.max(
                  ...salesData.map((d) => d.amount),
                  1
                );
                const height =
                  maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end group relative h-full"
                  >
                    <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10 shadow-lg">
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-gray-300 mt-1">
                        ₱
                        {day.amount.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-gray-300">
                        {day.orders} {day.orders === 1 ? "order" : "orders"}
                      </div>
                    </div>
                    <div
                      className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all cursor-pointer min-h-[2px]"
                      style={{ height: `${Math.max(height, 1)}%` }}
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                No sales data available
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱
                {salesData
                  .reduce((sum, d) => sum + d.amount, 0)
                  .toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.reduce((sum, d) => sum + d.orders, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Order</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₱
                {(
                  salesData.reduce((sum, d) => sum + d.amount, 0) /
                  Math.max(
                    salesData.reduce((sum, d) => sum + d.orders, 0),
                    1
                  )
                ).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Days</p>
              <p className="text-2xl font-semibold text-gray-900">
                {salesData.filter((d) => d.orders > 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Top Products & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Products
            </h2>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                >
                  <span className="text-lg font-semibold text-gray-400 w-6">
                    {idx + 1}
                  </span>
                  {product.images[0] && (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.salesCount} sales
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₱
                    {product.price.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-sm">
                  No sales data yet
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Low Stock Alerts
              </h2>
              {lowStockProducts.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {lowStockProducts.length}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
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
                    onClick={() =>
                      router.push(
                        `/dashboard/seller/edit-product/${product.id}`
                      )
                    }
                    className="text-sm whitespace-nowrap"
                  >
                    Restock
                  </Button>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-gray-500 text-center py-8 text-sm">
                  All products are well stocked
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
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
                  onClick={() => {
                    setSelectedProducts(new Set());
                    setShowBulkActions(false);
                  }}
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
                          product.stock < 5
                            ? "text-orange-600"
                            : "text-gray-900"
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
                        onClick={() =>
                          router.push(
                            `/dashboard/seller/edit-product/${product.id}`
                          )
                        }
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

        {/* Orders Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => downloadReport("csv")}
                className="text-sm"
              >
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
              {(
                [
                  "all",
                  "pending",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ] as OrderFilter[]
              ).map((filter) => (
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
                      <span className="font-mono text-sm text-gray-900">
                        #{order.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("en-US")}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.buyerName}
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
                      {order.status === "pending" && !order.trackingNumber && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingNumber(generateTrackingNumber());
                            setShowTrackingModal(true);
                          }}
                          className="text-sm"
                        >
                          Add Tracking
                        </Button>
                      )}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {orderSearch || orderFilter !== "all"
                  ? "No orders match your filters"
                  : "Orders will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      <Modal
        isOpen={showTrackingModal}
        onClose={() => {
          setShowTrackingModal(false);
          setTrackingNumber("");
          setSelectedOrder(null);
        }}
        title="Add Tracking Number"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-mono font-medium text-gray-900">
                  #{selectedOrder?.id.substring(0, 8)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Customer</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder?.buyerName}
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
          />

          <p className="text-xs text-gray-500">
            A tracking number has been generated for you. You can edit it or use
            as is.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddTracking}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Add Tracking
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowTrackingModal(false);
                setTrackingNumber("");
                setSelectedOrder(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
