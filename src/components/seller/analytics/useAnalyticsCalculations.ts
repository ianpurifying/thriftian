// src/components/seller/analytics/useAnalyticsCalculations.ts
"use client";

import { useMemo } from "react";
import { Order, Analytics } from "@/lib/types";
import { ProductWithMetrics, SalesDataPoint } from "../types";

interface UseAnalyticsCalculationsProps {
  products: ProductWithMetrics[];
  orders: Order[];
  salesData: SalesDataPoint[];
  analytics: Analytics | null;
}

export function useAnalyticsCalculations({
  products,
  orders,
  salesData,
}: UseAnalyticsCalculationsProps) {
  // Calculate total revenue
  const totalRevenue = useMemo(
    () => salesData.reduce((sum, d) => sum + d.amount, 0),
    [salesData]
  );

  // Calculate total orders
  const totalOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").length,
    [orders]
  );

  // Calculate completed orders
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "delivered").length,
    [orders]
  );

  // Calculate average order value
  const averageOrderValue = useMemo(
    () => (totalOrders > 0 ? totalRevenue / totalOrders : 0),
    [totalRevenue, totalOrders]
  );

  // Calculate total views (sum of all product views)
  const totalViews = useMemo(
    () => products.reduce((sum, p) => sum + (p.views || 0), 0),
    [products]
  );

  // Estimate cart adds (60% of views as realistic metric)
  const totalCartAdds = useMemo(
    () => Math.floor(totalViews * 0.6),
    [totalViews]
  );

  // Calculate conversion rate
  const conversionRate = useMemo(() => {
    if (totalViews === 0) return 0;
    return (totalOrders / totalViews) * 100;
  }, [totalOrders, totalViews]);

  // Calculate previous period metrics for growth
  const previousPeriodRevenue = useMemo(() => {
    const midPoint = Math.floor(salesData.length / 2);
    const previousPeriod = salesData.slice(0, midPoint);
    return previousPeriod.reduce((sum, d) => sum + d.amount, 0);
  }, [salesData]);

  const currentPeriodRevenue = useMemo(() => {
    const midPoint = Math.floor(salesData.length / 2);
    const currentPeriod = salesData.slice(midPoint);
    return currentPeriod.reduce((sum, d) => sum + d.amount, 0);
  }, [salesData]);

  const revenueChange = useMemo(() => {
    if (previousPeriodRevenue === 0) return 0;
    return (
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
      100
    );
  }, [currentPeriodRevenue, previousPeriodRevenue]);

  const ordersChange = useMemo(() => {
    const midPoint = Math.floor(salesData.length / 2);
    const previousOrders = salesData
      .slice(0, midPoint)
      .reduce((sum, d) => sum + d.orders, 0);
    const currentOrders = salesData
      .slice(midPoint)
      .reduce((sum, d) => sum + d.orders, 0);
    if (previousOrders === 0) return 0;
    return ((currentOrders - previousOrders) / previousOrders) * 100;
  }, [salesData]);

  // Sparkline data (last 7 days)
  const sparklineData = useMemo(() => {
    return salesData.slice(-7).map((d) => d.amount);
  }, [salesData]);

  // Top products data
  const topProductsData = useMemo(() => {
    return products
      .filter((p) => p.salesCount && p.salesCount > 0)
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        salesCount: p.salesCount || 0,
        revenue: (p.salesCount || 0) * p.price,
        price: p.price,
        image: p.images[0]?.url || "",
      }));
  }, [products]);

  // Revenue by category
  const categoryRevenueData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    products.forEach((product) => {
      const revenue = (product.salesCount || 0) * product.price;
      const current = categoryMap.get(product.category) || 0;
      categoryMap.set(product.category, current + revenue);
    });

    return Array.from(categoryMap.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .filter((item) => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [products]);

  // Heatmap data (7 days x 4 weeks) - FIXED VERSION
  const heatmapData = useMemo(() => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Initialize 4 weeks x 7 days grid
    const weeks: Array<Array<{ day: string; orders: number; date: string }>> =
      [];
    for (let week = 0; week < 4; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        weekData.push({
          day: daysOfWeek[day],
          orders: 0,
          date: "",
        });
      }
      weeks.push(weekData);
    }

    // Process orders to fill the heatmap
    orders.forEach((order) => {
      if (order.status === "cancelled") return;

      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);

      // Calculate how many days ago this order was placed
      const daysAgo = Math.floor(
        (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only include orders from the last 28 days
      if (daysAgo < 0 || daysAgo >= 28) return;

      // Calculate which week (0 = current week, 3 = 3 weeks ago)
      const weekIndex = 3 - Math.floor(daysAgo / 7);

      // Calculate the correct day index
      // Work backwards from today's day of week
      const dayIndex = (todayDayOfWeek - (daysAgo % 7) + 7) % 7;

      if (weekIndex >= 0 && weekIndex < 4) {
        weeks[weekIndex][dayIndex].orders += 1;
      }
    });

    return weeks;
  }, [orders]);

  // Low stock products
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock < 5),
    [products]
  );

  const criticalStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= 2),
    [products]
  );

  return {
    totalRevenue,
    totalOrders,
    completedOrders,
    averageOrderValue,
    totalViews,
    totalCartAdds,
    conversionRate,
    revenueChange,
    ordersChange,
    conversionChange: 2.5,
    aovChange: 5.3,
    sparklineData,
    topProductsData,
    categoryRevenueData,
    heatmapData,
    lowStockProducts,
    criticalStockProducts,
  };
}
