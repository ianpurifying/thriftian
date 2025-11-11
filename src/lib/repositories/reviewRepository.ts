// lib/repositories/reviewRepository.ts
import { adminDb } from "../firebase/adminApp";
import { Review } from "../types";
import { Timestamp } from "firebase-admin/firestore";

export class ReviewRepository {
  private collection = adminDb.collection("reviews");

  async create(data: Omit<Review, "id" | "createdAt">): Promise<string> {
    const docRef = await this.collection.add({
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async findByProduct(
    productId: string,
    limit: number = 50
  ): Promise<Review[]> {
    const snapshot = await this.collection
      .where("productId", "==", productId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Review;
    });
  }

  async hasUserReviewedProduct(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const snapshot = await this.collection
      .where("buyerId", "==", userId)
      .where("productId", "==", productId)
      .limit(1)
      .get();

    return !snapshot.empty;
  }
}

export const reviewRepository = new ReviewRepository();
