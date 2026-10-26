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

const isProduction = import.meta.env.PROD;

// In production, validate that real Firebase Web configuration is provided.
// Throw a clear configuration error instead of silently falling back to fake placeholders.
if (isProduction) {
  const missingKeys: string[] = [];
  if (!import.meta.env.VITE_FIREBASE_API_KEY) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!import.meta.env.VITE_FIREBASE_APP_ID) missingKeys.push('VITE_FIREBASE_APP_ID');

  if (missingKeys.length > 0) {
    throw new Error(
      `[Mini-IPCA Store] Error crítico de configuración: Faltan variables de entorno requeridas para Firebase Web en producción: ${missingKeys.join(
        ', '
      )}. Configure estas variables en Cloud Run o en el entorno de despliegue antes de iniciar.`
    );
  }
}

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    (isProduction ? '' : 'AIzaSyDemoPlaceholderForMiniIpcaStore'),
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    (import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
      : 'mini-ipca-store.firebaseapp.com'),
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    (isProduction ? '' : 'mini-ipca-store'),
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    (import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`
      : 'mini-ipca-store.appspot.com'),
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    (isProduction ? '' : '1234567890'),
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    (isProduction ? '' : '1:1234567890:web:abcdef'),
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
