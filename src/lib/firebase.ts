import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeAuth, getAuth, browserLocalPersistence, browserPopupRedirectResolver, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache,
  enableNetwork,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
};

// Initialize Firebase (client-side only)
const app: FirebaseApp | null =
  typeof window !== "undefined" && firebaseConfig.apiKey
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps()[0] as FirebaseApp))
    : null;

if (typeof window !== "undefined") {

}

// Use initializeAuth instead of getAuth to avoid "Component auth has not been registered yet"
// (happens with Next.js/webpack bundling; initializeAuth explicitly registers the component)
export const auth = app
  ? (() => {
    try {
      return initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch (e) {
      if ((e as { code?: string })?.code === "auth/already-initialized") {
        return getAuth(app);
      }
      return null;
    }
  })()
  : null;

// Use memoryLocalCache + force long polling to avoid "client is offline" errors.
// - memoryLocalCache: skips IndexedDB persistence (which can fail and cause offline state)
// - experimentalForceLongPolling: uses HTTP long-poll instead of WebSockets (helps with proxies/VPNs)
export const db = app
  ? (() => {
    try {
      // Default transport (WebSocket) is faster than experimentalForceLongPolling.
      // Set NEXT_PUBLIC_FIRESTORE_LONG_POLLING=true if you need long-polling behind strict proxies.
      return initializeFirestore(app, {
        localCache: memoryLocalCache(),
        ...(process.env.NEXT_PUBLIC_FIRESTORE_LONG_POLLING === "true"
          ? { experimentalForceLongPolling: true as const }
          : {}),
      });
    } catch {
      return getFirestore(app);
    }
  })()
  : null;

// One-time network enable — avoids repeated enableNetwork() calls that can trigger
// Firestore internal assertion (ID: ca9) race condition in SDK 12.x
let _networkPromise: Promise<void> | null = null;
export function ensureFirestoreNetwork(): Promise<void> {
  if (!db) return Promise.resolve();
  if (!_networkPromise) _networkPromise = enableNetwork(db);
  return _networkPromise;
}

export const storage = app ? getStorage(app) : null;
export const rtdb = app ? getDatabase(app) : null;

let _messaging: Messaging | null = null;
export async function getMessagingSafe(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!app) return null;
  const supported = await isSupported();
  if (!supported) return null;
  if (!_messaging) _messaging = getMessaging(app);
  return _messaging;
}

// Emulator Setup
if (typeof window !== "undefined" && window.location.hostname === "localhost" && app) {


  if (auth) connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  if (db) connectFirestoreEmulator(db, "localhost", 8080);

  try {
    const functions = getFunctions(app);
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (e) { /* ignore */ }

  if (storage) connectStorageEmulator(storage, "localhost", 9199);

  if (rtdb) {
    // Current RTDB emulator default is 9000
    connectDatabaseEmulator(rtdb, "localhost", 9000);
  }
}

export { app };
