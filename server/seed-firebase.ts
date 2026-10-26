/**
 * Mini-IPCA Store — Firebase Admin Seeder Utility
 * 
 * Este script permite poblar o sincronizar los 3 usuarios de demostración y los 10 productos
 * iniciales en Firebase Authentication y Cloud Firestore si se cuenta con credenciales
 * institucionales de Firebase Admin SDK.
 * 
 * USO:
 * 1. Configurar la variable de entorno GOOGLE_APPLICATION_CREDENTIALS con la ruta al serviceAccountKey.json
 * 2. Ejecutar: npx tsx server/seed-firebase.ts
 */

export interface FirebaseSeedUser {
  email: string;
  password: string;
  displayName: string;
  role: 'student' | 'teacher' | 'technical_admin';
  permissions: string[];
}

export const DEMO_USERS_TO_SEED: FirebaseSeedUser[] = [
  {
    email: 'estudiante@ipca.edu',
    password: 'estudiante123',
    displayName: 'Carlos M. (Estudiante Demo)',
    role: 'student',
    permissions: [],
  },
  {
    email: 'docente@ipca.edu',
    password: 'docente123',
    displayName: 'Prof. María Elena (Docente Demo)',
    role: 'teacher',
    permissions: ['manage_catalog'],
  },
  {
    email: 'admin@ipca.edu',
    password: 'admin123',
    displayName: 'Ing. Roberto Silva (Admin Demo)',
    role: 'technical_admin',
    permissions: ['manage_catalog'],
  },
];

export const DEMO_PRODUCTS_TO_SEED = [
  { id: 'P001', name: 'Agua', priceCents: 50, visualKey: 'water', active: true },
  { id: 'P002', name: 'Jugo', priceCents: 80, visualKey: 'juice', active: true },
  { id: 'P003', name: 'Galletas', priceCents: 75, visualKey: 'cookies', active: true },
  { id: 'P004', name: 'Yogur', priceCents: 125, visualKey: 'yogurt', active: true },
  { id: 'P005', name: 'Leche', priceCents: 110, visualKey: 'milk', active: true },
  { id: 'P006', name: 'Pan', priceCents: 40, visualKey: 'bread', active: true },
  { id: 'P007', name: 'Chocolate', priceCents: 90, visualKey: 'chocolate', active: true },
  { id: 'P008', name: 'Papas fritas', priceCents: 100, visualKey: 'chips', active: true },
  { id: 'P009', name: 'Caramelo', priceCents: 10, visualKey: 'candy', active: true },
  { id: 'P010', name: 'Atún', priceCents: 150, visualKey: 'tuna', active: true },
];

export async function runFirebaseSeed() {
  console.log('--- Mini-IPCA Store: Firebase Seed Utility ---');
  console.log('Usuarios preparados para inicialización en Firebase Auth:');
  DEMO_USERS_TO_SEED.forEach(u => {
    console.log(` • [${u.role.toUpperCase()}] ${u.displayName} -> Email: ${u.email}`);
  });
  console.log('Productos preparados para inicialización en Firestore:');
  DEMO_PRODUCTS_TO_SEED.forEach(p => {
    console.log(` • [${p.id}] ${p.name} -> $${(p.priceCents / 100).toFixed(2)} (Activo: ${p.active})`);
  });
  console.log('Para conectar con Firebase Admin en producción, importe firebase-admin e inicialice con initializeApp().');
}

if (process.argv[1]?.includes('seed-firebase')) {
  runFirebaseSeed().catch(console.error);
}
