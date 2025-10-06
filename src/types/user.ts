// src/types/user.ts

export type UserRole = "buyer" | "seller" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  role?: UserRole;
}

export interface SignupData {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}
