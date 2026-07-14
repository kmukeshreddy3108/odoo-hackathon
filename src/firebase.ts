/**
 * firebase.ts
 * Initialises Firebase App with Firestore + Auth.
 * Reads config from Vite environment variables (VITE_FIREBASE_*).
 * If the config is absent the module exports null instances so the app
 * can fall back gracefully to localStorage mode — no crash.
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const env = (import.meta as any).env ?? {};

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
};

/** True only when all required config values are present */
export const isFirebaseConfigured: boolean =
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
