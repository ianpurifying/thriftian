"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

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
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationError, setNotificationError] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch unread notifications with optimization
  useEffect(() => {
    if (!firebaseUser) return;

    const fetchUnreadCount = async () => {
      // Don't fetch when tab is inactive
      if (document.hidden) return;

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
          setNotificationError(false);
        } else {
          setNotificationError(true);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotificationError(true);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every 60 seconds

    // Refetch when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [firebaseUser]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-purple-400 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-rye text-2xl sm:text-3xl text-purple-700 hover:text-purple-500 transition-colors flex-shrink-0"
          >
            <Image
              src="/logo.png"
              alt="Thriftian Logo"
              width={40}
              height={40}
            />
            <span className="hidden sm:inline">Thriftian</span>
          </Link>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex gap-6 font-nunito text-gray-700">
              {user.role === "seller" && (
                <Link
                  href="/dashboard/seller"
                  className="hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2"
                >
                  Seller Hub
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/dashboard/admin"
                  className="hover:text-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2"
                >
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative bg-purple-600 text-white px-3 py-2 rounded-lg border border-purple-700 hover:bg-purple-700 transition-colors text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold min-w-[1.25rem] h-5 flex items-center justify-center rounded-full px-1">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && (
              <Link
                href="/notifications"
                className="relative text-gray-700 hover:text-teal-600 transition-colors p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label={`Notifications${
                  unreadCount > 0 ? `, ${unreadCount} unread` : ""
                }`}
              >
                {notificationError ? (
                  <div
                    className="relative"
                    title="Failed to load notifications"
                  >
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="absolute -top-1 -right-1 text-red-600 text-xs">
                      ⚠️
                    </span>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[0.65rem] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )}

            {/* Auth / User Menu */}
            {user ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:text-purple-600 transition-colors p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline font-medium text-sm">
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  href="/login"
                  className="hover:text-teal-600 transition-colors text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg border border-amber-800 hover:bg-amber-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 px-2 pt-2 pb-3 border-t border-gray-200">
            {/* Mobile Search */}

            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg">
                  {user.name}
                </div>
                {user.role === "seller" && (
                  <Link
                    href="/dashboard/seller"
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={handleMobileNavClick}
                  >
                    Seller Hub
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/dashboard/admin"
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={handleMobileNavClick}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={handleMobileNavClick}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={handleMobileNavClick}
                >
                  My Orders
                </Link>
                <Link
                  href="/notifications"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors relative"
                  onClick={handleMobileNavClick}
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-3 bg-red-600 text-white text-[0.65rem] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    handleMobileNavClick();
                    signOut();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={handleMobileNavClick}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 bg-amber-600 text-white rounded-lg border border-amber-800 hover:bg-amber-700 transition-colors text-center"
                  onClick={handleMobileNavClick}
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
