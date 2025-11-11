// lib/types/index.ts
export type UserRole = "buyer" | "seller" | "admin";

export interface Address {
  street: string;
  city: string;
  province: string;
  zip: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  verified: boolean;
  phone: string | null;
  address: Address;
  createdAt: Date;
  updatedAt: Date;
  wishlist: string[];
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export type ProductCondition = "New" | "Like New" | "Used" | "Fair";
export type ProductStatus = "pending" | "approved" | "rejected" | "soldout";

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  brand: string | null;
  category: string;
  size: string | null;
  condition: ProductCondition;
  price: number;
  stock: number;
  images: ProductImage[];
  status: ProductStatus;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "Cash on Delivery";
  status: OrderStatus;
  trackingNumber: string | null;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export type NotificationType = "order" | "system" | "listing" | "dispute";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export interface Analytics {
  sellerId: string;
  totalSales: number;
  totalOrders: number;
  topProducts: string[];
  lastUpdated: Date;
}

export type DisputeStatus = "open" | "resolved" | "rejected";

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  status: DisputeStatus;
  adminId: string | null;
  resolutionNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportType = "user" | "product" | "order";
export type ReportStatus = "pending" | "reviewed" | "dismissed";

export interface Report {
  id: string;
  type: ReportType;
  targetId: string;
  reportedBy: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  metadata: {
    targetId: string | null;
    details: string | null;
  };
}
