import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UserRecord {
  id: string;
  authUid?: string;
  username: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'technical_admin';
  permissions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileRecord {
  id: string;
  userId: string;
  difficultyLevel: 'facil' | 'medio' | 'avanzado';
  choiceCount: 2 | 4;
  showHint: boolean;
  showExample: boolean;
  textToSpeechEnabled: boolean;
  pictogramsEnabled: boolean;
  socialSupportsEnabled: boolean;
  scaffoldingLevel: 'high' | 'medium' | 'low';
  largeText: boolean;
  highContrast: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  priceCents: number;
  visualKey: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ActivityRecord {
  id: string;
  type: string;
  moduleTitle: string;
  title: string;
  instruction: string;
  lineItems: { productId: string; quantity: number }[];
  paymentAmountCents: number;
  difficulty: 'facil' | 'medio' | 'avanzado';
  helpLevel: 'high' | 'medium' | 'low';
  active: boolean;
}

export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  activityId: string;
  lineItemsSnapshot: {
    productId: string;
    productName: string;
    unitPriceCents: number;
    quantity: number;
  }[];
  totalExpectedCents: number;
  totalAnsweredCents: number;
  paymentAmountCents: number;
  changeExpectedCents: number;
  changeAnsweredCents: number;
  attempts: number;
  correct: boolean;
  supportsUsed: string[];
  completedAt: string;
}

export interface IRepository {
  getProviderName(): string;
  // Users
  getUsers(): Promise<UserRecord[]>;
  getUserById(id: string): Promise<UserRecord | undefined>;
  getUserByAuthUid(authUid: string): Promise<UserRecord | undefined>;
  getUserByEmail(email: string): Promise<UserRecord | undefined>;
  getUserByLogin(login: string): Promise<UserRecord | undefined>;
  createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRecord>;
  updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null>;
  // Profiles
  getProfileByUserId(userId: string): Promise<StudentProfileRecord | undefined>;
  updateProfile(userId: string, updates: Partial<StudentProfileRecord>): Promise<StudentProfileRecord>;
  // Products
  getProducts(): Promise<ProductRecord[]>;
  getProductById(id: string): Promise<ProductRecord | undefined>;
  createProduct(product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductRecord>;
  updateProduct(id: string, updates: Partial<ProductRecord>): Promise<ProductRecord | null>;
  // Activities
  getActivities(): Promise<ActivityRecord[]>;
  getActivityById(id: string): Promise<ActivityRecord | undefined>;
  updateActivity(id: string, updates: Partial<ActivityRecord>): Promise<ActivityRecord | null>;
  // Results
  getResults(): Promise<ResultRecord[]>;
  saveResult(result: Omit<ResultRecord, 'id' | 'completedAt'>): Promise<ResultRecord>;
  // Maintenance
  resetToDefaults(): Promise<void>;
}

// 10 initial demo products
export const INITIAL_PRODUCTS: ProductRecord[] = [
  { id: 'P001', name: 'Agua', priceCents: 50, visualKey: 'water', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P002', name: 'Jugo', priceCents: 80, visualKey: 'juice', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P003', name: 'Galletas', priceCents: 75, visualKey: 'cookies', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P004', name: 'Yogur', priceCents: 125, visualKey: 'yogurt', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P005', name: 'Leche', priceCents: 110, visualKey: 'milk', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P006', name: 'Pan', priceCents: 40, visualKey: 'bread', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P007', name: 'Chocolate', priceCents: 90, visualKey: 'chocolate', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P008', name: 'Papas fritas', priceCents: 100, visualKey: 'chips', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P009', name: 'Caramelo', priceCents: 10, visualKey: 'candy', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
  { id: 'P010', name: 'Atún', priceCents: 150, visualKey: 'tuna', active: true, createdAt: '2026-01-01T08:00:00Z', updatedAt: '2026-01-01T08:00:00Z', updatedBy: 'admin' },
];

export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'user_student_1',
    authUid: 'auth_student_1',
    username: 'estudiante.demo',
    email: 'estudiante@ipca.edu',
    displayName: 'Carlos M. (Estudiante Demo)',
    role: 'student',
    permissions: [],
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user_teacher_1',
    authUid: 'auth_teacher_1',
    username: 'docente.demo',
    email: 'docente@ipca.edu',
    displayName: 'Prof. María Elena (Docente Demo)',
    role: 'teacher',
    permissions: ['manage_catalog'],
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user_admin_1',
    authUid: 'auth_admin_1',
    username: 'admin.demo',
    email: 'admin@ipca.edu',
    displayName: 'Ing. Roberto Silva (Admin Demo)',
    role: 'technical_admin',
    permissions: ['manage_catalog'],
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
];

export const INITIAL_PROFILES: StudentProfileRecord[] = [
  {
    id: 'prof_student_1',
    userId: 'user_student_1',
    difficultyLevel: 'facil',
    choiceCount: 4,
    showHint: true,
    showExample: true,
    textToSpeechEnabled: true,
    pictogramsEnabled: true,
    socialSupportsEnabled: true,
    scaffoldingLevel: 'high',
    largeText: false,
    highContrast: false,
  },
];

export const INITIAL_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'ACT-001',
    type: 'venta_caja',
    moduleTitle: 'Venta y caja',
    title: 'Venta en caja: Pedido básico',
    instruction: 'Un cliente solicita 2 jugos y 1 paquete de galletas.',
    lineItems: [
      { productId: 'P002', quantity: 2 },
      { productId: 'P003', quantity: 1 },
    ],
    paymentAmountCents: 500,
    difficulty: 'facil',
    helpLevel: 'high',
    active: true,
  },
  {
    id: 'ACT-002',
    type: 'venta_caja',
    moduleTitle: 'Venta y caja',
    title: 'Venta en caja: Desayuno escolar',
    instruction: 'Un cliente solicita 1 leche y 2 panes.',
    lineItems: [
      { productId: 'P005', quantity: 1 },
      { productId: 'P006', quantity: 2 },
    ],
    paymentAmountCents: 500,
    difficulty: 'facil',
    helpLevel: 'high',
    active: true,
  },
  {
    id: 'ACT-003',
    type: 'numeracion',
    moduleTitle: 'Numeración y conteo',
    title: 'Conteo de unidades de productos',
    instruction: 'Un cliente solicita 3 botellas de agua. Cuenta y confirma la cantidad.',
    lineItems: [
      { productId: 'P001', quantity: 3 },
    ],
    paymentAmountCents: 200,
    difficulty: 'facil',
    helpLevel: 'high',
    active: true,
  },
  {
    id: 'ACT-004',
    type: 'operaciones',
    moduleTitle: 'Operaciones',
    title: 'Suma de dos productos del quiosco',
    instruction: 'Un cliente solicita 1 yogur y 1 chocolate.',
    lineItems: [
      { productId: 'P004', quantity: 1 },
      { productId: 'P007', quantity: 1 },
    ],
    paymentAmountCents: 500,
    difficulty: 'medio',
    helpLevel: 'medium',
    active: true,
  },
  {
    id: 'ACT-005',
    type: 'tiempo',
    moduleTitle: 'Tiempo y horarios',
    title: 'Horario de apertura y refrigerio',
    instruction: 'El cliente consulta a qué hora abre la tienda y pide 1 jugo.',
    lineItems: [
      { productId: 'P002', quantity: 1 },
    ],
    paymentAmountCents: 100,
    difficulty: 'facil',
    helpLevel: 'medium',
    active: true,
  },
  {
    id: 'ACT-006',
    type: 'medidas',
    moduleTitle: 'Medidas',
    title: 'Selección por tamaño de envase',
    instruction: 'El cliente pide 1 botella de agua y 1 lata de atún.',
    lineItems: [
      { productId: 'P001', quantity: 1 },
      { productId: 'P010', quantity: 1 },
    ],
    paymentAmountCents: 500,
    difficulty: 'facil',
    helpLevel: 'medium',
    active: true,
  },
  {
    id: 'ACT-007',
    type: 'problemas',
    moduleTitle: 'Problemas funcionales',
    title: 'Pedido combinado en recreo',
    instruction: 'Un cliente solicita 1 paquete de papas fritas y 2 caramelos.',
    lineItems: [
      { productId: 'P008', quantity: 1 },
      { productId: 'P009', quantity: 2 },
    ],
    paymentAmountCents: 200,
    difficulty: 'medio',
    helpLevel: 'low',
    active: true,
  },
];

