// src/services/auth.service.ts

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole, SignupData, LoginData } from "@/types/user";

export class AuthService {
  // Create user profile in Firestore
  static async createUserProfile(
    uid: string,
    email: string,
    role: UserRole
  ): Promise<void> {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      uid,
      email,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: data.uid,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  }

  // Sign up new user
  static async signup(data: SignupData): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Create user profile in Firestore
    await this.createUserProfile(
      userCredential.user.uid,
      data.email,
      data.role
    );

    return userCredential;
  }

  // Login existing user
  static async login(data: LoginData): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, data.email, data.password);
  }

  // Logout user
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  // Get role-specific dashboard path
  static getDashboardPath(role: UserRole): string {
    const dashboardPaths: Record<UserRole, string> = {
      buyer: "/user/dashboard",
      seller: "/seller/dashboard",
      admin: "/admin/dashboard",
    };
    return dashboardPaths[role];
  }
}
