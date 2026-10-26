import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderForMiniIpcaStore',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mini-ipca-store.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mini-ipca-store',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mini-ipca-store.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

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

export async function loginWithEmailAndPassword(
  identifier: string,
  password: string
): Promise<{ idToken: string; email: string }> {
  const email = resolveLoginToEmail(identifier);

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    return { idToken, email };
  } catch (err: any) {
    // If running in development and Firebase credentials are demo placeholders or offline:
    if (
      import.meta.env.DEV &&
      (err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/invalid-api-key' ||
        err.code === 'auth/network-request-failed' ||
        err.message?.includes('API key'))
    ) {
      console.warn('Firebase Web SDK en modo local/desarrollo (usando token dev para emulación):', err.code);
      return { idToken: `dev_token_${email}`, email };
    }

    // Generic accessible error message as required in Section 22
    throw new Error('Usuario o contraseña incorrectos. Intenta nuevamente.');
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Error al cerrar sesión en Firebase:', err);
  }
}
