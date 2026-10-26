import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db, UserRecord } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT && process.env.PORT !== '8080' ? Number(process.env.PORT) : 3000;

app.use(express.json());

// In-memory active session tokens mapped to user IDs
const ACTIVE_SESSIONS = new Map<string, { userId: string; createdAt: number }>();

// Seed default active sessions for immediate demo convenience
function createSessionForUser(userId: string): string {
  const token = `ipca_tk_${crypto.randomBytes(24).toString('hex')}`;
  ACTIVE_SESSIONS.set(token, { userId, createdAt: Date.now() });
  return token;
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autenticado. Inicie sesión.' });
  }

  const token = authHeader.split(' ')[1];
  const session = ACTIVE_SESSIONS.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Sesión expirada o inválida. Inicie sesión nuevamente.' });
  }

  const user = db.getUserById(session.userId);
  if (!user || !user.active) {
    ACTIVE_SESSIONS.delete(token);
    return res.status(403).json({ error: 'Usuario no encontrado o cuenta inactiva.' });
  }

  req.user = user;
  next();
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

// --- AUTHENTICATION ENDPOINTS ---

// P01: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario o contraseña incorrectos. Intenta nuevamente.' });
  }

  const user = db.getUserByLogin(String(username));
  if (!user) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos. Intenta nuevamente.' });
  }

  // Password verification
  if (user.passwordHash !== password.trim()) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos. Intenta nuevamente.' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Cuenta inactiva. Contacte a la coordinación de IPCA.' });
  }

  const token = createSessionForUser(user.id);
  const profile = user.role === 'student' ? db.getProfileByUserId(user.id) : undefined;

  const { passwordHash, ...safeUser } = user;
  return res.json({
    token,
    user: safeUser,
    profile,
  });
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    ACTIVE_SESSIONS.delete(token);
  }
  res.json({ message: 'Sesión cerrada correctamente.' });
});

// Current User Session
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado.' });
  const { passwordHash, ...safeUser } = req.user;
  const profile = req.user.role === 'student' ? db.getProfileByUserId(req.user.id) : undefined;
  res.json({ user: safeUser, profile });
});

// --- PRODUCT CATALOG ENDPOINTS ---

// GET /api/products
// Students receive ONLY active products. Teachers/Admins/Authorized students receive all.
app.get('/api/products', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  let isPrivileged = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = ACTIVE_SESSIONS.get(token);
    if (session) {
      const user = db.getUserById(session.userId);
      if (
        user &&
        (user.role === 'teacher' ||
          user.role === 'technical_admin' ||
          user.permissions.includes('manage_catalog'))
      ) {
        isPrivileged = true;
      }
    }
  }

  const all = db.getProducts();
  if (isPrivileged) {
    return res.json(all);
  }
  // Return only active products for students / unauthenticated views
  return res.json(all.filter((p) => p.active));
});

