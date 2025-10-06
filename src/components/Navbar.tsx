"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiShoppingBag, FiUser, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <FiShoppingBag className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Thriftian</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <FiUser className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user.displayName}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>
                {user.role === "seller" && (
                  <Link
                    href="/dashboard/seller"
                    className="text-sm text-gray-700 hover:text-blue-600 transition"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/dashboard/admin"
                    className="text-sm text-gray-700 hover:text-blue-600 transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-red-600 transition"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
