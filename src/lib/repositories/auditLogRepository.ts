// lib/repositories/auditLogRepository.ts
import { adminDb } from "../firebase/adminApp";
import { AuditLog } from "../types";
import { Timestamp } from "firebase-admin/firestore";

export class AuditLogRepository {
  private collection = adminDb.collection("auditLogs");

  async create(data: Omit<AuditLog, "id" | "timestamp">): Promise<string> {
    const docRef = await this.collection.add({
      ...data,
      timestamp: Timestamp.now(),
    });
    return docRef.id;
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate(),
      } as AuditLog;
    });
  }

  async getRecent(limit: number = 100): Promise<AuditLog[]> {
    const snapshot = await this.collection
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate(),
      } as AuditLog;
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
