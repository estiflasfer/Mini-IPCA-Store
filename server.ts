import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import appletConfig from './firebase-applet-config.json';
import { db, UserRecord } from './server/repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure project is not inferred from Cloud Run host project
if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== 'mini-ipca-store') {
  delete process.env.GOOGLE_CLOUD_PROJECT;
}
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== 'mini-ipca-store') {
  delete process.env.GCLOUD_PROJECT;
}
process.env.FIREBASE_PROJECT_ID = 'mini-ipca-store';

// Initialize Firebase Admin SDK explicitly with project mini-ipca-store
const targetProjectId = 'mini-ipca-store';
if (!getApps().length) {
  try {
    initializeApp({ projectId: targetProjectId });
    console.log(`[Mini-IPCA Store] Firebase Admin SDK inicializado para proyecto: ${targetProjectId}`);
  } catch (err) {
    console.warn('Firebase Admin initializeApp warning:', err);
  }
}

const app = express();
// Exact requirement: const PORT = Number(process.env.PORT) || 3000;
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

// Authentication Middleware via Firebase ID Token
async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autenticado. Inicie sesión.' });
  }

  const idToken = authHeader.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Token de autorización ausente.' });
  }

  try {
    let uid: string;
    let email: string | undefined;

    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      uid = decodedToken.uid;
      email = decodedToken.email;
    } catch (verifyErr: any) {
      // In local development or test mode, allow dev token format if Firebase Admin offline
      if (process.env.NODE_ENV !== 'production' && idToken.startsWith('dev_token_')) {
        const emailFromToken = idToken.replace('dev_token_', '');
        email = emailFromToken;
        uid = `uid_${emailFromToken}`;
      } else {
        return res.status(401).json({ error: 'Token de autenticación inválido o expirado.' });
      }
    }

    // Load role, active status, and permissions from trusted server repository
    let user = await db.getUserByAuthUid(uid);
    if (!user && email) {
      user = await db.getUserByEmail(email);
      if (user && user.authUid !== uid) {
        user = (await db.updateUser(user.id, { authUid: uid })) || user;
      }
    }

    if (!user) {
      return res.status(403).json({ error: 'Usuario no registrado en el sistema vocacional IPCA.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Cuenta inactiva. Contacte a la coordinación de IPCA.' });
    }

    req.user = user;
    next();
  } catch (err: any) {
    console.error('Error en authenticateToken:', err);
    return res.status(401).json({ error: 'Error al verificar autenticación.' });
  }
}

function requireRole(allowedRoles: Array<'student' | 'teacher' | 'technical_admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado. No dispone de los permisos requeridos para esta sección.',
      });
    }
    next();
  };
}

function requireCatalogPermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado.' });
  }
  const isTeacher = req.user.role === 'teacher';
  const isAdmin = req.user.role === 'technical_admin';
  const isAuthorizedStudent =
    req.user.role === 'student' && req.user.permissions.includes('manage_catalog');

  if (isTeacher || isAdmin || isAuthorizedStudent) {
    return next();
  }

  return res.status(403).json({
    error: 'Acceso denegado: Se requiere permiso de gestión de catálogo.',
  });
}

// --- MINIMAL HEALTH CHECK ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// --- DIRECT FIRESTORE & AUTH VERIFICATION CHECK ---
app.get('/api/system/firestore-check', async (_req, res) => {
  try {
    const products = await db.getProducts();
    const users = await db.getUsers();
    res.json({
      status: 'ok',
      firebaseAdminProject: 'mini-ipca-store',
      firestoreProject: 'mini-ipca-store',
      databaseId: '(default)',
      provider: db.getProviderName(),
      productsCount: products.length,
      usersCount: users.length,
      testRead: products.length > 0 ? `Leídos ${products.length} productos correctamente` : 'Colección vacía',
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      firebaseAdminProject: 'mini-ipca-store',
      firestoreProject: 'mini-ipca-store',
      databaseId: '(default)',
      error: err.message,
    });
  }
});

// --- AUTHENTICATION & USER PROFILE ---
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado.' });
  const profile =
    req.user.role === 'student' ? await db.getProfileByUserId(req.user.id) : undefined;
  res.json({ user: req.user, profile });
});

app.post('/api/auth/logout', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'Sesión cerrada correctamente.' });
});

