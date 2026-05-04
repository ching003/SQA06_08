import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
let app: App;

try {
  // If service account credentials are available
  if (process.env.FIREBASE_PRIVATE_KEY) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Use application default credentials (for production)
    app = initializeApp({
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Initialize with minimal config if no credentials
  app = initializeApp({
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Initialize Firebase Realtime Database
const database: Database = getDatabase(app);

// Initialize Firestore
const firestore: Firestore = getFirestore(app);

// Initialize Firebase Storage
const storage: Storage = getStorage(app);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bucket: any = storage.bucket();

export { database, firestore, bucket, storage, app };
