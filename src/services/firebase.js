// Firebase Configuration & Service Initializer for GG TECHCORE
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

const missingEnvVars = [];
if (!firebaseConfig.apiKey) missingEnvVars.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingEnvVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingEnvVars.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missingEnvVars.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingEnvVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingEnvVars.push('VITE_FIREBASE_APP_ID');

if (missingEnvVars.length > 0) {
  console.error(
    `🚨 GG TECHCORE: Firebase Configuration Missing!\n` +
    `The following required environment variables are not defined:\n` +
    missingEnvVars.map((v) => `  - ${v}`).join('\n') +
    `\nPlease populate them in your .env file or production hosting dashboard.`
  );
}

let app = null;
let db = null;
let auth = null;

if (missingEnvVars.length === 0) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.info(`🚀 GG TECHCORE: Connected to Firebase Firestore & Auth (${firebaseConfig.projectId}).`);
  } catch (error) {
    console.error('🚨 Firebase initialization error:', error?.code || error?.message || error);
  }
}

export const isFirebaseConfigured = () => missingEnvVars.length === 0 && app !== null && db !== null;

/**
 * Safely converts a Firestore Timestamp, JS Date, or ISO string to an ISO string.
 * Call this whenever you read `createdAt` / `updatedAt` from Firestore documents
 * before storing or displaying them so the rest of the app always gets a plain string.
 */
export const toISOStringSafe = (val) => {
  if (!val) return null;
  // Firestore Timestamp objects have a .toDate() method
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  // JS Date
  if (val instanceof Date) return val.toISOString();
  // Already a string or number
  return String(val);
};

export const isPermissionDenied = (err) => {
  if (!err) return false;
  const msg = err.message || '';
  const code = err.code || '';
  return code === 'permission-denied' || 
         msg.includes('insufficient permissions') || 
         msg.includes('Permission denied') ||
         code === 'auth/admin-restricted-operation';
};

export { 
  app, 
  db, 
  auth, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  signInWithEmailAndPassword, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged 
};
