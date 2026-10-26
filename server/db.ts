import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UserRecord {
  id: string;
  authUid?: string;
  username: string;
  email: string;
  passwordHash: string; // Internal demo hash
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
  priceCents: number; // in integer cents
  visualKey: string;
  imageUrl?: string;
  active: boolean; // availability only
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

interface DatabaseSchema {
  users: UserRecord[];
  profiles: StudentProfileRecord[];
  products: ProductRecord[];
  activities: ActivityRecord[];
  results: ResultRecord[];
}

// Initial 10 required products from the prompt
const INITIAL_PRODUCTS: ProductRecord[] = [
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

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'user_student_1',
    authUid: 'auth_student_1',
    username: 'estudiante.demo',
    email: 'estudiante@ipca.edu',
    passwordHash: 'estudiante123',
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
    passwordHash: 'docente123',
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
    passwordHash: 'admin123',
    displayName: 'Ing. Roberto Silva (Admin Demo)',
    role: 'technical_admin',
    permissions: ['manage_catalog'],
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_PROFILES: StudentProfileRecord[] = [
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

const INITIAL_ACTIVITIES: ActivityRecord[] = [
  {
    id: 'ACT-001',
    type: 'venta_caja',
    moduleTitle: 'Venta y caja',
    title: 'Venta en caja: Pedido básico',
    instruction: 'Un cliente solicita 2 jugos y 1 paquete de galletas.',
    lineItems: [
      { productId: 'P002', quantity: 2 }, // Jugo
      { productId: 'P003', quantity: 1 }, // Galletas
    ],
    paymentAmountCents: 500, // $5.00
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
      { productId: 'P005', quantity: 1 }, // Leche ($1.10)
      { productId: 'P006', quantity: 2 }, // Pan ($0.40 x 2 = $0.80)
    ],
    paymentAmountCents: 500, // $5.00
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

// Seeded historical result showing preserved integrity
const INITIAL_RESULTS: ResultRecord[] = [
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

class MemoryOrFileDatabase {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback to current directory
      }
    }
    this.dbPath = path.join(dataDir, 'mini_ipca_store.json');
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.activities) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      profiles: INITIAL_PROFILES,
      products: INITIAL_PRODUCTS,
      activities: INITIAL_ACTIVITIES,
      results: INITIAL_RESULTS,
    };
    this.persist(initialData);
    return initialData;
  }

  private persist(data: DatabaseSchema) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('Failed to persist database file to disk:', err);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // --- Users ---
  getUsers(): UserRecord[] {
    return this.data.users;
  }

  getUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByLogin(login: string): UserRecord | undefined {
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

  createUser(user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): UserRecord {
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

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | null {
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

  // --- Profiles ---
  getProfileByUserId(userId: string): StudentProfileRecord | undefined {
    let prof = this.data.profiles.find((p) => p.userId === userId);
    if (!prof) {
      // create default profile if missing
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

  updateProfile(userId: string, updates: Partial<StudentProfileRecord>): StudentProfileRecord {
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
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
    };
    this.save();
    return this.data.profiles[idx];
  }

  // --- Products ---
  getProducts(): ProductRecord[] {
    return this.data.products;
  }

  getProductById(id: string): ProductRecord | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(
    product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): ProductRecord {
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

  updateProduct(id: string, updates: Partial<ProductRecord>): ProductRecord | null {
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

  // --- Activities ---
  getActivities(): ActivityRecord[] {
    return this.data.activities;
  }

  getActivityById(id: string): ActivityRecord | undefined {
    return this.data.activities.find((a) => a.id === id);
  }

  updateActivity(id: string, updates: Partial<ActivityRecord>): ActivityRecord | null {
    const idx = this.data.activities.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.activities[idx] = {
      ...this.data.activities[idx],
      ...updates,
    };
    this.save();
    return this.data.activities[idx];
  }

  // --- Results ---
  getResults(): ResultRecord[] {
    return this.data.results;
  }

  saveResult(result: Omit<ResultRecord, 'id' | 'completedAt'>): ResultRecord {
    const newRecord: ResultRecord = {
      ...result,
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      completedAt: new Date().toISOString(),
    };
    this.data.results.unshift(newRecord);
    this.save();
    return newRecord;
  }

  // Reset to default data (for testing purposes)
  resetToDefaults() {
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

export const db = new MemoryOrFileDatabase();
