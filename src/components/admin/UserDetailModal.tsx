// src/components/admin/UserDetailModal.tsx
import { useState } from "react";
import { User } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onRefresh: () => void;
}

export default function UserDetailModal({
  user,
  onClose,
  onRefresh,
}: UserDetailModalProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuspendInput, setShowSuspendInput] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const handleChangeRole = async (newRole: string) => {
    if (!firebaseUser) return;
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        showToast("User role updated successfully", "success");
        onRefresh();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update user role", "error");
      }
    } catch {
      showToast("Failed to update user role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!firebaseUser) return;
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/users/${user.id}/verification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verified: !user.verified }),
      });

      if (response.ok) {
        showToast(
          `User ${user.verified ? "unverified" : "verified"} successfully`,
          "success"
        );
        onRefresh();
      } else {
        const error = await response.json();
        showToast(
          error.message || "Failed to update verification status",
          "error"
        );
      }
    } catch {
      showToast("Failed to update verification status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim() || suspendReason.trim().length < 10) {
      showToast("Suspension reason must be at least 10 characters", "error");
      return;
    }

    if (!firebaseUser) return;
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/users/${user.id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: suspendReason }),
      });

      if (response.ok) {
        showToast("User suspended successfully", "success");
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to suspend user", "error");
      }
    } catch {
      showToast("Failed to suspend user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
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

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <RoleBadge role={user.role} />
                {user.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">User ID</p>
              <p className="font-mono text-sm text-gray-900">{user.id}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Phone</p>
              <p className="text-sm text-gray-900">
                {user.phone || "Not provided"}
              </p>
            </div>
          </div>

          {user.address && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{user.address.street}</p>
                <p className="text-sm text-gray-900">
                  {user.address.city}, {user.address.province}{" "}
                  {user.address.zip}
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Account Timeline
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-600">Created:</span>{" "}
                <span className="text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-600">Last Updated:</span>{" "}
                <span className="text-gray-900">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Wishlist</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">
                {user.wishlist.length} item
                {user.wishlist.length !== 1 ? "s" : ""} in wishlist
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Account Management
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">User Role</p>
                  <p className="text-sm text-gray-500">
                    Change user permissions
                  </p>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => handleChangeRole(e.target.value)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    Verification Status
                  </p>
                  <p className="text-sm text-gray-500">
                    Toggle user verification
                  </p>
                </div>
                <button
                  onClick={handleToggleVerification}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                    user.verified
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {user.verified ? "Unverify" : "Verify"}
                </button>
              </div>
            </div>
          </div>

          {!showSuspendInput ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendInput(true)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                Suspend User
              </button>
              <button
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
              >
                Send Notification
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Suspend User</h4>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Please provide a reason for suspension..."
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSuspend}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Processing..." : "Confirm Suspension"}
                </button>
                <button
                  onClick={() => {
                    setShowSuspendInput(false);
                    setSuspendReason("");
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

function RoleBadge({ role }: { role: string }) {
  const colors = {
    buyer: "bg-blue-100 text-blue-800",
    seller: "bg-purple-100 text-purple-800",
    admin: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {role}
    </span>
  );
}
