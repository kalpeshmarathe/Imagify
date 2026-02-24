import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (client-side only)
const app: FirebaseApp | null =
  typeof window !== "undefined" && firebaseConfig.apiKey
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps()[0] as FirebaseApp))
    : null;

export const auth = app ? getAuth(app) : null;

// Use memoryLocalCache + force long polling to avoid "client is offline" errors.
// - memoryLocalCache: skips IndexedDB persistence (which can fail and cause offline state)
// - experimentalForceLongPolling: uses HTTP long-poll instead of WebSockets (helps with proxies/VPNs)
export const db = app
  ? (() => {
      try {
        return initializeFirestore(app, {
          localCache: memoryLocalCache(),
          experimentalForceLongPolling: true,
        });
      } catch {
        return getFirestore(app);
      }
    })()
  : null;

export const storage = app ? getStorage(app) : null;
export { app };
