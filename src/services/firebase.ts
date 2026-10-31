import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
const isProduction = Boolean(env.PROD);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    appletConfig.authDomain ||
    'mini-ipca-store.firebaseapp.com',
  projectId:
    env.VITE_FIREBASE_PROJECT_ID ||
    appletConfig.projectId ||
    'mini-ipca-store',
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    appletConfig.storageBucket ||
    'mini-ipca-store.firebasestorage.app',
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    appletConfig.messagingSenderId ||
    '52428004141',
  appId:
    env.VITE_FIREBASE_APP_ID ||
    appletConfig.appId ||
    '1:52428004141:web:ef0b62d161923f9401d1a4',
};

// Validate that real Firebase Web configuration is available
const missingKeys: string[] = [];
if (!firebaseConfig.apiKey) missingKeys.push('apiKey');
if (!firebaseConfig.projectId) missingKeys.push('projectId');
if (!firebaseConfig.appId) missingKeys.push('appId');

if (missingKeys.length > 0) {
  throw new Error(
    `[Mini-IPCA Store] Error crítico de configuración: Faltan valores requeridos para Firebase Web (${missingKeys.join(
      ', '
    )}). Verifique firebase-applet-config.json o las variables de entorno VITE_FIREBASE_*.`
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Mini-IPCA Store] Aviso: El cliente de Firebase indica que está desconectado.');
    }
  }
}
testConnection();

// Use browserSessionPersistence for shared school devices at IPCA.
// Closing the browser tab/window clears the authentication session.
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.warn('Aviso al configurar browserSessionPersistence en Firebase Auth:', err);
});

// Resolves alias / username to email address internally without exposing details
export function resolveLoginToEmail(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@')) {
    return clean;
  }
  const aliasMap: Record<string, string> = {
    'estudiante.demo': 'estudiante@ipca.edu',
    'estudiante': 'estudiante@ipca.edu',
    'docente.demo': 'docente@ipca.edu',
    'docente': 'docente@ipca.edu',
    'admin.demo': 'admin@ipca.edu',
    'admin': 'admin@ipca.edu',
  };
  return aliasMap[clean] || `${clean}@ipca.edu`;
}

/**
 * Retrieves the current valid Firebase ID token before protected API calls.
 * Firebase automatically refreshes the token when near expiry.
 * If no user is authenticated, returns null (request treated as unauthenticated).
 */
export async function getFreshIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      return await currentUser.getIdToken();
    } catch (err) {
      console.warn('Error al obtener Firebase ID Token actualizado:', err);
      return null;
    }
  }

  // Local development fallback when Firebase servers are unreachable or demo offline
  if (import.meta.env.DEV) {
    const devEmail = sessionStorage.getItem('mini_ipca_dev_email');
    if (devEmail) {
      return `dev_token_${devEmail}`;
    }
  }

  return null;
}

export async function loginWithEmailAndPassword(
  identifier: string,
  password: string
): Promise<{ email: string }> {
  const email = resolveLoginToEmail(identifier);

  try {
    await setPersistence(auth, browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { email: cred.user.email || email };
  } catch (err: any) {
    // Development fallback when Firebase credentials are demo placeholders or offline
    if (
      import.meta.env.DEV &&
      (err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/invalid-api-key' ||
        err.code === 'auth/network-request-failed' ||
        err.message?.includes('API key'))
    ) {
      console.warn('Firebase Web SDK en modo local/desarrollo (usando sesión dev en memoria):', err.code);
      sessionStorage.setItem('mini_ipca_dev_email', email);
      return { email };
    }

    // Accessible error message as required in Section 22
    throw new Error('Usuario o contraseña incorrectos. Intenta nuevamente.');
  }
}

export async function logoutFirebase(): Promise<void> {
  if (import.meta.env.DEV) {
    sessionStorage.removeItem('mini_ipca_dev_email');
  }
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Error al cerrar sesión en Firebase:', err);
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
