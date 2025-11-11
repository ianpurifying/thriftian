// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase/clientApp";
import { User, UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const syncVerificationStatus = async (firebaseUser: FirebaseUser) => {
    try {
      // Reload user to get latest emailVerified status
      await firebaseUser.reload();
      const isVerified = firebaseUser.emailVerified;

      const token = await firebaseUser.getIdToken();

      // Check if Firestore verification status matches
      const userResponse = await fetch(`/api/users/${firebaseUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.ok) {
        const { user } = await userResponse.json();

        // If Firebase Auth shows verified but Firestore doesn't, update it
        if (isVerified && !user.verified) {
          await fetch(`/api/users/${firebaseUser.uid}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ verified: true }),
          });

          // Refresh user data
          await fetchUserData(firebaseUser.uid);
        }
      }
    } catch (error) {
      console.error("Error syncing verification status:", error);
    }
  };

  const createSession = async (idToken: string) => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error("Session creation error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await createSession(idToken);

        // Sync verification status before fetching user data
        await syncVerificationStatus(firebaseUser);
        await fetchUserData(firebaseUser.uid);
      } else {
        setUser(null);
        await fetch("/api/auth/session", { method: "DELETE" });
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Create user document with selected role
    const token = await userCredential.user.getIdToken();
    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        role,
        verified: false,
      }),
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Check if user exists, if not create
    const token = await userCredential.user.getIdToken();
    const checkResponse = await fetch(`/api/users/${userCredential.user.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!checkResponse.ok) {
      await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userCredential.user.displayName || "User",
          email: userCredential.user.email,
          role: "buyer",
          verified: userCredential.user.emailVerified,
          photoURL: userCredential.user.photoURL,
        }),
      });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await syncVerificationStatus(firebaseUser);
      await fetchUserData(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
