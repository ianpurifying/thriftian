"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User, UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthService } from "@/services/auth.service";
import { UserRole, SignupData, LoginData } from "@/types/user";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signup: (data: SignupData) => Promise<UserCredential>;
  login: (data: LoginData) => Promise<UserCredential>;
  logout: () => Promise<void>;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user role from Firestore
        const profile = await AuthService.getUserProfile(firebaseUser.uid);
        setRole(profile?.role || null);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (data: SignupData): Promise<UserCredential> => {
    // create the auth user and firestore profile
    const credential = await AuthService.signup(data);

    // optimistic update: we already know role from the form — set it so other
    // consumers (and getDashboardPath) can use it immediately.
    setRole(data.role);

    // onAuthStateChanged will set `user` and re-fetch profile as well.
    return credential;
  };

  const login = async (data: LoginData): Promise<UserCredential> => {
    const credential = await AuthService.login(data);

    // fetch and set role from firestore so consumers have accurate role ASAP
    try {
      const profile = await AuthService.getUserProfile(credential.user.uid);
      setRole(profile?.role || null);
    } catch (err) {
      // swallow: fallback is null
      setRole(null);
    }

    return credential;
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    setRole(null);
  };

  const getDashboardPath = (): string => {
    if (!role) return "/";
    return AuthService.getDashboardPath(role);
  };

  const value = {
    user,
    role,
    loading,
    signup,
    login,
    logout,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
