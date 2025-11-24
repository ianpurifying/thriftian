// src/components/admin/DashboardOverview.tsx
import { Product, User, Order, Report } from "@/lib/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardOverviewProps {
  products: Product[];
  pendingProducts: Product[];
  users: User[];
  orders: Order[];
  reports: Report[];
}

export default function DashboardOverview({
  products,
  pendingProducts,
  users,
  orders,
  reports,
}: DashboardOverviewProps) {
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeUsers = users.filter((u) => u.verified).length;
  const pendingActions =
    pendingProducts.length +
    reports.filter((r) => r.status === "pending").length;
  const recentOrders = orders.filter((o) => {
    const daysSince =
      (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }).length;

  const topSellers = users
    .filter((u) => u.role === "seller")
    .map((seller) => {
      const sellerOrders = orders.filter(
        (o) => o.sellerId === seller.id && o.status === "delivered"
      );
      const revenue = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { name: seller.name, revenue, orders: sellerOrders.length };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topBuyers = users
    .filter((u) => u.role === "buyer")
    .map((buyer) => {
      const buyerOrders = orders.filter((o) => o.buyerId === buyer.id);
      const spent = buyerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return { name: buyer.name, spent, orders: buyerOrders.length };
    })
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const ordersByStatus = [
    {
      name: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      color: "#FCD34D",
    },
    {
      name: "Confirmed",
      value: orders.filter((o) => o.status === "confirmed").length,
      color: "#60A5FA",
    },
    {
      name: "Shipped",
      value: orders.filter((o) => o.status === "shipped").length,
      color: "#A78BFA",
    },
    {
      name: "Delivered",
      value: orders.filter((o) => o.status === "delivered").length,
      color: "#34D399",
    },
    {
      name: "Cancelled",
      value: orders.filter((o) => o.status === "cancelled").length,
      color: "#F87171",
    },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const revenueData = last7Days.map((date) => {
    const dayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
      return orderDate === date && o.status === "delivered";
    });
    const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue,
    };
  });

  const categoryData = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const criticalAlerts = [
    ...(pendingProducts.length > 10
      ? [
          {
            message: `${pendingProducts.length} products pending approval`,
            severity: "high" as const,
          },
        ]
      : []),
    ...(reports.filter((r) => r.status === "pending").length > 5
      ? [
          {
            message: `${
              reports.filter((r) => r.status === "pending").length
            } unresolved reports`,
            severity: "high" as const,
          },
        ]
      : []),
    ...(orders.filter((o) => o.status === "pending").length > 20
      ? [
          {
            message: `${
              orders.filter((o) => o.status === "pending").length
            } pending orders`,
            severity: "medium" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon="💰"
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Pending Actions"
          value={pendingActions.toString()}
          icon="⚠️"
          highlight={pendingActions > 0}
        />
        <StatCard
          title="Active Users"
          value={activeUsers.toString()}
          icon="👥"
          trend="+8.2%"
          trendUp={true}
        />
        <StatCard
          title="Orders (7d)"
          value={recentOrders.toString()}
          icon="📦"
          trend="+15.3%"
          trendUp={true}
        />
      </div>

      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">
            Critical Alerts
          </h3>
          <div className="space-y-1">
            {criticalAlerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-red-700"
              >
                <span
                  className={
                    alert.severity === "high"
                      ? "text-red-600"
                      : "text-orange-600"
                  }
                >
                  {alert.severity === "high" ? "🔴" : "🟠"}
                </span>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue (Last 7 Days)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders by Status">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Sellers">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topSellers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Products by Category">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Buyers
          </h3>
          <div className="space-y-3">
            {topBuyers.map((buyer, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{buyer.name}</p>
                  <p className="text-sm text-gray-500">{buyer.orders} orders</p>
                </div>
                <p className="font-semibold text-gray-900">
                  ₱{buyer.spent.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Order #{order.id.substring(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  highlight,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border p-6 ${
        highlight ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p
        className={`text-3xl font-bold mb-1 ${
          highlight ? "text-red-900" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      {trend && (
        <p className={`text-sm ${trendUp ? "text-green-600" : "text-red-600"}`}>
          {trendUp ? "↑" : "↓"} {trend} from last period
        </p>
      )}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
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
