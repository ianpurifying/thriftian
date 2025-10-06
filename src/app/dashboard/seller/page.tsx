"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
} from "react-icons/fi";

export default function SellerDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Seller Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.displayName}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Products</span>
                <FiPackage className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Active listings</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Sales</span>
                <FiDollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Orders</span>
                <FiShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Pending orders</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Revenue</span>
                <FiTrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Orders
              </h2>
              <div className="text-center py-8 text-gray-500">
                No orders yet
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-left">
                  Add New Product
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left">
                  Manage Inventory
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-left">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
