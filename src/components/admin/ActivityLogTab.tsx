// src/components/admin/ActivityLogTab.tsx
import { useState, useEffect, useMemo } from "react";
import { AuditLog } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";

export default function ActivityLogTab() {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        showToast("Failed to load activity logs", "error");
      }
    } catch {
      showToast("Failed to load activity logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const filtered = logs.filter((log) => {
      const matchesSearch =
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.metadata.targetId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        log.metadata.details?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        const daysDiff =
          (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dateFilter === "today") matchesDate = daysDiff < 1;
        else if (dateFilter === "week") matchesDate = daysDiff < 7;
        else if (dateFilter === "month") matchesDate = daysDiff < 30;
      }

      return matchesSearch && matchesAction && matchesDate;
    });

    filtered.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });

    return filtered;
  }, [logs, searchTerm, actionFilter, dateFilter, sortOrder]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const actionTypes = Array.from(new Set(logs.map((log) => log.action)));

  const handleExport = () => {
    const csv = [
      ["Timestamp", "User ID", "Action", "Target ID", "Details"].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.userId,
          log.action,
          log.metadata.targetId || "",
          log.metadata.details || "",
        ]
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("Activity logs exported successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium whitespace-nowrap"
          >
            Export CSV
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""}{" "}
            found
          </p>
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="text-sm text-blue-600 hover:underline"
          >
            Sort {sortOrder === "desc" ? "Oldest First" : "Newest First"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600">
                      {log.userId.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-4 py-3">
                    {log.metadata.targetId ? (
                      <span className="font-mono text-xs text-gray-600">
                        {log.metadata.targetId.substring(0, 8)}...
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.metadata.details ? (
                      <span className="text-sm text-gray-900 truncate max-w-xs inline-block">
                        {log.metadata.details}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No activity logs found matching your filters
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredLogs.length)} of{" "}
            {filteredLogs.length}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
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
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const getColor = (action: string) => {
    if (action.includes("approve")) return "bg-green-100 text-green-800";
    if (action.includes("reject")) return "bg-red-100 text-red-800";
    if (action.includes("suspend") || action.includes("ban"))
      return "bg-red-100 text-red-800";
    if (action.includes("update") || action.includes("change"))
      return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${getColor(action)}`}
    >
      {action}
    </span>
  );
}
