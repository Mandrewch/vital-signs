import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  setPersistence 
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Helper to get configuration from environment variables or local storage overrides
const getStoredValue = (key: string): string => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }
  return '';
};

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || getStoredValue('custom_firebase_api_key') || '';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || getStoredValue('custom_firebase_app_id') || '1:901851451965:web:7c7cd504b3ed9c506a1054';

// Configuration for Firebase Project: vital-signs-33d2e
const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vital-signs-33d2e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vital-signs-33d2e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vital-signs-33d2e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "901851451965",
  appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-R2YP0GWWPR"
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with local persistence so you stay signed in across browser sessions
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Offline-first persistent local cache with multi-tab manager
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Analytics conditionally (only in browsers where supported)
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {});
}