// --- PRODUCT CATALOG ENDPOINTS (DENY BY DEFAULT) ---
app.get('/api/products', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const isTeacher = req.user?.role === 'teacher';
  const isAdmin = req.user?.role === 'technical_admin';
  const canManage = req.user?.permissions.includes('manage_catalog');
  const all = await db.getProducts();

  if (isTeacher || isAdmin || canManage) {
    return res.json(all);
  }
  // Standard students receive only active products for the sales counter
  return res.json(all.filter((p) => p.active));
});

app.post(
  '/api/products',
  authenticateToken,
  requireCatalogPermission,
  async (req: AuthenticatedRequest, res: Response) => {
    const { name, priceCents, visualKey, imageUrl, active } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
    }
    const cents = Number(priceCents);
    if (isNaN(cents) || cents < 0 || !Number.isInteger(cents)) {
      return res
        .status(400)
        .json({ error: 'El precio debe ser un número entero de centavos mayor o igual a cero.' });
    }

    const created = await db.createProduct({
      name: name.trim(),
      priceCents: cents,
      visualKey: visualKey || 'default',
      imageUrl: imageUrl || '',
      active: active !== undefined ? Boolean(active) : true,
      updatedBy: req.user?.displayName || 'sistema',
    });

    res.status(201).json(created);
  }
);

app.put(
  '/api/products/:id',
  authenticateToken,
  requireCatalogPermission,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = await db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const { name, priceCents, visualKey, imageUrl, active } = req.body;
    const updates: any = {
      updatedBy: req.user?.displayName || 'sistema',
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
      }
      updates.name = name.trim();
    }

    if (priceCents !== undefined) {
      const cents = Number(priceCents);
      if (isNaN(cents) || cents < 0 || !Number.isInteger(cents)) {
        return res
          .status(400)
          .json({ error: 'El precio debe ser un número entero de centavos válido.' });
      }
      updates.priceCents = cents;
    }

    if (visualKey !== undefined) updates.visualKey = visualKey;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (active !== undefined) updates.active = Boolean(active);

    const updated = await db.updateProduct(id, updates);
    res.json(updated);
  }
);

app.patch(
  '/api/products/:id/toggle-active',
  authenticateToken,
  requireCatalogPermission,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = await db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const updated = await db.updateProduct(id, {
      active: !existing.active,
      updatedBy: req.user?.displayName || 'sistema',
    });
    res.json(updated);
  }
);

// --- ACTIVITIES ENDPOINTS ---
app.get('/api/activities', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  const activities = await db.getActivities();
  const products = await db.getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  const enriched = activities.map((act) => {
    let calculatedTotalCents = 0;
    let hasInactive = false;

    const itemsDetail = act.lineItems.map((item) => {
      const prod = productMap.get(item.productId);
      const priceCents = prod ? prod.priceCents : 0;
      calculatedTotalCents += priceCents * item.quantity;
      if (!prod || !prod.active) {
        hasInactive = true;
      }
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Producto no disponible',
        quantity: item.quantity,
        unitPriceCents: priceCents,
        subtotalCents: priceCents * item.quantity,
        active: prod ? prod.active : false,
      };
    });

    const expectedChangeCents = Math.max(0, act.paymentAmountCents - calculatedTotalCents);

    return {
      ...act,
      itemsDetail,
      expectedTotalCents: calculatedTotalCents,
      expectedChangeCents,
      hasInactiveProduct: hasInactive,
    };
  });

  res.json(enriched);
});

app.put(
  '/api/activities/:id',
  authenticateToken,
  requireRole(['teacher', 'technical_admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = await db.getActivityById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Actividad no encontrada.' });
    }

    const { difficulty, helpLevel, paymentAmountCents, instruction, title, active } = req.body;
    const updates: any = {};
    if (difficulty) updates.difficulty = difficulty;
    if (helpLevel) updates.helpLevel = helpLevel;
    if (paymentAmountCents !== undefined) updates.paymentAmountCents = Number(paymentAmountCents);
    if (instruction) updates.instruction = instruction;
    if (title) updates.title = title;
    if (active !== undefined) updates.active = Boolean(active);

    const updated = await db.updateActivity(id, updates);
    res.json(updated);
  }
);

// --- STUDENT PROFILES & SUPPORTS CONFIG ---
app.get('/api/profiles/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  if (req.user?.role === 'student' && req.user.id !== userId) {
    return res.status(403).json({ error: 'No autorizado para ver este perfil.' });
  }
  const profile = await db.getProfileByUserId(userId);
  res.json(profile);
});

