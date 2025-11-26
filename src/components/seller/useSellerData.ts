// src/components/seller/useSellerData.ts
"use client";

import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { Order, Analytics, Product } from "@/lib/types";
import { ProductWithMetrics, SalesDataPoint } from "./types";

interface UseSellerDataProps {
  firebaseUser: FirebaseUser | null;
  userId?: string;
}

export function useSellerData({ firebaseUser, userId }: UseSellerDataProps) {
  const [products, setProducts] = useState<ProductWithMetrics[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ✅ NEW: Calculate actual sales count from orders
  const calculateProductMetrics = (
    productsList: Product[],
    ordersList: Order[]
  ): ProductWithMetrics[] => {
    // Create a map to count sales per product
    const salesCountMap = new Map<string, number>();

    // Count sales from all orders (excluding cancelled orders)
    ordersList
      .filter((order) => order.status !== "cancelled")
      .forEach((order) => {
        order.items.forEach((item) => {
          const currentCount = salesCountMap.get(item.productId) || 0;
          salesCountMap.set(item.productId, currentCount + item.quantity);
        });
      });

    // Map products with their actual sales count
    return productsList.map((product) => ({
      ...product,
      views: 0, // You can implement real view tracking later
      salesCount: salesCountMap.get(product.id) || 0,
    }));
  };

  const fetchData = async () => {
    if (!firebaseUser || !userId) return;

    try {
      const token = await firebaseUser.getIdToken();

      const [productsRes, ordersRes, analyticsRes] = await Promise.all([
        fetch(`/api/products?sellerId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/analytics/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let fetchedProducts: Product[] = [];
      let fetchedOrders: Order[] = [];

      if (productsRes.ok) {
        const data = await productsRes.json();
        fetchedProducts = data.products || [];
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        fetchedOrders = data.orders || [];
        setOrders(fetchedOrders);
        generateSalesData(fetchedOrders);
      }

      // ✅ Calculate metrics with actual data
      const productsWithMetrics = calculateProductMetrics(
        fetchedProducts,
        fetchedOrders
      );
      setProducts(productsWithMetrics);

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

  useEffect(() => {
    fetchData();
  }, [firebaseUser, userId]);

  return {
    products,
    orders,
    analytics,
    salesData,
    loading,
    refetch: fetchData,
  };
}
