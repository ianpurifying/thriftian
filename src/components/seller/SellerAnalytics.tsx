// src/components/seller/SellerAnalytics.tsx
"use client";

import { useEffect, useState } from "react";
import { Order } from "@/lib/types";

interface AnalyticsData {
  sales: number;
  quantity: number;
  orders: number;
}

interface TimeRangeAnalytics {
  today: AnalyticsData;
  yesterday: AnalyticsData;
  thisWeek: AnalyticsData;
  lastWeek: AnalyticsData;
  thisMonth: AnalyticsData;
  lastMonth: AnalyticsData;
  thisYear: AnalyticsData;
  lastYear: AnalyticsData;
  allTime: AnalyticsData;
}

interface SellerAnalyticsProps {
  orders: Order[];
  sellerName?: string;
}

export default function SellerAnalytics({ orders }: SellerAnalyticsProps) {
  const [analytics, setAnalytics] = useState<TimeRangeAnalytics>({
    today: { sales: 0, quantity: 0, orders: 0 },
    yesterday: { sales: 0, quantity: 0, orders: 0 },
    thisWeek: { sales: 0, quantity: 0, orders: 0 },
    lastWeek: { sales: 0, quantity: 0, orders: 0 },
    thisMonth: { sales: 0, quantity: 0, orders: 0 },
    lastMonth: { sales: 0, quantity: 0, orders: 0 },
    thisYear: { sales: 0, quantity: 0, orders: 0 },
    lastYear: { sales: 0, quantity: 0, orders: 0 },
    allTime: { sales: 0, quantity: 0, orders: 0 },
  });

  const [exportingPeriod, setExportingPeriod] = useState<string | null>(null);

  useEffect(() => {
    calculateAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const calculateAnalytics = () => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Week calculation (Monday start)
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() + mondayOffset);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    // Month calculation
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // Year calculation
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(
      now.getFullYear() - 1,
      11,
      31,
      23,
      59,
      59,
      999
    );

    const filterOrders = (startDate: Date, endDate?: Date): AnalyticsData => {
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        if (endDate) {
          return orderDate >= startDate && orderDate < endDate;
        }
        return orderDate >= startDate;
      });

      const sales = filtered.reduce((sum, order) => sum + order.totalAmount, 0);
      const quantity = filtered.reduce(
        (sum, order) =>
          sum +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0
      );

      return {
        sales,
        quantity,
        orders: filtered.length,
      };
    };

    setAnalytics({
      today: filterOrders(todayStart),
      yesterday: filterOrders(yesterdayStart, todayStart),
      thisWeek: filterOrders(thisWeekStart),
      lastWeek: filterOrders(lastWeekStart, lastWeekEnd),
      thisMonth: filterOrders(thisMonthStart),
      lastMonth: filterOrders(lastMonthStart, lastMonthEnd),
      thisYear: filterOrders(thisYearStart),
      lastYear: filterOrders(lastYearStart, lastYearEnd),
      allTime: filterOrders(new Date(0)),
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getOrdersForPeriod = (period: keyof TimeRangeAnalytics): Order[] => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    let startDate: Date;
    let endDate: Date | undefined;

    switch (period) {
      case "today":
        startDate = todayStart;
        break;
      case "yesterday":
        startDate = new Date(todayStart);
        startDate.setDate(startDate.getDate() - 1);
        endDate = todayStart;
        break;
      case "thisWeek": {
        const currentDay = now.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        startDate = new Date(todayStart);
        startDate.setDate(startDate.getDate() + mondayOffset);
        break;
      }
      case "lastWeek": {
        const thisWeekStart = new Date(todayStart);
        const currentDay2 = now.getDay();
        const mondayOffset2 = currentDay2 === 0 ? -6 : 1 - currentDay2;
        thisWeekStart.setDate(thisWeekStart.getDate() + mondayOffset2);
        startDate = new Date(thisWeekStart);
        startDate.setDate(startDate.getDate() - 7);
        endDate = thisWeekStart;
        break;
      }
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "lastYear":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
      case "allTime":
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(0);
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (endDate) {
        return orderDate >= startDate && orderDate < endDate;
      }
      return orderDate >= startDate;
    });
  };

  const exportPDF = async (
    period: keyof TimeRangeAnalytics,
    periodLabel: string
  ) => {
    setExportingPeriod(period);

    try {
      const periodOrders = getOrdersForPeriod(period);
      const data = analytics[period];

      // Dynamically import jsPDF and autoTable
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Report", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: ${periodLabel}`, pageWidth / 2, 28, {
        align: "center",
      });
      yPos = 50;

      // Summary Cards
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, yPos);
      yPos += 10;

      const cardWidth = (pageWidth - 42) / 3;
      const cardHeight = 25;
      const summaryData = [
        {
          label: "Total Sales",
          value: formatCurrency(data.sales),
          color: [79, 70, 229],
        },
        {
          label: "Items Sold",
          value: data.quantity.toLocaleString(),
          color: [124, 58, 237],
        },
        {
          label: "Total Orders",
          value: data.orders.toLocaleString(),
          color: [219, 39, 119],
        },
      ];

      summaryData.forEach((item, index) => {
        const xPos = 14 + index * (cardWidth + 7);

        // Card background
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "F");

        // Colored left border
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.rect(xPos, yPos, 3, cardHeight, "F");

        // Text
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(item.label, xPos + 6, yPos + 8);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(31, 41, 55);
        doc.text(item.value, xPos + 6, yPos + 18);
      });

      yPos += cardHeight + 15;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Order Details Table
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Order Details", 14, yPos);
      yPos += 5;

      if (periodOrders.length > 0) {
        const tableData = periodOrders.map((order) => {
          const productNames = order.items
            .map((item) => `${item.title} (x${item.quantity})`)
            .join(", ");
          const totalItems = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return [
            `#${order.id.substring(0, 8)}`,
            new Date(order.createdAt).toLocaleDateString("en-US"),
            order.buyerName,
            productNames.length > 40
              ? productNames.substring(0, 40) + "..."
              : productNames,
            totalItems.toString(),
            formatCurrency(order.totalAmount),
            order.status.toUpperCase(),
          ];
        });

        // Use autoTable with proper typing
        autoTable(doc, {
          startY: yPos,
          head: [
            [
              "Order ID",
              "Date",
              "Customer",
              "Products",
              "Items",
              "Amount",
              "Status",
            ],
          ],
          body: tableData,
          theme: "striped",
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: "bold",
            halign: "left",
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251],
          },
          columnStyles: {
            0: { cellWidth: 20, fontStyle: "bold" },
            1: { cellWidth: 22 },
            2: { cellWidth: 28 },
            3: { cellWidth: 45 },
            4: { cellWidth: 15, halign: "center" },
            5: { cellWidth: 25, halign: "right", fontStyle: "bold" },
            6: { cellWidth: 20, halign: "center" },
          },
          margin: { left: 14, right: 14 },
          didDrawPage: () => {
            // Footer on each page
            const footerY = pageHeight - 15;
            doc.setFontSize(8);
            doc.setTextColor(107, 114, 128);
            doc.text(
              "This is an automatically generated report from your seller dashboard.",
              pageWidth / 2,
              footerY,
              { align: "center" }
            );
            doc.text(
              `Generated: ${new Date().toLocaleString("en-US", {
                dateStyle: "full",
                timeStyle: "short",
              })}`,
              pageWidth / 2,
              footerY + 4,
              { align: "center" }
            );
          },
        });
      } else {
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(107, 114, 128);
        doc.text("No orders found for this period.", pageWidth / 2, yPos, {
          align: "center",
        });
      }

      // Save the PDF
      const fileName = `Sales_Report_${periodLabel.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);

      // Also open print preview in new window
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, "_blank");

      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }

      // Clean up after 5 seconds
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 5000);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert(
        "Failed to export PDF report. Please make sure jsPDF library is installed."
      );
    } finally {
      setExportingPeriod(null);
    }
  };

  const AnalyticsCard = ({
    title,
    data,
    icon,
    period,
  }: {
    title: string;
    data: AnalyticsData;
    icon: React.ReactNode;
    period: keyof TimeRangeAnalytics;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.sales)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Items Sold</p>
            <p className="text-lg font-semibold text-gray-900">
              {data.quantity}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Orders</p>
            <p className="text-lg font-semibold text-gray-900">{data.orders}</p>
          </div>
        </div>
        <button
          onClick={() => exportPDF(period, title)}
          disabled={exportingPeriod === period}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          {exportingPeriod === period ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const CalendarIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <div className="space-y-8">
      {/* Daily Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Daily Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCard
            title="Today"
            data={analytics.today}
            icon={<CalendarIcon />}
            period="today"
          />
          <AnalyticsCard
            title="Yesterday"
            data={analytics.yesterday}
            icon={<CalendarIcon />}
            period="yesterday"
          />
        </div>
      </div>

      {/* Weekly Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Weekly Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCard
            title="This Week"
            data={analytics.thisWeek}
            icon={<CalendarIcon />}
            period="thisWeek"
          />
          <AnalyticsCard
            title="Last Week"
            data={analytics.lastWeek}
            icon={<CalendarIcon />}
            period="lastWeek"
          />
        </div>
      </div>

      {/* Monthly Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Monthly Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCard
            title="This Month"
            data={analytics.thisMonth}
            icon={<CalendarIcon />}
            period="thisMonth"
          />
          <AnalyticsCard
            title="Last Month"
            data={analytics.lastMonth}
            icon={<CalendarIcon />}
            period="lastMonth"
          />
        </div>
      </div>

      {/* Yearly Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Yearly Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalyticsCard
            title="This Year"
            data={analytics.thisYear}
            icon={<CalendarIcon />}
            period="thisYear"
          />
          <AnalyticsCard
            title="Last Year"
            data={analytics.lastYear}
            icon={<CalendarIcon />}
            period="lastYear"
          />
        </div>
      </div>

      {/* All Time Analytics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Time Performance
        </h2>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">All Time</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Total Sales
              </p>
              <p className="text-3xl font-bold text-indigo-600">
                {formatCurrency(analytics.allTime.sales)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Total Items Sold
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.allTime.quantity}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-pink-600">
                {analytics.allTime.orders}
              </p>
            </div>
          </div>
          <button
            onClick={() => exportPDF("allTime", "All Time")}
            disabled={exportingPeriod === "allTime"}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            {exportingPeriod === "allTime" ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Exporting All Time Report...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export All Time PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Analytics Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Sold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(analytics).map(([period, data]) => (
                <tr key={period} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 capitalize">
                    {period.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(data.sales)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {data.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {data.orders}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(
                      data.orders > 0 ? data.sales / data.orders : 0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
