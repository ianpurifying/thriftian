// app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Product, User, Order, Report } from "@/lib/types";
import Button from "@/components/Button";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "products" | "users" | "orders" | "reports"
  >("products");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    } else {
      router.push("/");
    }
  }, [user]);

  const fetchData = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();

      const [productsRes, usersRes, ordersRes, reportsRes] = await Promise.all([
        fetch("/api/products?status=pending", {
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
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${productId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Product approved!");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to approve product:", error);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason || !firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${productId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert("Product rejected!");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to reject product:", error);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    if (!firebaseUser || !confirm(`Change user role to ${newRole}?`)) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        alert("User role updated!");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Access denied. Admin role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 ${
            activeTab === "products" ? "border-b-2 border-black font-bold" : ""
          }`}
        >
          Pending Products ({pendingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 ${
            activeTab === "users" ? "border-b-2 border-black font-bold" : ""
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 ${
            activeTab === "orders" ? "border-b-2 border-black font-bold" : ""
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 ${
            activeTab === "reports" ? "border-b-2 border-black font-bold" : ""
          }`}
        >
          Reports ({reports.filter((r) => r.status === "pending").length})
        </button>
      </div>

      {activeTab === "products" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3">{product.title}</td>
                  <td className="px-4 py-3">{product.sellerName}</td>
                  <td className="px-4 py-3">₱{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Button onClick={() => handleApproveProduct(product.id)}>
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleRejectProduct(product.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingProducts.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              No pending products
            </p>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Verified</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u.verified ? "✓" : "✗"}</td>
                  <td className="px-4 py-3">
                    <select
                      onChange={(e) =>
                        handleChangeUserRole(u.id, e.target.value)
                      }
                      defaultValue={u.role}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3">#{order.id.substring(0, 8)}</td>
                  <td className="px-4 py-3">{order.buyerName}</td>
                  <td className="px-4 py-3">{order.sellerName}</td>
                  <td className="px-4 py-3">₱{order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Target ID</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="px-4 py-3">{report.type}</td>
                  <td className="px-4 py-3">
                    {report.targetId.substring(0, 8)}
                  </td>
                  <td className="px-4 py-3">{report.reason}</td>
                  <td className="px-4 py-3">{report.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <p className="text-center py-8 text-gray-500">No reports</p>
          )}
        </div>
      )}
    </div>
  );
}