app.put(
  '/api/profiles/:userId',
  authenticateToken,
  requireRole(['teacher', 'technical_admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;
    const updated = await db.updateProfile(userId, updates);
    res.json(updated);
  }
);

// --- RESULTS & REPORTING ---
app.get('/api/results', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const all = await db.getResults();
  if (req.user?.role === 'student') {
    return res.json(all.filter((r) => r.studentId === req.user?.id));
  }
  return res.json(all);
});

app.post('/api/results', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const {
    activityId,
    moduleType,
    activityType,
    difficulty,
    generatedOrderId,
    lineItemsSnapshot,
    totalExpectedCents,
    totalAnsweredCents,
    paymentAmountCents,
    changeExpectedCents,
    changeAnsweredCents,
    attempts,
    correct,
    supportsUsed,
  } = req.body;

  if (!activityId) {
    return res.status(400).json({ error: 'Falta activityId para registrar el resultado.' });
  }

  const resultData: any = {
    studentId: req.user?.id || 'anonimo',
    studentName: req.user?.displayName || 'Estudiante',
    activityId,
    lineItemsSnapshot: Array.isArray(lineItemsSnapshot) ? lineItemsSnapshot : [],
    totalExpectedCents: totalExpectedCents !== undefined ? Number(totalExpectedCents) : 0,
    totalAnsweredCents: totalAnsweredCents !== undefined ? Number(totalAnsweredCents) : 0,
    paymentAmountCents: paymentAmountCents !== undefined ? Number(paymentAmountCents) : 0,
    changeExpectedCents: changeExpectedCents !== undefined ? Number(changeExpectedCents) : 0,
    changeAnsweredCents: changeAnsweredCents !== undefined ? Number(changeAnsweredCents) : 0,
    attempts: Number(attempts) || 1,
    correct: Boolean(correct),
    supportsUsed: Array.isArray(supportsUsed) ? supportsUsed : [],
  };

  if (moduleType) resultData.moduleType = String(moduleType);
  if (activityType) resultData.activityType = String(activityType);
  if (difficulty) resultData.difficulty = difficulty;
  if (generatedOrderId) resultData.generatedOrderId = String(generatedOrderId);

  const saved = await db.saveResult(resultData);
  res.status(201).json(saved);
});

// --- USER & ROLES MANAGEMENT ---
app.get(
  '/api/users',
  authenticateToken,
  requireRole(['technical_admin', 'teacher']),
  async (req: AuthenticatedRequest, res: Response) => {
    const allUsers = await db.getUsers();
    if (req.user?.role === 'teacher') {
      // Teachers only see students
      return res.json(allUsers.filter((u) => u.role === 'student'));
    }
    res.json(allUsers);
  }
);

