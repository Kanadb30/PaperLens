import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

if (!admin.apps.length) {
  try {
    let serviceAccountStr = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountStr || !serviceAccountStr.trim().endsWith('}')) {
      const envPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=({[\s\S]*?})/);
        if (match) {
          serviceAccountStr = match[1];
        }
      }
    }

    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    try { if (!admin.apps.length) admin.initializeApp(); } catch(e){}
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
