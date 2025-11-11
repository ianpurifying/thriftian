// lib/repositories/notificationRepository.ts
import { adminDb } from "../firebase/adminApp";
import { Notification } from "../types";
import { Timestamp } from "firebase-admin/firestore";

export class NotificationRepository {
  private collection = adminDb.collection("notifications");

  async create(data: Omit<Notification, "id" | "createdAt">): Promise<string> {
    const docRef = await this.collection.add({
      ...data,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async findByUser(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Notification;
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.collection.doc(notificationId).update({ isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .where("isRead", "==", false)
      .get();

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
  }
}

export const notificationRepository = new NotificationRepository();
