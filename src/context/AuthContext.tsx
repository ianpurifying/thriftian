"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthService } from "@/services/AuthService";
import { FirestoreService } from "@/services/FirestoreService";
import { AuthContextType, User } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (
          !firebaseUser.emailVerified &&
          firebaseUser.providerData[0]?.providerId !== "google.com"
        ) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userData = await FirestoreService.getUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<void> => {
    await AuthService.signUp(email, password);
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    await AuthService.signIn(email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    await AuthService.signInWithGoogle();
  };

  const signOut = async (): Promise<void> => {
    await AuthService.signOut();
    setUser(null);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    await AuthService.sendVerificationEmail();
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
