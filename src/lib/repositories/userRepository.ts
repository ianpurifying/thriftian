// lib/repositories/userRepository.ts
import { adminDb } from "../firebase/adminApp";
import { User, UserRole } from "../types";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export class UserRepository {
  private collection = adminDb.collection("users");

  async create(userId: string, data: Partial<User>): Promise<void> {
    const now = Timestamp.now();
    await this.collection.doc(userId).set({
      ...data,
      createdAt: now,
      updatedAt: now,
      wishlist: [],
    });
  }

  async findById(userId: string): Promise<User | null> {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt.toDate(),
      updatedAt: data?.updatedAt.toDate(),
    } as User;
  }

  async update(userId: string, data: Partial<User>): Promise<void> {
    await this.collection.doc(userId).update({
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async updateRole(userId: string, role: UserRole): Promise<void> {
    await this.collection.doc(userId).update({
      role,
      updatedAt: Timestamp.now(),
    });
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    await this.collection.doc(userId).update({
      wishlist: FieldValue.arrayUnion(productId),
    });
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await this.collection.doc(userId).update({
      wishlist: FieldValue.arrayRemove(productId),
    });
  }

  async getAll(limit: number = 100): Promise<User[]> {
    const snapshot = await this.collection.limit(limit).get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;
    });
  }
}

export const userRepository = new UserRepository();