app.post(
  '/api/users',
  authenticateToken,
  requireRole(['technical_admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { username, email, displayName, role, permissions, active, temporaryPassword } = req.body;
    if (!username || !email || !displayName || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar el usuario.' });
    }

    if (!['student', 'teacher', 'technical_admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol no válido. Solo se permiten student, teacher o technical_admin.' });
    }

    if (!temporaryPassword || typeof temporaryPassword !== 'string' || temporaryPassword.length < 6) {
      return res.status(400).json({
        error: 'La contraseña temporal es obligatoria y debe tener al menos 6 caracteres.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    // Restrict permissions to known valid values
    const allowedPermissions = ['manage_catalog'];
    const safePermissions = Array.isArray(permissions)
      ? permissions.filter((p: string) => allowedPermissions.includes(p))
      : [];

    // Check if email or username already exists in repository
    const existingByEmail = await db.getUserByEmail(cleanEmail);
    if (existingByEmail) {
      return res.status(409).json({ error: 'Ya existe un usuario con este correo electrónico.' });
    }
    const allUsers = await db.getUsers();
    if (allUsers.some((u) => u.username === cleanUsername)) {
      return res.status(409).json({ error: 'Ya existe un usuario con este nombre de acceso institucional.' });
    }

    let createdAuthUid: string | null = null;
    let authUserCreated = false;

    try {
      // 1. Create real Firebase Authentication identity
      const auth = getAuth();
      const fbUser = await auth.createUser({
        email: cleanEmail,
        password: temporaryPassword,
        displayName: cleanDisplayName,
        emailVerified: true,
      });
      createdAuthUid = fbUser.uid;
      authUserCreated = true;

      // 2. Create application metadata in repository with returned Firebase Auth UID
      const created = await db.createUser({
        authUid: fbUser.uid,
        username: cleanUsername,
        email: cleanEmail,
        displayName: cleanDisplayName,
        role,
        permissions: safePermissions,
        active: active !== undefined ? Boolean(active) : true,
      });

      // If student, create default educational scaffolding profile
      if (role === 'student') {
        await db.updateProfile(created.id, {
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
        });
      }

      res.status(201).json(created);
    } catch (err: any) {
      // Rollback Firebase Auth user if repository metadata creation failed
      if (authUserCreated && createdAuthUid) {
        try {
          await getAuth().deleteUser(createdAuthUid);
          console.log(`Rollback ejecutado: cuenta Firebase Auth ${createdAuthUid} eliminada por fallo en persistencia.`);
        } catch (delErr) {
          console.error('Error al realizar rollback de usuario en Firebase Auth:', delErr);
        }
      }

      if (err.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado en Firebase Authentication.' });
      }

      // Dev fallback if Firebase Admin is in local offline test mode or Identity Toolkit pending in GCP
      if (
        process.env.NODE_ENV !== 'production' &&
        !authUserCreated &&
        (err.code === 'auth/network-request-failed' ||
          err.message?.includes('credential') ||
          err.message?.includes('network') ||
          err.message?.includes('identitytoolkit'))
      ) {
        console.warn('Firebase Admin offline en modo desarrollo; creando usuario local dev:', err.message);
        const devUid = `dev_uid_${cleanUsername}`;
        const created = await db.createUser({
          authUid: devUid,
          username: cleanUsername,
          email: cleanEmail,
          displayName: cleanDisplayName,
          role,
          permissions: safePermissions,
          active: active !== undefined ? Boolean(active) : true,
        });
        if (role === 'student') {
          await db.updateProfile(created.id, {
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
          });
        }
        return res.status(201).json(created);
      }

      console.error('Error al crear usuario institucional:', err);
      res.status(500).json({ error: err.message || 'Error al crear la cuenta en Firebase Authentication.' });
    }
  }
);

app.patch('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const target = await db.getUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  // Teacher can only toggle 'manage_catalog' for students
  if (req.user?.role === 'teacher') {
    if (target.role !== 'student') {
      return res.status(403).json({ error: 'Los docentes solo pueden gestionar permisos de estudiantes.' });
    }
    const { permissions } = req.body;
    if (permissions !== undefined) {
      const updated = await db.updateUser(id, { permissions });
      return res.json(updated);
    }
    return res.status(400).json({ error: 'Operación no permitida.' });
  }

  if (req.user?.role !== 'technical_admin') {
    return res.status(403).json({ error: 'Se requieren privilegios de administrador técnico.' });
  }

  const updates = req.body;

  // When active state changes, sync disabled status to Firebase Authentication
  if (updates.active !== undefined && target.authUid) {
    try {
      await getAuth().updateUser(target.authUid, { disabled: !updates.active });
    } catch (authErr: any) {
      console.warn(`No se pudo sincronizar estado disabled en Firebase Auth para ${target.authUid}:`, authErr.message);
    }
  }

  const updated = await db.updateUser(id, updates);
  res.json(updated);
});

// --- SENSITIVE SYSTEM ENDPOINTS (AUTHENTICATED TECHNICAL ADMIN ONLY) ---
app.get(
  '/api/system/status',
  authenticateToken,
  requireRole(['technical_admin']),
  async (_req: AuthenticatedRequest, res: Response) => {
    res.json({
      appStatus: 'operativo',
      backendApi: 'operativo',
      database: db.getProviderName(),
      authStatus: 'firebase_admin_token_verification',
      persistenceProvider: db.getProviderName(),
      version: '2.1.0-secure',
      productsCount: (await db.getProducts()).length,
      timestamp: new Date().toISOString(),
    });
  }
);

app.post(
  '/api/system/reset-demo',
  authenticateToken,
  requireRole(['technical_admin']),
  async (_req: AuthenticatedRequest, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'El reinicio de demostración está deshabilitado en entornos de producción.',
      });
    }
    await db.resetToDefaults();
    res.json({ message: 'Datos restaurados a valores iniciales de demostración.' });
  }
);

// --- STATIC VITE ASSETS (PROD) & VITE MIDDLEWARE (DEV) ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction || fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mini-IPCA Store escuchando en http://0.0.0.0:${PORT} [Provider: ${db.getProviderName()}]`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor Mini-IPCA Store:', err);
});
