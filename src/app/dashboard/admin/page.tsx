// src/app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Product, User, Order, Report } from "@/lib/types";
import Loading from "@/components/Loading";
import { useToast } from "@/hooks/useToast";
import DashboardOverview from "@/components/admin/DashboardOverview";
import ProductsTab from "@/components/admin/ProductsTab";
import UsersTab from "@/components/admin/UsersTab";
import OrdersTab from "@/components/admin/OrdersTab";
import ReportsTab from "@/components/admin/ReportsTab";
import ActivityLogTab from "@/components/admin/ActivityLogTab";

type TabType =
  | "overview"
  | "products"
  | "users"
  | "orders"
  | "reports"
  | "logs";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const { showToast } = useToast();

  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
      const interval = setInterval(() => {
        fetchData();
      }, 60000);
      return () => clearInterval(interval);
    } else if (user) {
      router.push("/");
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();

      const [productsRes, allProductsRes, usersRes, ordersRes, reportsRes] =
        await Promise.all([
          fetch("/api/products?status=pending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/reports", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setPendingProducts(data.products || []);
      }

      if (allProductsRes.ok) {
        const data = await allProductsRes.json();
        setAllProducts(data.products || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports || []);
      }

      setLastFetch(new Date());
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, showToast]);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Admin role required to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const pendingReportsCount = reports.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastFetch.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            Refresh Data
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              label="Overview"
            />
            <TabButton
              active={activeTab === "products"}
              onClick={() => setActiveTab("products")}
              label="Products"
              badge={pendingProducts.length}
            />
            <TabButton
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
              label="Users"
              badge={users.length}
            />
            <TabButton
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              label="Orders"
              badge={orders.length}
            />
            <TabButton
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
              label="Reports"
              badge={pendingReportsCount}
              badgeColor="red"
            />
            <TabButton
              active={activeTab === "logs"}
              onClick={() => setActiveTab("logs")}
              label="Activity Logs"
            />
          </div>
        </div>

        <div className="animate-in fade-in duration-200">
          {activeTab === "overview" && (
            <DashboardOverview
              products={allProducts}
              pendingProducts={pendingProducts}
              users={users}
              orders={orders}
              reports={reports}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab
              products={pendingProducts}
              allProducts={allProducts}
              onRefresh={fetchData}
            />
          )}
          {activeTab === "users" && (
            <UsersTab users={users} onRefresh={fetchData} />
          )}
          {activeTab === "orders" && (
            <OrdersTab orders={orders} onRefresh={fetchData} />
          )}
          {activeTab === "reports" && (
            <ReportsTab reports={reports} onRefresh={fetchData} />
          )}
          {activeTab === "logs" && <ActivityLogTab />}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  badgeColor?: "gray" | "red";
}

function TabButton({
  active,
  onClick,
  label,
  badge,
  badgeColor = "gray",
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        active
          ? "border-gray-900 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      <span className="flex items-center gap-2">
        {label}
        {badge !== undefined && badge > 0 && (
          <span
            className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
              badgeColor === "red"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {badge}
          </span>
        )}
      </span>
    </button>
  );
}
