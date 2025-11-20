"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Loading from "@/components/Loading";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, conditionFilter, sortBy]);

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

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];
  const conditions = ["all", "New", "Like New", "Used", "Fair"];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-5xl md:text-6xl font-rye text-amber-900 mb-2 retro-text-shadow text-center typewriter inline-block">
        Browse Our Collection
      </h1>
      <p className="text-center text-teal-700 font-pacifico text-xl mb-8">
        ~ Vintage Finds & Pre-Loved Gems ~
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search treasures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select
          value={categoryFilter}
          onChange={(value) => setCategoryFilter(value)}
          options={categories.map((c) => ({
            value: c,
            label: c === "all" ? "All Categories" : c,
          }))}
        />

        <Select
          value={conditionFilter}
          onChange={(value) => setConditionFilter(value)}
          options={conditions.map((c) => ({
            value: c,
            label: c === "all" ? "All Conditions" : c,
          }))}
        />

        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value)}
          options={[
            { value: "newest", label: "Newest First" },
            { value: "price-low", label: "Price: Low to High" },
            { value: "price-high", label: "Price: High to Low" },
            { value: "rating", label: "Highest Rated" },
          ]}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl font-pacifico text-amber-800 mb-2">
            No treasures found
          </p>
          <p className="text-gray-600 font-nunito">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
