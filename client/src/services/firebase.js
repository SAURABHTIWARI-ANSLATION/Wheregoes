import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp, startAfter, deleteDoc, doc, writeBatch, onSnapshot } from 'firebase/firestore';
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
const isConfigured = !!firebaseConfig.apiKey && 
                   firebaseConfig.apiKey !== 'your_firebase_api_key' && 
                   firebaseConfig.apiKey !== 'undefined' &&
                   firebaseConfig.apiKey !== '';

console.log('🔥 Firebase Configured:', isConfigured);
if (!isConfigured) {
  console.log('⚠️ Firebase API Key missing or default. Check your .env/Vercel variables.');
}

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
 * Get results from Firestore with pagination support
 */
export async function getHistory(maxItems = 20, lastDoc = null) {
  if (!db) {
    return { items: [], lastVisible: null };
  }

  try {
    let q = query(
      collection(db, 'results'),
      orderBy('timestamp', 'desc'),
      limit(maxItems)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));

    return { items, lastVisible };
  } catch (err) {
    console.error('Failed to fetch history from Firestore:', err.message);
    return { items: [], lastVisible: null };
  }
}

/**
 * Subscribe to history results (Real-time updates)
 */
export function subscribeToHistory(callback, maxItems = 10) {
  if (!db) {
    callback({ items: [], lastVisible: null });
    return () => {};
  }

  const q = query(
    collection(db, 'results'),
    orderBy('timestamp', 'desc'),
    limit(maxItems)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date(),
    }));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    callback({ items, lastVisible });
  }, (err) => {
    console.error('Firestore subscription error:', err.message);
  });
}

/**
 * Delete a single history item
 */
export async function deleteHistoryItem(id) {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'results', id));
    return true;
  } catch (err) {
    console.error('Failed to delete history item:', err.message);
    return false;
  }
}

/**
 * Clear all history for the current user/project
 */
export async function clearAllHistory() {
  if (!db) return false;
  try {
    const q = query(collection(db, 'results'), limit(500)); // Limit to prevent massive batch issues
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed to clear history:', err.message);
    return false;
  }
}

export { isConfigured };
export default db;
