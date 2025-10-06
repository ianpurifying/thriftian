"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiActivity,
} from "react-icons/fi";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.displayName}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Users</span>
                <FiUsers className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Registered users</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Products</span>
                <FiShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Active listings</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <FiDollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Orders</span>
                <FiActivity className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Users
              </h2>
              <div className="text-center py-8 text-gray-500">
                No users registered yet
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Transactions
              </h2>
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Admin Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Manage Users
              </button>
              <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Manage Products
              </button>
              <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                View Reports
              </button>
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                System Settings
              </button>
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Security Logs
              </button>
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Analytics
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
