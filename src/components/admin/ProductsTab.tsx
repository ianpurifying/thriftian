// src/components/admin/ProductsTab.tsx
import { useState, useMemo } from "react";
import { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ProductDetailModal from "./ProductDetailModal";
import RejectModal from "./RejectModal";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";

interface ProductsTabProps {
  products: Product[];
  allProducts: Product[];
  onRefresh: () => void;
}

export default function ProductsTab({
  products,
  allProducts,
  onRefresh,
}: ProductsTabProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectingProduct, setRejectingProduct] = useState<Product | null>(
    null
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const displayProducts = statusFilter === "pending" ? products : allProducts;

  const categories = Array.from(new Set(allProducts.map((p) => p.category)));
  const conditions = ["New", "Like New", "Used", "Fair"];

  const filteredProducts = useMemo(() => {
    const filtered = displayProducts.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesCondition =
        conditionFilter === "all" || product.condition === conditionFilter;

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesCondition
      );
    });

    filtered.sort((a, b) => {
      const getComparableValue = (val: unknown): string | number => {
        if (val === null || val === undefined) return "";
        if (typeof val === "string" || typeof val === "number") return val;
        if (val instanceof Date) return val.getTime();
        return String(val);
      };

      const aVal = a[sortBy as keyof Product];
      const bVal = b[sortBy as keyof Product];

      const aComparable = getComparableValue(aVal);
      const bComparable = getComparableValue(bVal);

      if (aComparable < bComparable) return sortOrder === "asc" ? -1 : 1;
      if (aComparable > bComparable) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    displayProducts,
    searchTerm,
    statusFilter,
    categoryFilter,
    conditionFilter,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleApprove = async (productId: string) => {
    if (!firebaseUser) return;
    setLoadingAction(productId);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${productId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast("Product approved successfully", "success");
        onRefresh();
        selectedProducts.delete(productId);
        setSelectedProducts(new Set(selectedProducts));
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to approve product", "error");
      }
    } catch {
      showToast("Failed to approve product", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (productId: string, reason: string) => {
    if (!firebaseUser) return;
    setLoadingAction(productId);

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
        showToast("Product rejected successfully", "success");
        onRefresh();
        setRejectingProduct(null);
        selectedProducts.delete(productId);
        setSelectedProducts(new Set(selectedProducts));
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to reject product", "error");
      }
    } catch {
      showToast("Failed to reject product", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProducts.size === 0) return;
    setLoadingAction("bulk");

    for (const productId of selectedProducts) {
      await handleApprove(productId);
    }

    setSelectedProducts(new Set());
    setLoadingAction(null);
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="soldout">Sold Out</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => {
              setConditionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Conditions</option>
            {conditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>

        {selectedProducts.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.size} product(s) selected
            </span>
            <button
              onClick={handleBulkApprove}
              disabled={loadingAction === "bulk"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loadingAction === "bulk" ? "Processing..." : "Bulk Approve"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.size === paginatedProducts.length &&
                      paginatedProducts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Image
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortBy === "title") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("title");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Product{" "}
                  {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Condition
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortBy === "price") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("price");
                      setSortOrder("desc");
                    }
                  }}
                >
                  Price{" "}
                  {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    if (sortBy === "createdAt") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("createdAt");
                      setSortOrder("desc");
                    }
                  }}
                >
                  Date{" "}
                  {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-left hover:underline"
                    >
                      <p className="font-medium text-gray-900">
                        {product.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.sellerName}
                      </p>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {product.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₱{product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {product.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(product.id)}
                            disabled={loadingAction === product.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                          >
                            {loadingAction === product.id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => setRejectingProduct(product)}
                            disabled={loadingAction === product.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found matching your filters
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Previous
          </button>
          <span className="px-4 py-1.5 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onApprove={handleApprove}
          onReject={(reason) => handleReject(selectedProduct.id, reason)}
          loading={loadingAction === selectedProduct.id}
        />
      )}

      {rejectingProduct && (
        <RejectModal
          title="Reject Product"
          message={`Are you sure you want to reject "${rejectingProduct.title}"?`}
          onConfirm={(reason) => handleReject(rejectingProduct.id, reason)}
          onCancel={() => setRejectingProduct(null)}
          loading={loadingAction === rejectingProduct.id}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={onRefresh}
        />
      )}

      {deletingProduct && (
        <DeleteProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    soldout: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
