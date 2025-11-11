// lib/repositories/orderRepository.ts
import { adminDb } from "../firebase/adminApp";
import { Order, OrderStatus } from "../types";
import { Timestamp } from "firebase-admin/firestore";

export class OrderRepository {
  private collection = adminDb.collection("orders");

  async create(
    data: Omit<Order, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const now = Timestamp.now();
    const docRef = await this.collection.add({
      ...data,
      status: "pending",
      trackingNumber: null,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async findById(orderId: string): Promise<Order | null> {
    const doc = await this.collection.doc(orderId).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt.toDate(),
      updatedAt: data?.updatedAt.toDate(),
    } as Order;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.collection.doc(orderId).update({
      status,
      updatedAt: Timestamp.now(),
    });
  }

  async updateTrackingNumber(
    orderId: string,
    trackingNumber: string
  ): Promise<void> {
    await this.collection.doc(orderId).update({
      trackingNumber,
      status: "shipped",
      updatedAt: Timestamp.now(),
    });
  }

  async findByBuyer(buyerId: string, limit: number = 50): Promise<Order[]> {
    const snapshot = await this.collection
      .where("buyerId", "==", buyerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Order;
    });
  }

  async findBySeller(sellerId: string, limit: number = 50): Promise<Order[]> {
    const snapshot = await this.collection
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Order;
    });
  }

  async getAll(limit: number = 100): Promise<Order[]> {
    const snapshot = await this.collection
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Order;
    });
  }
}

export const orderRepository = new OrderRepository();
