// lib/repositories/productRepository.ts
import { adminDb } from "../firebase/adminApp";
import { Product, ProductStatus } from "../types";
import { Timestamp } from "firebase-admin/firestore";

export class ProductRepository {
  private collection = adminDb.collection("products");

  async create(
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const now = Timestamp.now();
    const docRef = await this.collection.add({
      ...data,
      status: "pending",
      averageRating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async findById(productId: string): Promise<Product | null> {
    const doc = await this.collection.doc(productId).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt.toDate(),
      updatedAt: data?.updatedAt.toDate(),
    } as Product;
  }

  async update(productId: string, data: Partial<Product>): Promise<void> {
    await this.collection.doc(productId).update({
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async updateStatus(productId: string, status: ProductStatus): Promise<void> {
    await this.collection.doc(productId).update({
      status,
      updatedAt: Timestamp.now(),
    });
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const productRef = this.collection.doc(productId);
    await adminDb.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) throw new Error("Product not found");

      const currentStock = productDoc.data()?.stock || 0;
      if (currentStock < quantity) throw new Error("Insufficient stock");

      const newStock = currentStock - quantity;
      transaction.update(productRef, {
        stock: newStock,
        status: newStock === 0 ? "soldout" : productDoc.data()?.status,
        updatedAt: Timestamp.now(),
      });
    });
  }

  async updateRating(productId: string, newRating: number): Promise<void> {
    const productRef = this.collection.doc(productId);
    await adminDb.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) throw new Error("Product not found");

      const data = productDoc.data();
      const currentAvg = data?.averageRating || 0;
      const currentCount = data?.reviewCount || 0;

      const newCount = currentCount + 1;
      const newAvg = (currentAvg * currentCount + newRating) / newCount;

      transaction.update(productRef, {
        averageRating: newAvg,
        reviewCount: newCount,
        updatedAt: Timestamp.now(),
      });
    });
  }

  async findBySeller(sellerId: string, limit: number = 50): Promise<Product[]> {
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
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
      } as Product;
    });
  }

  async findApproved(limit: number = 100): Promise<Product[]> {
    const snapshot = await this.collection
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
      } as Product;
    });
  }

  async findPending(limit: number = 100): Promise<Product[]> {
    const snapshot = await this.collection
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        updatedAt: data?.updatedAt?.toDate?.() || new Date(),
      } as Product;
    });
  }

  async delete(productId: string): Promise<void> {
    await this.collection.doc(productId).delete();
  }
}

export const productRepository = new ProductRepository();
