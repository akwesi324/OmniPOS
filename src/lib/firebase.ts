import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Guard against missing config
let app: any;
let auth: any;
let db: any;

export async function getFirebase() {
  if (!app) {
    try {
      const configReq = await fetch('/firebase-applet-config.json');
      
      const contentType = configReq.headers.get('content-type');
      if (!configReq.ok || !contentType || !contentType.includes('application/json')) {
        // Silently fail if config is missing, allowing mock mode to take over without console errors
        return null;
      }

      const firebaseConfig = await configReq.json();
      
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

      // Test connection
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (e) {
        console.warn('Initial connection test failed, might be offline or rules issue');
      }
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return null;
    }
  }
  return { auth, db };
}
