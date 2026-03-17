import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key';

let app = null;
let db = null;
let analytics = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn('Firebase initialization failed:', err.message);
  }
}

/**
 * Save a redirect check result to Firestore
 */
export async function saveResult(url, result) {
  if (!db) {
    console.warn('Firebase not configured. Skipping save.');
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, 'results'), {
      url,
      result,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('Failed to save result to Firestore:', err.message);
    return null;
  }
}

/**
 * Get recent results from Firestore
 */
export async function getHistory(maxItems = 50) {
  if (!db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'results'),
      orderBy('timestamp', 'desc'),
      limit(maxItems)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));
  } catch (err) {
    console.error('Failed to fetch history from Firestore:', err.message);
    return [];
  }
}

export { isConfigured };
export default db;
