// src/app/dashboard/seller/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OrderStatus } from "@/lib/types";
import Loading from "@/components/Loading";

// Components
import DashboardHeader from "@/components/seller/DashboardHeader";
import AnalyticsSection from "@/components/seller/AnalyticsSection";
import KPICardsWithSparklines from "@/components/seller/analytics/KPICardsWithSparklines";
import RevenueLineChart from "@/components/seller/analytics/RevenueLineChart";
import TopProductsBarChart from "@/components/seller/analytics/TopProductsBarChart";
import ConversionFunnelChart from "@/components/seller/analytics/ConversionFunnelChart";
import ConversionGaugeChart from "@/components/seller/analytics/ConversionGaugeChart";
import LowStockAlertsWidget from "@/components/seller/analytics/LowStockAlertsWidget";
import ProductsTable from "@/components/seller/ProductsTable";
import OrdersTable from "@/components/seller/OrdersTable";
import {
  SalesHeatmap,
  RevenueByCategoryChart,
  RevenueShareDonutChart,
} from "@/components/seller/analytics";

import {
  OrderDetailModal,
  TrackingModal,
  CancelOrderModal,
} from "@/components/seller/OrderModals";

// Hooks & Utils
import { useSellerData } from "@/components/seller/useSellerData";
import { useAnalyticsCalculations } from "@/components/seller/analytics/useAnalyticsCalculations";
import {
  generateTrackingNumber,
  downloadCSVReport,
} from "@/components/seller/sellerUtils";
import { Order } from "@/lib/types";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();

  // Fetch data
  const { products, orders, analytics, salesData, loading, refetch } =
    useSellerData({
      firebaseUser,
      userId: user?.id,
    });

  // Calculate analytics
  const analyticsData = useAnalyticsCalculations({
    products,
    orders,
    salesData,
    analytics,
  });

  // Modal states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Handlers
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
        refetch();
      } else {
        alert("Failed to add tracking number");
      }
    } catch (error) {
      console.error("Failed to add tracking:", error);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    if (!firebaseUser) return;
    setUpdatingOrderId(orderId);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`Order status updated to ${newStatus}`);
        refetch();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!firebaseUser || !selectedOrder) return;

    setUpdatingOrderId(selectedOrder.id);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled",
          reason,
        }),
      });

      if (response.ok) {
        alert("Order cancelled successfully");
        setShowCancelModal(false);
        setSelectedOrder(null);
        refetch();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleBulkDelete = async (productIds: string[]) => {
    if (!firebaseUser || productIds.length === 0) return;

    if (!confirm(`Delete ${productIds.length} products?`)) return;

    try {
      const token = await firebaseUser.getIdToken();
      await Promise.all(
        productIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      refetch();
      alert("Products deleted successfully");
    } catch (error) {
      console.error("Failed to delete products:", error);
      alert("Failed to delete products");
    }
  };

  const handleAddTrackingClick = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(generateTrackingNumber());
    setShowTrackingModal(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleCancelOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleExport = useCallback(() => {
    downloadCSVReport(orders);
  }, [orders]);

  // Guards
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader
        onAddProduct={() => router.push("/dashboard/seller/add-product")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Time Range Analytics */}
        <AnalyticsSection orders={orders} sellerName={user?.name} />

        {/* KPI Cards with Sparklines */}
        <KPICardsWithSparklines
          totalRevenue={analyticsData.totalRevenue}
          totalOrders={analyticsData.totalOrders}
          conversionRate={analyticsData.conversionRate}
          averageOrderValue={analyticsData.averageOrderValue}
          revenueChange={analyticsData.revenueChange}
          ordersChange={analyticsData.ordersChange}
          conversionChange={analyticsData.conversionChange}
          aovChange={analyticsData.aovChange}
          sparklineData={analyticsData.sparklineData}
        />

        {/* Revenue Line Chart */}
        <RevenueLineChart salesData={salesData} />

        {/* Top Row: Conversion Funnel + Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionFunnelChart
            views={analyticsData.totalViews}
            cart={analyticsData.totalCartAdds}
            orders={analyticsData.totalOrders}
            completed={analyticsData.completedOrders}
          />
          <ConversionGaugeChart conversionRate={analyticsData.conversionRate} />
        </div>

        {/* Second Row: Top Products Bar + Revenue Share Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsBarChart topProducts={analyticsData.topProductsData} />
          <RevenueShareDonutChart topProducts={analyticsData.topProductsData} />
        </div>

        {/* Third Row: Revenue by Category + Sales Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueByCategoryChart
            categoryData={analyticsData.categoryRevenueData}
          />
          <SalesHeatmap heatmapData={analyticsData.heatmapData} />
        </div>

        {/* Low Stock Alerts */}
        <LowStockAlertsWidget
          lowStockProducts={analyticsData.lowStockProducts}
          criticalStockProducts={analyticsData.criticalStockProducts}
          onRestock={(id) =>
            router.push(`/dashboard/seller/edit-product/${id}`)
          }
        />

        {/* Products Table */}
        <ProductsTable
          products={products}
          onEdit={(id) => router.push(`/dashboard/seller/edit-product/${id}`)}
          onBulkDelete={handleBulkDelete}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          onViewDetails={handleViewDetails}
          onAddTracking={handleAddTrackingClick}
          onUpdateStatus={handleUpdateOrderStatus}
          onCancelOrder={handleCancelOrderClick}
          onExport={handleExport}
          updatingOrderId={updatingOrderId}
        />

        {/* Modals */}
        <OrderDetailModal
          isOpen={showOrderDetailModal}
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetailModal(false);
            setSelectedOrder(null);
          }}
        />

        <TrackingModal
          isOpen={showTrackingModal}
          order={selectedOrder}
          trackingNumber={trackingNumber}
          onTrackingChange={setTrackingNumber}
          onSubmit={handleAddTracking}
          onClose={() => {
            setShowTrackingModal(false);
            setTrackingNumber("");
            setSelectedOrder(null);
          }}
        />

        <CancelOrderModal
          isOpen={showCancelModal}
          order={selectedOrder}
          onCancel={handleCancelOrder}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          isUpdating={updatingOrderId === selectedOrder?.id}
        />
      </div>
    </div>
  );
}
