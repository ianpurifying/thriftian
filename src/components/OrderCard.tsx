import Link from "next/link";
import { Order } from "@/lib/types";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-200 text-yellow-900 border-yellow-600",
    confirmed: "bg-blue-200 text-blue-900 border-blue-600",
    shipped: "bg-purple-200 text-purple-900 border-purple-600",
    delivered: "bg-green-200 text-green-900 border-green-600",
    cancelled: "bg-red-200 text-red-900 border-red-600",
  };

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="border-4 border-amber-800 rounded-lg p-6 hover:shadow-xl transition-all bg-cream retro-shadow-hover">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-rye text-xl text-amber-900">
              Order #{order.id}
            </h3>
            <p className="text-sm text-gray-600 font-nunito mt-1">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-lg text-sm font-nunito font-bold border-2 uppercase ${
              statusColors[order.status]
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 bg-amber-50 p-3 rounded-lg border-2 border-amber-300"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 border-2 border-amber-700">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-nunito font-bold text-amber-900 truncate">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600 font-nunito">
                  ₱{item.price} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2 border-amber-700">
          <p className="text-sm text-gray-600 font-nunito font-semibold">
            Total Amount
          </p>
          <p className="text-2xl font-rye text-amber-900">
            ₱{order.totalAmount.toFixed(2)}
          </p>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t-2 border-amber-700 bg-teal-50 p-3 rounded-lg">
            <p className="text-sm text-teal-900 font-nunito">
              📦 Tracking:{" "}
              <span className="font-bold">{order.trackingNumber}</span>
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
