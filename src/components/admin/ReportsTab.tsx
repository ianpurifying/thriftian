// src/components/admin/ReportsTab.tsx
import { useState, useMemo } from "react";
import { Report } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import ReportDetailModal from "./ReportDetailModal";

interface ReportsTabProps {
  reports: Report[];
  onRefresh: () => void;
}

export default function ReportsTab({ reports, onRefresh }: ReportsTabProps) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(
    new Set()
  );
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || report.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      const getComparableValue = (val: unknown): string | number => {
        if (val === null || val === undefined) return "";
        if (typeof val === "string" || typeof val === "number") return val;
        if (val instanceof Date) return val.getTime();
        return String(val);
      };

      const aVal = a[sortBy as keyof Report];
      const bVal = b[sortBy as keyof Report];

      const aComparable = getComparableValue(aVal);
      const bComparable = getComparableValue(bVal);

      if (aComparable < bComparable) return sortOrder === "asc" ? -1 : 1;
      if (aComparable > bComparable) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [reports, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleUpdateStatus = async (
    reportId: string,
    newStatus: string,
    notes?: string
  ) => {
    if (!firebaseUser) return;
    setLoadingAction(reportId);

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (response.ok) {
        showToast("Report status updated successfully", "success");
        onRefresh();
        selectedReports.delete(reportId);
        setSelectedReports(new Set(selectedReports));
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to update report status", "error");
      }
    } catch {
      showToast("Failed to update report status", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBulkDismiss = async () => {
    if (selectedReports.size === 0) return;
    setLoadingAction("bulk");

    for (const reportId of selectedReports) {
      await handleUpdateStatus(reportId, "dismissed");
    }

    setSelectedReports(new Set());
    setLoadingAction(null);
  };

  const toggleSelectReport = (reportId: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(reportId)) {
      newSelected.delete(reportId);
    } else {
      newSelected.add(reportId);
    }
    setSelectedReports(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === paginatedReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(paginatedReports.map((r) => r.id)));
    }
  };

  const reportStats = {
    pending: reports.filter((r) => r.status === "pending").length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Pending" value={reportStats.pending} color="red" />
        <StatCard label="Reviewed" value={reportStats.reviewed} color="blue" />
        <StatCard
          label="Dismissed"
          value={reportStats.dismissed}
          color="gray"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Types</option>
            <option value="user">User</option>
            <option value="product">Product</option>
            <option value="order">Order</option>
          </select>

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
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {selectedReports.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedReports.size} report(s) selected
            </span>
            <button
              onClick={handleBulkDismiss}
              disabled={loadingAction === "bulk"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {loadingAction === "bulk" ? "Processing..." : "Bulk Dismiss"}
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
                      selectedReports.size === paginatedReports.length &&
                      paginatedReports.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Target ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Reporter
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
              {paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.has(report.id)}
                      onChange={() => toggleSelectReport(report.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={report.type} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600">
                      {report.targetId.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 truncate max-w-xs">
                      {report.reason}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600">
                      {report.reportedBy.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
                      >
                        View
                      </button>
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(report.id, "reviewed")
                            }
                            disabled={loadingAction === report.id}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                          >
                            Review
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(report.id, "dismissed")
                            }
                            disabled={loadingAction === report.id}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No reports found matching your filters
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredReports.length)} of{" "}
            {filteredReports.length}
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

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onRefresh={onRefresh}
        />
      )}
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
      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
      }`}
    >
      {type}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: "red" | "blue" | "gray";
}

function StatCard({ label, value, color }: StatCardProps) {
  const colors = {
    red: "bg-red-50 border-red-200 text-red-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    gray: "bg-gray-50 border-gray-200 text-gray-900",
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
