/**
 * Mini-IPCA Store — Firebase Admin Seeder Utility
 * 
 * Permite aprovisionar o actualizar las cuentas institucionales de demostración
 * (Estudiante, Docente, Admin) en Firebase Authentication y sus roles en la base de datos.
 * 
 * SEGURIDAD:
 * Las contraseñas iniciales NUNCA se escriben en código fuente ni se suben a repositorios.
 * Se leen exclusivamente desde variables de entorno seguras:
 *   - DEMO_ESTUDIANTE_PASSWORD
 *   - DEMO_DOCENTE_PASSWORD
 *   - DEMO_ADMIN_PASSWORD
 * 
 * USO:
 *   DEMO_ESTUDIANTE_PASSWORD="secret" DEMO_DOCENTE_PASSWORD="secret" DEMO_ADMIN_PASSWORD="secret" npx tsx server/seed-firebase.ts
 */

import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord as FirebaseUserRecord } from 'firebase-admin/auth';
import { db } from './repository.js';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'mini-ipca-store';
  initializeApp({ projectId });
}

export interface DemoUserSpec {
  email: string;
  username: string;
  displayName: string;
  role: 'student' | 'teacher' | 'technical_admin';
  permissions: string[];
  envPasswordKey: string;
}

export const DEMO_USERS_SPECS: DemoUserSpec[] = [
  {
    email: 'estudiante@ipca.edu',
    username: 'estudiante.demo',
    displayName: 'Carlos M. (Estudiante Demo)',
    role: 'student',
    permissions: [],
    envPasswordKey: 'DEMO_ESTUDIANTE_PASSWORD',
  },
  {
    email: 'docente@ipca.edu',
    username: 'docente.demo',
    displayName: 'Prof. María Elena (Docente Demo)',
    role: 'teacher',
    permissions: ['manage_catalog'],
    envPasswordKey: 'DEMO_DOCENTE_PASSWORD',
  },
  {
    email: 'admin@ipca.edu',
    username: 'admin.demo',
    displayName: 'Ing. Roberto Silva (Admin Demo)',
    role: 'technical_admin',
    permissions: ['manage_catalog'],
    envPasswordKey: 'DEMO_ADMIN_PASSWORD',
  },
];

export async function runFirebaseSeed() {
  console.log('=== Mini-IPCA Store — Inicialización de Cuentas Firebase ===');

  for (const spec of DEMO_USERS_SPECS) {
    const password = process.env[spec.envPasswordKey];
    console.log(`\nProcesando cuenta: ${spec.displayName} (${spec.email})`);

    let firebaseUser: FirebaseUserRecord | null = null;
    const auth = getAuth();

    try {
      firebaseUser = await auth.getUserByEmail(spec.email);
      console.log(` • Usuario existente encontrado en Firebase Auth (UID: ${firebaseUser.uid})`);
      if (password) {
        await auth.updateUser(firebaseUser.uid, {
          password,
          displayName: spec.displayName,
        });
        console.log(` • Contraseña actualizada desde variable de entorno [${spec.envPasswordKey}].`);
      } else {
        console.log(` • [AVISO] Variable ${spec.envPasswordKey} no provista; contraseña no alterada.`);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        if (!password) {
          console.error(
            ` • [ERROR] No es posible crear usuario nuevo sin contraseña. Defina la variable de entorno ${spec.envPasswordKey}.`
          );
          continue;
        }
        firebaseUser = await auth.createUser({
          email: spec.email,
          password,
          displayName: spec.displayName,
          emailVerified: true,
        });
        console.log(` • Usuario creado exitosamente en Firebase Auth (UID: ${firebaseUser.uid}).`);
      } else {
        console.error(` • Error al consultar Firebase Auth para ${spec.email}:`, err.message);
        continue;
      }
    }

    if (firebaseUser) {
      // Create or update application metadata in repository
      let existingAppUser = await db.getUserByEmail(spec.email);
      if (existingAppUser) {
        await db.updateUser(existingAppUser.id, {
          authUid: firebaseUser.uid,
          role: spec.role,
          permissions: spec.permissions,
          active: true,
          displayName: spec.displayName,
        });
        console.log(` • Metadatos de rol [${spec.role}] sincronizados en el repositorio.`);
      } else {
        await db.createUser({
          authUid: firebaseUser.uid,
          username: spec.username,
          email: spec.email,
          displayName: spec.displayName,
          role: spec.role,
          permissions: spec.permissions,
          active: true,
        });
        console.log(` • Metadatos de usuario creados en el repositorio.`);
      }
    }
  }

  console.log('\n=== Proceso de siembra finalizado. ===');
}

if (process.argv[1]?.includes('seed-firebase')) {
  runFirebaseSeed().catch((e) => {
    console.error('Error durante la ejecución del seeder:', e);
    process.exit(1);
  });
}