// POST /api/products (Create product)
app.post(
  '/api/products',
  authenticateToken,
  requireCatalogPermission,
  (req: AuthenticatedRequest, res: Response) => {
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

    const created = db.createProduct({
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

// PUT /api/products/:id (Update product details, e.g. price change)
app.put(
  '/api/products/:id',
  authenticateToken,
  requireCatalogPermission,
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = db.getProductById(id);
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

    const updated = db.updateProduct(id, updates);
    res.json(updated);
  }
);

// PATCH /api/products/:id/toggle-active (Soft deactivate/activate)
app.patch(
  '/api/products/:id/toggle-active',
  authenticateToken,
  requireCatalogPermission,
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const updated = db.updateProduct(id, {
      active: !existing.active,
      updatedBy: req.user?.displayName || 'sistema',
    });
    res.json(updated);
  }
);

// --- ACTIVITIES ENDPOINTS ---

// GET /api/activities (Dynamic calculation based on current product prices)
app.get('/api/activities', (_req: Request, res: Response) => {
  const activities = db.getActivities();
  const products = db.getProducts();
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

// PUT /api/activities/:id (Teacher updates configuration)
app.put(
  '/api/activities/:id',
  authenticateToken,
  requireRole(['teacher', 'technical_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const existing = db.getActivityById(id);
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

    const updated = db.updateActivity(id, updates);
    res.json(updated);
  }
);

// --- STUDENT PROFILES & SUPPORTS CONFIG ---

// GET /api/profiles/:userId
app.get(
  '/api/profiles/:userId',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    if (req.user?.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ error: 'No autorizado para ver este perfil.' });
    }
    const profile = db.getProfileByUserId(userId);
    res.json(profile);
  }
);

// PUT /api/profiles/:userId (Update supports, scaffolding, visual preferences)
app.put(
  '/api/profiles/:userId',
  authenticateToken,
  requireRole(['teacher', 'technical_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;
    const updated = db.updateProfile(userId, updates);
    res.json(updated);
  }
);

// --- RESULTS & REPORTING ---

// GET /api/results
app.get(
  '/api/results',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const all = db.getResults();
    if (req.user?.role === 'student') {
      // Students see only their own results
      return res.json(all.filter((r) => r.studentId === req.user?.id));
    }
    // Teachers and Technical Admins see all results
    return res.json(all);
  }
);

// POST /api/results (Complete sale training record with exact snapshot of prices)
app.post(
  '/api/results',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const {
      activityId,
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

    if (!activityId || !lineItemsSnapshot || totalExpectedCents === undefined) {
      return res.status(400).json({ error: 'Datos incompletos para registrar el resultado.' });
    }

    const saved = db.saveResult({
      studentId: req.user?.id || 'anonimo',
      studentName: req.user?.displayName || 'Estudiante',
      activityId,
      lineItemsSnapshot,
      totalExpectedCents: Number(totalExpectedCents),
      totalAnsweredCents: Number(totalAnsweredCents),
      paymentAmountCents: Number(paymentAmountCents),
      changeExpectedCents: Number(changeExpectedCents),
      changeAnsweredCents: Number(changeAnsweredCents),
      attempts: Number(attempts) || 1,
      correct: Boolean(correct),
      supportsUsed: Array.isArray(supportsUsed) ? supportsUsed : [],
    });

    res.status(201).json(saved);
  }
);

// --- USER & ROLES MANAGEMENT (Technical Admin only) ---

app.get(
  '/api/users',
  authenticateToken,
  requireRole(['technical_admin', 'teacher']),
  (req: AuthenticatedRequest, res: Response) => {
    const users = db.getUsers().map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    res.json(users);
  }
);

app.post(
  '/api/users',
  authenticateToken,
  requireRole(['technical_admin']),
  (req: AuthenticatedRequest, res: Response) => {
    const { username, email, displayName, role, permissions, active, password } = req.body;
    if (!username || !email || !displayName || !role || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para crear el usuario.' });
    }

    if (!['student', 'teacher', 'technical_admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol no válido.' });
    }

    const created = db.createUser({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash: password.trim(),
      displayName: displayName.trim(),
      role,
      permissions: Array.isArray(permissions) ? permissions : [],
      active: active !== undefined ? Boolean(active) : true,
    });

    const { passwordHash: _, ...safe } = created;
    res.status(201).json(safe);
  }
);

app.patch(
  '/api/users/:id',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const target = db.getUserById(id);
    if (!target) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Role check: Technical admin can update anything.
    // Teacher can only toggle 'manage_catalog' for students.
    if (req.user?.role === 'teacher') {
      if (target.role !== 'student') {
        return res.status(403).json({ error: 'Los docentes solo pueden gestionar permisos de estudiantes.' });
      }
      const { permissions } = req.body;
      if (permissions !== undefined) {
        const updated = db.updateUser(id, { permissions });
        const { passwordHash, ...safe } = updated!;
        return res.json(safe);
      }
      return res.status(400).json({ error: 'Operación no permitida.' });
    }

    if (req.user?.role !== 'technical_admin') {
      return res.status(403).json({ error: 'Se requieren privilegios de administrador técnico.' });
    }

    const updates = req.body;
    if (updates.password) {
      updates.passwordHash = updates.password;
      delete updates.password;
    }
    const updated = db.updateUser(id, updates);
    const { passwordHash, ...safe } = updated!;
    res.json(safe);
  }
);

// --- SYSTEM STATUS ---
app.get('/api/system/status', (_req: Request, res: Response) => {
  res.json({
    appStatus: 'operativo',
    backendApi: 'operativo',
    database: 'repositorio_local_ipca (preparado para LAN/Firestore)',
    authStatus: 'autenticacion_segura_ipca',
    persistenceProvider: 'IPCA Storage Repository (JSON / LAN Ready)',
    version: '2.0.0-poc',
    activeSessionsCount: ACTIVE_SESSIONS.size,
    productsCount: db.getProducts().length,
    timestamp: new Date().toISOString(),
  });
});

// Reset demo state for test verification
app.post('/api/system/reset-demo', (_req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ message: 'Datos restaurados a valores iniciales de demostración.' });
});

// Basic health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- VITE MIDDLEWARE (DEV) / STATIC DIST (PROD) ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      app.get('*', (_req, res) => {
        res.status(503).send('Compilando aplicación, espere un momento...');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mini-IPCA Store escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor Mini-IPCA Store:', err);
});
