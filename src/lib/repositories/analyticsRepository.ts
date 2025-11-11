// lib/repositories/analyticsRepository.ts
import { adminDb } from "../firebase/adminApp";
import { Analytics } from "../types";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export class AnalyticsRepository {
  private collection = adminDb.collection("analytics");

  async findBySeller(sellerId: string): Promise<Analytics | null> {
    const doc = await this.collection.doc(sellerId).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      sellerId: doc.id,
      ...data,
      lastUpdated: data?.lastUpdated.toDate(),
    } as Analytics;
  }

  async update(sellerId: string, data: Partial<Analytics>): Promise<void> {
    await this.collection.doc(sellerId).set(
      {
        ...data,
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );
  }

  async incrementSales(sellerId: string, amount: number): Promise<void> {
    await this.collection.doc(sellerId).set(
      {
        totalSales: FieldValue.increment(amount),
        totalOrders: FieldValue.increment(1),
        lastUpdated: Timestamp.now(),
      },
      { merge: true }
    );
  }
}

export const analyticsRepository = new AnalyticsRepository();
