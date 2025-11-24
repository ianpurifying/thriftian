// src/components/admin/ReportDetailModal.tsx
import { useState } from "react";
import { Report } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ReportDetailModal({
  report,
  onClose,
  onRefresh,
}: ReportDetailModalProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");

  const handleUpdateStatus = async (newStatus: string) => {
    if (!firebaseUser) return;
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/reports/${report.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes, severity }),
      });

      if (response.ok) {
        showToast("Report status updated successfully", "success");
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update report status", "error");
      }
    } catch {
      showToast("Failed to update report status", "error");
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
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
            <p className="text-sm text-gray-500 font-mono">
              #{report.id.substring(0, 16)}
            </p>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Report Type
              </p>
              <TypeBadge type={report.type} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <StatusBadge status={report.status} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Reported Content
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium text-gray-600">Target ID:</span>{" "}
                <span className="font-mono text-gray-900">
                  {report.targetId}
                </span>
              </p>
              <a
                href={`/${report.type}s/${report.targetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View {report.type} →
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Reporter Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium text-gray-600">User ID:</span>{" "}
                <span className="font-mono text-gray-900">
                  {report.reportedBy}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Reason</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {report.reason}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-600">Reported:</span>{" "}
                <span className="text-gray-900">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {report.status === "pending" && (
            <>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Severity Assessment
                </h3>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as "low" | "medium" | "high")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="low">
                    Low - Minor issue, no immediate action needed
                  </option>
                  <option value="medium">Medium - Requires attention</option>
                  <option value="high">
                    High - Urgent, requires immediate action
                  </option>
                </select>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Admin Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your investigation or actions taken..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus("reviewed")}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Processing..." : "Mark as Reviewed & Take Action"}
                </button>
                <button
                  onClick={() => handleUpdateStatus("dismissed")}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Processing..." : "Dismiss Report"}
                </button>
              </div>
            </>
          )}

          {report.status !== "pending" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                This report has been {report.status}. No further action is
                required.
              </p>
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
    reviewed: "bg-blue-100 text-blue-800",
    dismissed: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
        colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors = {
    user: "bg-purple-100 text-purple-800",
    product: "bg-green-100 text-green-800",
    order: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded text-sm font-medium ${
        colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {type}
    </span>
  );
}
