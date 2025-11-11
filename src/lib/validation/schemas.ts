// lib/validation/schemas.ts
import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  zip: z.string().min(4, "Valid ZIP code is required"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().nullable().optional(),
  address: addressSchema.optional(),
});

export const productSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000),
  brand: z.string().nullable(),
  category: z.string().min(2, "Category is required"),
  size: z.string().nullable(),
  condition: z.enum(["New", "Like New", "Used", "Fair"]),
  price: z.number().positive("Price must be positive").max(1000000),
  stock: z.number().int().min(1, "Stock must be at least 1"),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Order must have at least one item"),
  shippingAddress: addressSchema,
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(500),
});

export const disputeSchema = z.object({
  orderId: z.string(),
  reason: z.string().min(20, "Reason must be at least 20 characters").max(500),
});

export const reportSchema = z.object({
  type: z.enum(["user", "product", "order"]),
  targetId: z.string(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export const trackingNumberSchema = z.object({
  trackingNumber: z.string().min(5, "Valid tracking number is required"),
});
