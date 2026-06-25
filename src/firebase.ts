import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, collection, onSnapshot } from "firebase/firestore";

// Firebase App Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBloAvBKwcPY4ml2cvoWplGjoUGUthSSpg",
  authDomain: "gen-lang-client-0858188269.firebaseapp.com",
  projectId: "gen-lang-client-0858188269",
  storageBucket: "gen-lang-client-0858188269.firebasestorage.app",
  messagingSenderId: "854053309519",
  appId: "1:854053309519:web:2bc6509023f5a572ffee3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config as the third parameter
export const db = initializeFirestore(app, {}, "ai-studio-friend4life-dbca997e-0c97-466d-a406-063d47fd0f7e");

// Generate a unique client ID for this session/tab to avoid self-overwrite
export const clientId = Math.random().toString(36).substring(2) + Date.now().toString(36);

// Global flag to prevent loops when syncing from Firestore
export let isSyncingFromServer = false;

export function setSyncingFromServer(val: boolean) {
  isSyncingFromServer = val;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Uploads a key-value pair to Firestore
 */
export async function uploadKeyToCloud(key: string, value: string) {
  // Do not upload if we are currently adopting an update from the server
  if (isSyncingFromServer) return;
  
  const path = `local_storage/${key}`;
  try {
    const docRef = doc(db, "local_storage", key);
    await setDoc(docRef, {
      value,
      updatedAt: Date.now(),
      clientId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Sets up a real-time listener for the entire local_storage collection
 */
export function setupCloudSyncListener(onSync: (key: string, value: string) => void) {
  const collectionRef = collection(db, "local_storage");
  const pathForOnSnapshot = "local_storage";
  
  return onSnapshot(collectionRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified") {
        const data = change.doc.data();
        if (data && data.clientId !== clientId) {
          const key = change.doc.id;
          const value = data.value;
          
          // Check if value actually differs from current local storage to prevent redundant updates
          if (localStorage.getItem(key) !== value) {
            console.log(`[Cloud Sync] External update received for key "${key}"`);
            
            setSyncingFromServer(true);
            try {
              localStorage.setItem(key, value);
            } finally {
              setSyncingFromServer(false);
            }
            
            // Notify listener to update React states
            onSync(key, value);
          }
        }
      }
    });
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
  });
}
