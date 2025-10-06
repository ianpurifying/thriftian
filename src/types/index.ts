export type UserRole = "buyer" | "seller" | "admin";

export interface SellerInfo {
  shopName: string;
  contact: string;
  description?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  sellerInfo?: SellerInfo;
  address?: Address;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

export interface FirebaseError {
  code: string;
  message: string;
}
