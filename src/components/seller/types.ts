// src/components/seller/types.ts
import { Product } from "@/lib/types";

export interface ProductWithMetrics extends Product {
  views?: number;
  salesCount?: number;
}

export interface SalesDataPoint {
  date: string;
  amount: number;
  orders: number;
}

export interface TopProductData {
  id: string;
  title: string;
  salesCount: number;
  revenue: number;
  price: number;
  image: string;
}

export interface CategoryRevenueData {
  category: string;
  revenue: number;
}

export interface HeatmapDay {
  day: string;
  orders: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  totalViews: number;
  totalCartAdds: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  conversionChange: number;
  aovChange: number;
  sparklineData: number[];
  topProductsData: TopProductData[];
  categoryRevenueData: CategoryRevenueData[];
  heatmapData: HeatmapDay[][];
  lowStockProducts: ProductWithMetrics[];
  criticalStockProducts: ProductWithMetrics[];
}
