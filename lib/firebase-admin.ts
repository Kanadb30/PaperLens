import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    let serviceAccountStr = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountStr) {
      // Fallback for local development if env var is missing
      console.warn('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is missing. Using application default credentials.');
      admin.initializeApp();
      return admin.apps[0];
    }

    // Try to parse the service account
    const serviceAccount = JSON.parse(serviceAccountStr);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    return admin.apps[0];
  } catch (error) {
    console.error('Firebase admin initialization failed:', error);
    // Initialize without credentials as a last resort
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    return admin.apps[0];
  }
}

const app = initializeFirebaseAdmin();
const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
