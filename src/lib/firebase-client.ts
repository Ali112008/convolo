import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function firebaseIsConfigured(): boolean {
  return Object.values(firebaseConfig).every(
    (value) => typeof value === "string" && value.trim().length > 0
  );
}

/**
 * Firebase is optional: no SDK service is initialized until public deployment
 * configuration is present, keeping the local-only workspace fully usable.
 */
export function getFirebaseServices(): FirebaseServices | null {
  if (!firebaseIsConfigured()) return null;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
