import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import { FirestoreService } from "./FirestoreService";
import { FirebaseError } from "@/types";

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  static async signUp(
    email: string,
    password: string
  ): Promise<UserCredential> {
    if (!this.validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (!this.validatePassword(password)) {
      throw new Error("Password must be at least 8 characters");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { user } = userCredential;

    await FirestoreService.createUser(
      user.uid,
      user.email || email,
      user.displayName || email.split("@")[0],
      user.photoURL || "",
      false
    );

    await sendEmailVerification(user);

    return userCredential;
  }

  static async signIn(
    email: string,
    password: string
  ): Promise<UserCredential> {
    if (!this.validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { user } = userCredential;

    if (!user.emailVerified) {
      throw new Error("Please verify your email before signing in");
    }

    const firestoreUser = await FirestoreService.getUser(user.uid);
    if (firestoreUser && !firestoreUser.verified) {
      await FirestoreService.updateUserVerification(user.uid, true);
    }

    return userCredential;
  }

  static async signInWithGoogle(): Promise<UserCredential> {
    const userCredential = await signInWithPopup(auth, this.googleProvider);
    const { user } = userCredential;

    const exists = await FirestoreService.userExists(user.uid);

    if (!exists) {
      await FirestoreService.createUser(
        user.uid,
        user.email || "",
        user.displayName || "User",
        user.photoURL || "",
        true
      );
    }

    return userCredential;
  }

  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  static async sendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    await sendEmailVerification(user);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  static getErrorMessage(error: FirebaseError): string {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered";
      case "auth/invalid-email":
        return "Invalid email address";
      case "auth/operation-not-allowed":
        return "Operation not allowed";
      case "auth/weak-password":
        return "Password is too weak";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/user-not-found":
        return "Invalid email or password";
      case "auth/wrong-password":
        return "Invalid email or password";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed";
      default:
        return "An error occurred. Please try again";
    }
  }
}
