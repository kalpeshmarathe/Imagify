"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, enableNetwork } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AuthProviderType = "google" | "facebook" | "yahoo";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  coolId: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithYahoo: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    if (!db) return null;
    const database = db;
    const userRef = doc(database, "users", firebaseUser.uid);

    const tryFetch = async (retries = 4): Promise<UserProfile | null> => {
      try {
        await enableNetwork(database);
        // Brief wait for connection to establish (helps avoid "offline" on first load)
        await new Promise((r) => setTimeout(r, 300));
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          return snap.data() as UserProfile;
        }
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? null,
          displayName: firebaseUser.displayName ?? null,
          photoURL: firebaseUser.photoURL ?? null,
          coolId: null,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      } catch (err) {
        const isOffline =
          err instanceof Error &&
          (err.message.includes("offline") || err.message.includes("Failed to get document"));
        if (isOffline && retries > 0) {
          await new Promise((r) => setTimeout(r, 2000));
          return tryFetch(retries - 1);
        }
        throw err;
      }
    };

    return tryFetch();
  };

  const refreshProfile = async () => {
    if (!user || !db) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          const p = await fetchOrCreateProfile(firebaseUser);
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth profile fetch failed:", err);
        setProfile(firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email ?? null, displayName: firebaseUser.displayName ?? null, photoURL: firebaseUser.photoURL ?? null, coolId: null, createdAt: "" } : null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithProvider = async (providerType: AuthProviderType) => {
    if (!auth) throw new Error("Firebase not configured");

    let provider;
    switch (providerType) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "facebook":
        provider = new FacebookAuthProvider();
        break;
      case "yahoo":
        provider = new OAuthProvider("yahoo.com");
        break;
      default:
        throw new Error("Unknown provider");
    }

    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isConfigured: !!auth,
    signInWithGoogle: () => signInWithProvider("google"),
    signInWithFacebook: () => signInWithProvider("facebook"),
    signInWithYahoo: () => signInWithProvider("yahoo"),
    signOut,
    refreshProfile,
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
