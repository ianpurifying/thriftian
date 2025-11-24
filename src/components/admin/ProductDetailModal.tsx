// src/components/admin/ProductDetailModal.tsx
import { Product } from "@/lib/types";
import { useState } from "react";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onApprove: (productId: string) => void;
  onReject: (reason: string) => void;
  loading: boolean;
}

export default function ProductDetailModal({
  product,
  onClose,
  onApprove,
  onReject,
  loading,
}: ProductDetailModalProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const handleReject = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      setRejectError("Rejection reason must be at least 10 characters");
      return;
    }
    onReject(rejectReason);
    setShowRejectInput(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images[currentImage] ? (
                  <img
                    src={product.images[currentImage].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImage === i
                          ? "border-gray-900"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {product.title}
              </h3>
              <p className="text-gray-600 mb-4">by {product.sellerName}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₱{product.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Condition</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium text-gray-700">
                    {product.condition}
                  </span>
                </div>

                {product.brand && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium text-gray-900">
                      {product.brand}
                    </span>
                  </div>
                )}

                {product.size && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium text-gray-900">
                      {product.size}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Stock</span>
                  <span className="font-medium text-gray-900">
                    {product.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge status={product.status} />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(product.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Rating</span>
                  <span className="text-gray-900">
                    ⭐ {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                    reviews)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Quality Indicators
                </h4>
                <div className="space-y-2">
                  <QualityIndicator
                    label="Images"
                    value={product.images.length}
                    good={product.images.length >= 3}
                  />
                  <QualityIndicator
                    label="Description Length"
                    value={product.description.length}
                    good={product.description.length >= 50}
                  />
                  <QualityIndicator
                    label="Has Brand"
                    value={product.brand ? "Yes" : "No"}
                    good={!!product.brand}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {product.status === "pending" && !showRejectInput && (
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(product.id)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? "Processing..." : "Approve Product"}
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                Reject Product
              </button>
            </div>
          )}

          {showRejectInput && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">
                Rejection Reason
              </h4>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError("");
                }}
                placeholder="Please provide a detailed reason for rejection..."
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                rows={4}
              />
              {rejectError && (
                <p className="text-sm text-red-600 mb-2">{rejectError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Processing..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectReason("");
                    setRejectError("");
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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

function QualityIndicator({
  label,
  value,
  good,
}: {
  label: string;
  value: string | number;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span
        className={`font-medium ${good ? "text-green-600" : "text-red-600"}`}
      >
        {good ? "✓" : "✗"} {value}
      </span>
    </div>
  );
}
