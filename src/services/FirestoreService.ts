import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { User, UserRole } from "@/types";

export class FirestoreService {
  private static USERS_COLLECTION = "users";

  static async createUser(
    uid: string,
    email: string,
    displayName: string,
    photoURL: string,
    verified: boolean
  ): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);

    const userData = {
      uid,
      email,
      displayName,
      photoURL,
      role: "buyer" as UserRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      verified,
    };

    await setDoc(userRef, userData);
  }

  static async getUser(uid: string): Promise<User | null> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      verified: data.verified,
      sellerInfo: data.sellerInfo,
      address: data.address,
    };
  }

  static async updateUserVerification(
    uid: string,
    verified: boolean
  ): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      verified,
      updatedAt: serverTimestamp(),
    });
  }

  static async updateUserRole(uid: string, role: UserRole): Promise<void> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    });
  }

  static async userExists(uid: string): Promise<boolean> {
    const userRef = doc(db, this.USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  }
}
