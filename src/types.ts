export type Role = 'student' | 'teacher' | 'technical_admin';

export type ScaffoldingLevel = 'high' | 'medium' | 'low';
export type DifficultyLevel = 'facil' | 'medio' | 'avanzado';

export interface User {
  id: string;
  authUid?: string;
  username: string;
  email: string;
  displayName: string;
  role: Role;
  permissions: string[]; // e.g. ['manage_catalog']
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  difficultyLevel: DifficultyLevel;
  choiceCount: 2 | 4;
  showHint: boolean;
  showExample: boolean;
  textToSpeechEnabled: boolean;
  pictogramsEnabled: boolean;
  socialSupportsEnabled: boolean;
  scaffoldingLevel: ScaffoldingLevel;
  largeText: boolean;
  highContrast: boolean;
}

export interface Product {
  id: string;
  name: string;
  priceCents: number; // Stored in integer cents ($0.80 -> 80)
  visualKey: string;
  imageUrl?: string;
  active: boolean; // Stock means availability only!
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface LineItem {
  productId: string;
  quantity: number;
}

export interface Activity {
  id: string;
  type: string; // 'venta_caja' | 'numeracion' | 'operaciones' | 'tiempo' | 'medidas' | 'problemas'
  moduleTitle: string;
  title: string;
  instruction: string;
  lineItems: LineItem[];
  paymentAmountCents: number; // e.g. 500 for $5.00
  difficulty: DifficultyLevel;
  helpLevel: ScaffoldingLevel;
  active: boolean;
}

export interface LineItemSnapshot {
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface HistoricalResult {
  id: string;
  studentId: string;
  studentName: string;
  activityId: string;
  lineItemsSnapshot: LineItemSnapshot[];
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

export interface AuthSession {
  token: string;
  user: User;
  profile?: StudentProfile;
}

export type ScreenId =
  | 'P01' // Inicio de sesión
  | 'S01' // Inicio del estudiante
  | 'S02' // Selección de entrenamiento
  | 'S03' // Productos disponibles
  | 'S04' // Atención de una venta
  | 'S05' // Cálculo del total
  | 'S06' // Cálculo del cambio
  | 'S07' // Retroalimentación y cierre
  | 'S08' // Progreso personal
  | 'T01' // Panel del docente
  | 'T02' // Perfiles de estudiantes
  | 'T03' // Configuración de apoyos
  | 'T04' // Biblioteca / configuración de actividades
  | 'T05' // Productos y stock
  | 'T06' // Resultados y reportes
  | 'A01' // Panel técnico
  | 'A02'; // Usuarios y roles
