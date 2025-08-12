import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Configurar auth con persistencia indexedDB para PWA
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
});

export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

enableIndexedDbPersistence(db).catch(() => { });

export async function setupMessaging(): Promise<string | undefined> {
  if (!(await isSupported())) return;
  const messaging = getMessaging(app);
  const vapidKey = import.meta.env.VITE_FB_VAPID_KEY;
  try {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return undefined;
    }
    const token = await getToken(messaging, { vapidKey });
    return token || undefined;
  } catch { return undefined; }
}


