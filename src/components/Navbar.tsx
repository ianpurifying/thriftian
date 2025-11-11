"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  isRead: boolean;
  message: string;
  createdAt: string;
}

export default function Navbar() {
  const { user, signOut, firebaseUser } = useAuth();
  const { itemCount } = useCart();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (!firebaseUser) return;

    const fetchUnreadCount = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const count = (data.notifications || []).filter(
            (n: Notification) => !n.isRead
          ).length;
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchUnreadCount();

    // Optionally, poll every 30s for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [firebaseUser]);

  return (
    <nav className="bg-amber-100 border-b-4 border-amber-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-rye text-3xl text-amber-900 retro-text-shadow hover:text-amber-700 transition-colors"
            >
              Thriftian
            </Link>

            {user && (
              <div className="hidden md:flex gap-6 font-nunito font-semibold text-amber-900">
                <Link
                  href="/"
                  className="hover:text-teal-700 transition-colors"
                >
                  Browse
                </Link>
                {user.role === "seller" && (
                  <Link
                    href="/dashboard/seller"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Seller Hub
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/dashboard/admin"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 font-nunito font-semibold text-amber-900 relative">
            {user ? (
              <>
                <Link
                  href="/orders"
                  className="hover:text-teal-700 transition-colors hidden sm:block"
                >
                  Orders
                </Link>
                <Link
                  href="/cart"
                  className="hover:text-teal-700 transition-colors bg-amber-600 text-white px-3 py-2 rounded-lg border-2 border-amber-800 retro-shadow"
                >
                  🛒 ({itemCount})
                </Link>

                {/* Notifications bell with badge */}
                <Link
                  href="/notifications"
                  className="hover:text-teal-700 transition-colors hidden sm:block relative"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <span className="text-sm hidden md:block font-pacifico text-teal-700">
                  {user.name}
                </span>
                <button
                  onClick={signOut}
                  className="hover:text-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-teal-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg border-2 border-amber-800 retro-shadow-hover"
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
