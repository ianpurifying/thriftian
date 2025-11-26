// src/components/admin/DeleteProductModal.tsx
import { useState } from "react";
import { Product } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

interface DeleteProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProductModal({
  product,
  onClose,
  onSuccess,
}: DeleteProductModalProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (!firebaseUser || confirmText !== "DELETE") return;

    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/products/${product.id}/admin-delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast("Product deleted successfully", "success");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to delete product", "error");
      }
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Delete Product</h2>
            <p className="text-sm text-gray-500">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            You are about to permanently delete:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="font-semibold text-gray-900">{product.title}</p>
            <p className="text-sm text-gray-600">By {product.sellerName}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-bold text-red-600">DELETE</span> to
            confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="DELETE"
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> This will permanently delete the product,
            and all associated images.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== "DELETE"}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Deleting..." : "Delete Product"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
