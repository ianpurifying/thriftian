"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { FiPackage, FiTrendingUp, FiShield } from "react-icons/fi";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "seller") {
        router.replace("/dashboard/seller");
      } else if (user.role === "admin") {
        router.replace("/dashboard/admin");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user && (user.role === "seller" || user.role === "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Thriftian
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing pre-loved items at unbeatable prices. Shop
            sustainably and save money.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FiPackage className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Quality Products
            </h3>
            <p className="text-gray-600">
              Every item is carefully inspected to ensure quality and
              authenticity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiTrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Best Prices
            </h3>
            <p className="text-gray-600">
              Save up to 70% on brand-name items in excellent condition.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FiShield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure Shopping
            </h3>
            <p className="text-gray-600">
              Shop with confidence using our secure payment and verification
              system.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Shopping Today
          </h2>
          <p className="text-gray-600 mb-6">
            {user
              ? "Browse our marketplace and find your next favorite item."
              : "Sign up now to start buying and selling pre-loved items."}
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <a
                href="/auth/signup"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </a>
              <a
                href="/auth/login"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Sign In
              </a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
