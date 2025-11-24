// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [displayCount, setDisplayCount] = useState(20);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const banners = [
    {
      title: "Vintage Treasures",
      subtitle: "Curated pre-loved fashion finds",
      bg: "bg-gradient-to-r from-amber-400 to-orange-500",
    },
    {
      title: "₱99 Deals",
      subtitle: "Quality pieces under ₱100",
      bg: "bg-gradient-to-r from-pink-400 to-rose-500",
    },
    {
      title: "Trending Fits",
      subtitle: "Most-loved items this week",
      bg: "bg-gradient-to-r from-blue-400 to-indigo-500",
    },
  ];

  const categoryIcons: Record<string, string> = {
    "Men's Tops": "👕",
    "Women's Tops": "👚",
    "Men's Bottoms": "👖",
    "Women's Bottoms": "👗",
    Outerwear: "🧥",
    Accessories: "👜",
    Footwear: "👟",
    Bags: "🎒",
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    updateActiveFilters();
  }, [products, searchTerm, categoryFilter, conditionFilter, sortBy]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (conditionFilter !== "all") {
      filtered = filtered.filter((p) => p.condition === conditionFilter);
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    setFilteredProducts(filtered);
  };

  const updateActiveFilters = () => {
    const filters: string[] = [];
    if (categoryFilter !== "all") filters.push(`Category: ${categoryFilter}`);
    if (conditionFilter !== "all")
      filters.push(`Condition: ${conditionFilter}`);
    if (sortBy !== "newest") {
      const sortLabel =
        sortBy === "price-low"
          ? "Price: Low → High"
          : sortBy === "price-high"
          ? "Price: High → Low"
          : "Highest Rated";
      filters.push(sortLabel);
    }
    setActiveFilters(filters);
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Category:")) setCategoryFilter("all");
    else if (filter.startsWith("Condition:")) setConditionFilter("all");
    else setSortBy("newest");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setConditionFilter("all");
    setSortBy("newest");
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const conditions = ["New", "Like New", "Used", "Fair"];

  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );

  const visibleProducts = filteredProducts.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentBanner === index ? "opacity-100" : "opacity-0"
            } ${banner.bg}`}
            style={{ zIndex: currentBanner === index ? 1 : 0 }}
          >
            <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
                {banner.title}
              </h2>
              <p className="text-xl md:text-2xl text-white/90 drop-shadow">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
        <div className="relative" style={{ paddingTop: "200px", zIndex: 2 }} />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentBanner === index ? "bg-white w-6" : "bg-white/50"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vintage finds, brands, styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 md:h-14 pl-12 pr-4 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base md:text-lg transition-colors"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-sm transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Filters
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setCategoryFilter(
                    category === categoryFilter ? "all" : category
                  )
                }
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  categoryFilter === category
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white border border-gray-300 hover:border-gray-400"
                }`}
              >
                {categoryIcons[category] || "📦"} {category}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="max-w-7xl mx-auto px-4 pb-4 animate-in slide-in-from-top">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setConditionFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      conditionFilter === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    All
                  </button>
                  {conditions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() =>
                        setConditionFilter(
                          condition === conditionFilter ? "all" : condition
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        conditionFilter === condition
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "newest", label: "Newest" },
                    { value: "price-low", label: "Price ↑" },
                    { value: "price-high", label: "Price ↓" },
                    { value: "rating", label: "Top Rated" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        sortBy === option.value
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "item" : "items"} found
            </h2>
            {searchTerm && (
              <p className="text-gray-600 text-sm mt-1">
                Searching for &quot;{searchTerm}&quot;
              </p>
            )}
          </div>

          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => removeFilter(filter)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                {filter}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(20)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your filters or search terms
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-white border border-gray-300 rounded-full font-medium hover:border-gray-400 transition-colors"
              >
                Browse All
              </button>
            </div>

            {categories.length > 0 && (
              <div className="mt-8">
                <p className="text-gray-600 mb-4">Try these categories:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setCategoryFilter(category);
                        setSearchTerm("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                    >
                      {categoryIcons[category] || "📦"} {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {visibleProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-in fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {displayCount < filteredProducts.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 20)}
                  className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Load More ({filteredProducts.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
