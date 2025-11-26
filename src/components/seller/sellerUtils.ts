// src/components/seller/sellerUtils.ts
import { Order } from "@/lib/types";

export function generateTrackingNumber(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function downloadCSVReport(orders: Order[]): void {
  const headers = ["Date", "Order ID", "Buyer", "Amount", "Status"];
  const rows = orders.map((order) => [
    new Date(order.createdAt).toLocaleDateString("en-US"),
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
  a.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function calculateConversionRate(
  products: Array<{ views?: number; salesCount?: number }>
): string {
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  return totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : "0.00";
}

export function calculateSalesGrowth(
  currentSales: number,
  previousSales: number
): number {
  if (previousSales === 0) return 0;
  return ((currentSales - previousSales) / previousSales) * 100;
}