export const INITIAL_RESULTS: ResultRecord[] = [
  {
    id: 'RES-001',
    studentId: 'user_student_1',
    studentName: 'Carlos M. (Estudiante Demo)',
    activityId: 'ACT-001',
    lineItemsSnapshot: [
      { productId: 'P002', productName: 'Jugo', unitPriceCents: 80, quantity: 2 },
      { productId: 'P003', productName: 'Galletas', unitPriceCents: 75, quantity: 1 },
    ],
    totalExpectedCents: 235,
    totalAnsweredCents: 235,
    paymentAmountCents: 500,
    changeExpectedCents: 265,
    changeAnsweredCents: 265,
    attempts: 1,
    correct: true,
    supportsUsed: ['pista'],
    completedAt: '2026-10-24T10:15:00Z',
  },
];

interface DatabaseSchema {
  users: UserRecord[];
  profiles: StudentProfileRecord[];
  products: ProductRecord[];
  activities: ActivityRecord[];
  results: ResultRecord[];
}

// ----------------------------------------------------
// 1. JSON File Repository (Development / Local Fallback)
// ----------------------------------------------------
export class JsonRepository implements IRepository {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback
      }
    }
    this.dbPath = path.join(dataDir, 'mini_ipca_store.json');
    this.data = this.load();
  }

  getProviderName(): string {
    return 'JsonRepository (Local file storage)';
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.activities) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('JsonRepository: could not read existing file, using defaults:', err);
    }

    const initialData: DatabaseSchema = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)),
      results: JSON.parse(JSON.stringify(INITIAL_RESULTS)),
    };
    this.persist(initialData);
    return initialData;
  }

  private persist(data: DatabaseSchema) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('JsonRepository: failed to persist to disk:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  async getUsers(): Promise<UserRecord[]> {
    return this.data.users;
  }

  async getUserById(id: string): Promise<UserRecord | undefined> {
    return this.data.users.find((u) => u.id === id);
  }

  async getUserByAuthUid(authUid: string): Promise<UserRecord | undefined> {
    return this.data.users.find((u) => u.authUid === authUid);
  }

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    const clean = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === clean);
  }

  async getUserByLogin(login: string): Promise<UserRecord | undefined> {
    const clean = login.trim().toLowerCase();
    return this.data.users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        (clean === 'estudiante' && u.role === 'student') ||
        (clean === 'docente' && u.role === 'teacher') ||
        (clean === 'admin' && u.role === 'technical_admin')
    );
  }

  async createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRecord> {
    const newRecord: UserRecord = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newRecord);
    this.save();
    return newRecord;
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  async getProfileByUserId(userId: string): Promise<StudentProfileRecord | undefined> {
    let prof = this.data.profiles.find((p) => p.userId === userId);
    if (!prof) {
      prof = {
        id: `prof_${userId}`,
        userId,
        difficultyLevel: 'facil',
        choiceCount: 4,
        showHint: true,
        showExample: true,
        textToSpeechEnabled: true,
        pictogramsEnabled: true,
        socialSupportsEnabled: true,
        scaffoldingLevel: 'high',
        largeText: false,
        highContrast: false,
      };
      this.data.profiles.push(prof);
      this.save();
    }
    return prof;
  }

  async updateProfile(userId: string, updates: Partial<StudentProfileRecord>): Promise<StudentProfileRecord> {
    const idx = this.data.profiles.findIndex((p) => p.userId === userId);
    if (idx === -1) {
      const newProf: StudentProfileRecord = {
        id: `prof_${userId}`,
        userId,
        difficultyLevel: 'facil',
        choiceCount: 4,
        showHint: true,
        showExample: true,
        textToSpeechEnabled: true,
        pictogramsEnabled: true,
        socialSupportsEnabled: true,
        scaffoldingLevel: 'high',
        largeText: false,
        highContrast: false,
        ...updates,
      };
      this.data.profiles.push(newProf);
      this.save();
      return newProf;
    }
    this.data.profiles[idx] = { ...this.data.profiles[idx], ...updates };
    this.save();
    return this.data.profiles[idx];
  }

  async getProducts(): Promise<ProductRecord[]> {
    return this.data.products;
  }

  async getProductById(id: string): Promise<ProductRecord | undefined> {
    return this.data.products.find((p) => p.id === id);
  }

  async createProduct(product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductRecord> {
    const newRecord: ProductRecord = {
      ...product,
      id: `P${String(this.data.products.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(newRecord);
    this.save();
    return newRecord;
  }

  async updateProduct(id: string, updates: Partial<ProductRecord>): Promise<ProductRecord | null> {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.products[idx];
  }

  async getActivities(): Promise<ActivityRecord[]> {
    return this.data.activities;
  }

  async getActivityById(id: string): Promise<ActivityRecord | undefined> {
    return this.data.activities.find((a) => a.id === id);
  }

  async updateActivity(id: string, updates: Partial<ActivityRecord>): Promise<ActivityRecord | null> {
    const idx = this.data.activities.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.activities[idx] = { ...this.data.activities[idx], ...updates };
    this.save();
    return this.data.activities[idx];
  }

  async getResults(): Promise<ResultRecord[]> {
    return this.data.results;
  }

  async saveResult(result: Omit<ResultRecord, 'id' | 'completedAt'>): Promise<ResultRecord> {
    const newRecord: ResultRecord = {
      ...result,
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      completedAt: new Date().toISOString(),
    };
    this.data.results.unshift(newRecord);
    this.save();
    return newRecord;
  }

  async resetToDefaults(): Promise<void> {
    this.data = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)),
      results: JSON.parse(JSON.stringify(INITIAL_RESULTS)),
    };
    this.save();
  }
}

// ----------------------------------------------------
// 2. Firestore Repository (Cloud Run / Deployed Mode)
// ----------------------------------------------------
export class FirestoreRepository implements IRepository {
  private firestore: Firestore;
  private initialized = false;

  constructor() {
    if (!getApps().length) {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'mini-ipca-store';
      try {
        initializeApp({ projectId });
      } catch (err) {
        console.warn('Firebase Admin initializeApp warning:', err);
      }
    }
    this.firestore = getFirestore();
  }

  getProviderName(): string {
    return 'FirestoreRepository (Google Cloud Firestore)';
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      const productsSnap = await this.firestore.collection('products').limit(1).get();
      if (productsSnap.empty) {
        console.log('FirestoreRepository: initializing collections with demo seed data...');
        // Seed products
        const batch = this.firestore.batch();
        for (const p of INITIAL_PRODUCTS) {
          batch.set(this.firestore.collection('products').doc(p.id), p);
        }
        for (const a of INITIAL_ACTIVITIES) {
          batch.set(this.firestore.collection('activities').doc(a.id), a);
        }
        for (const u of INITIAL_USERS) {
          batch.set(this.firestore.collection('users').doc(u.id), u);
        }
        for (const prof of INITIAL_PROFILES) {
          batch.set(this.firestore.collection('profiles').doc(prof.userId), prof);
        }
        for (const res of INITIAL_RESULTS) {
          batch.set(this.firestore.collection('results').doc(res.id), res);
        }
        await batch.commit();
        console.log('FirestoreRepository: initialization complete.');
      }
      this.initialized = true;
    } catch (err) {
      console.warn('FirestoreRepository: ensureInitialized warning:', err);
    }
  }

  async getUsers(): Promise<UserRecord[]> {
    await this.ensureInitialized();
    const snap = await this.firestore.collection('users').get();
    return snap.docs.map((d) => d.data() as UserRecord);
  }

  async getUserById(id: string): Promise<UserRecord | undefined> {
    await this.ensureInitialized();
    const doc = await this.firestore.collection('users').doc(id).get();
    if (!doc.exists) return undefined;
    return doc.data() as UserRecord;
  }

  async getUserByAuthUid(authUid: string): Promise<UserRecord | undefined> {
    await this.ensureInitialized();
    const snap = await this.firestore.collection('users').where('authUid', '==', authUid).limit(1).get();
    if (snap.empty) return undefined;
    return snap.docs[0].data() as UserRecord;
  }

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    await this.ensureInitialized();
    const clean = email.trim().toLowerCase();
    const snap = await this.firestore.collection('users').where('email', '==', clean).limit(1).get();
    if (snap.empty) return undefined;
    return snap.docs[0].data() as UserRecord;
  }

  async getUserByLogin(login: string): Promise<UserRecord | undefined> {
    await this.ensureInitialized();
    const clean = login.trim().toLowerCase();
    // Check by username
    let snap = await this.firestore.collection('users').where('username', '==', clean).limit(1).get();
    if (!snap.empty) return snap.docs[0].data() as UserRecord;
    // Check by email
    snap = await this.firestore.collection('users').where('email', '==', clean).limit(1).get();
    if (!snap.empty) return snap.docs[0].data() as UserRecord;
    // Check role aliases
    if (['estudiante', 'docente', 'admin'].includes(clean)) {
      const roleMap: Record<string, string> = {
        estudiante: 'student',
        docente: 'teacher',
        admin: 'technical_admin',
      };
      snap = await this.firestore.collection('users').where('role', '==', roleMap[clean]).limit(1).get();
      if (!snap.empty) return snap.docs[0].data() as UserRecord;
    }
    return undefined;
  }

  async createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRecord> {
    await this.ensureInitialized();
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: UserRecord = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.firestore.collection('users').doc(id).set(newRecord);
    return newRecord;
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    await this.ensureInitialized();
    const ref = this.firestore.collection('users').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const merged: UserRecord = {
      ...(doc.data() as UserRecord),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await ref.set(merged, { merge: true });
    return merged;
  }

  async getProfileByUserId(userId: string): Promise<StudentProfileRecord | undefined> {
    await this.ensureInitialized();
    const doc = await this.firestore.collection('profiles').doc(userId).get();
    if (doc.exists) {
      return doc.data() as StudentProfileRecord;
    }
    // Create default if missing
    const defaultProf: StudentProfileRecord = {
      id: `prof_${userId}`,
      userId,
      difficultyLevel: 'facil',
      choiceCount: 4,
      showHint: true,
      showExample: true,
      textToSpeechEnabled: true,
      pictogramsEnabled: true,
      socialSupportsEnabled: true,
      scaffoldingLevel: 'high',
      largeText: false,
      highContrast: false,
    };
    await this.firestore.collection('profiles').doc(userId).set(defaultProf);
    return defaultProf;
  }

  async updateProfile(userId: string, updates: Partial<StudentProfileRecord>): Promise<StudentProfileRecord> {
    await this.ensureInitialized();
    const ref = this.firestore.collection('profiles').doc(userId);
    const doc = await ref.get();
    const existing = doc.exists ? (doc.data() as StudentProfileRecord) : {
      id: `prof_${userId}`,
      userId,
      difficultyLevel: 'facil',
      choiceCount: 4,
      showHint: true,
      showExample: true,
      textToSpeechEnabled: true,
      pictogramsEnabled: true,
      socialSupportsEnabled: true,
      scaffoldingLevel: 'high',
      largeText: false,
      highContrast: false,
    };
    const merged: StudentProfileRecord = { ...existing, ...updates } as StudentProfileRecord;
    await ref.set(merged, { merge: true });
    return merged;
  }

  async getProducts(): Promise<ProductRecord[]> {
    await this.ensureInitialized();
    const snap = await this.firestore.collection('products').get();
    return snap.docs.map((d) => d.data() as ProductRecord);
  }

  async getProductById(id: string): Promise<ProductRecord | undefined> {
    await this.ensureInitialized();
    const doc = await this.firestore.collection('products').doc(id).get();
    if (!doc.exists) return undefined;
    return doc.data() as ProductRecord;
  }

  async createProduct(product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductRecord> {
    await this.ensureInitialized();
    const all = await this.getProducts();
    const id = `P${String(all.length + 1).padStart(3, '0')}`;
    const newRecord: ProductRecord = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.firestore.collection('products').doc(id).set(newRecord);
    return newRecord;
  }

  async updateProduct(id: string, updates: Partial<ProductRecord>): Promise<ProductRecord | null> {
    await this.ensureInitialized();
    const ref = this.firestore.collection('products').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const merged: ProductRecord = {
      ...(doc.data() as ProductRecord),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await ref.set(merged, { merge: true });
    return merged;
  }

  async getActivities(): Promise<ActivityRecord[]> {
    await this.ensureInitialized();
    const snap = await this.firestore.collection('activities').get();
    return snap.docs.map((d) => d.data() as ActivityRecord);
  }

  async getActivityById(id: string): Promise<ActivityRecord | undefined> {
    await this.ensureInitialized();
    const doc = await this.firestore.collection('activities').doc(id).get();
    if (!doc.exists) return undefined;
    return doc.data() as ActivityRecord;
  }

  async updateActivity(id: string, updates: Partial<ActivityRecord>): Promise<ActivityRecord | null> {
    await this.ensureInitialized();
    const ref = this.firestore.collection('activities').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const merged: ActivityRecord = { ...(doc.data() as ActivityRecord), ...updates };
    await ref.set(merged, { merge: true });
    return merged;
  }

  async getResults(): Promise<ResultRecord[]> {
    await this.ensureInitialized();
    const snap = await this.firestore.collection('results').orderBy('completedAt', 'desc').get();
    return snap.docs.map((d) => d.data() as ResultRecord);
  }

  async saveResult(result: Omit<ResultRecord, 'id' | 'completedAt'>): Promise<ResultRecord> {
    await this.ensureInitialized();
    const id = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: ResultRecord = {
      ...result,
      id,
      completedAt: new Date().toISOString(),
    };
    await this.firestore.collection('results').doc(id).set(newRecord);
    return newRecord;
  }

  async resetToDefaults(): Promise<void> {
    const batch = this.firestore.batch();
    for (const p of INITIAL_PRODUCTS) {
      batch.set(this.firestore.collection('products').doc(p.id), p);
    }
    for (const a of INITIAL_ACTIVITIES) {
      batch.set(this.firestore.collection('activities').doc(a.id), a);
    }
    for (const u of INITIAL_USERS) {
      batch.set(this.firestore.collection('users').doc(u.id), u);
    }
    for (const prof of INITIAL_PROFILES) {
      batch.set(this.firestore.collection('profiles').doc(prof.userId), prof);
    }
    for (const res of INITIAL_RESULTS) {
      batch.set(this.firestore.collection('results').doc(res.id), res);
    }
    await batch.commit();
  }
}

// ----------------------------------------------------
// 3. Provider Selector
// ----------------------------------------------------
export function createRepository(): IRepository {
  const provider = (process.env.DATA_PROVIDER || '').toLowerCase();
  if (provider === 'firestore') {
    try {
      return new FirestoreRepository();
    } catch (err) {
      console.warn('Failed to initialize FirestoreRepository, falling back to JsonRepository:', err);
      return new JsonRepository();
    }
  }
  return new JsonRepository();
}

export const db: IRepository = createRepository();
