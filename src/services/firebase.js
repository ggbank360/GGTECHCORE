// Firebase Configuration & Service Initializer
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
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBcJ9LyBWyqDZjY5bxlui_m_Bq3qx1nxJI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ggbank-d6735.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ggbank-d6735-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ggbank-d6735",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ggbank-d6735.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "19675824500",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:19675824500:web:ac34fb072cd7a88653ec21",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1GP5RLN83B"
};

export const isFirebaseConfigured = () => true;

let app = null;
let db = null;
let auth = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  console.info('🚀 GG TECHCORE: Connected to Firebase (ggbank-d6735) Firestore & Auth.');
} catch (error) {
  console.warn('⚠️ Firebase init warning:', error);
}

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
  signOut, 
  onAuthStateChanged 
};
