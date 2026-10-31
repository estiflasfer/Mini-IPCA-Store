// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { getApps as getApps2, initializeApp as initializeApp2 } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// server/repository.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== "mini-ipca-store") {
  delete process.env.GOOGLE_CLOUD_PROJECT;
}
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== "mini-ipca-store") {
  delete process.env.GCLOUD_PROJECT;
}
process.env.FIREBASE_PROJECT_ID = "mini-ipca-store";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var INITIAL_PRODUCTS = [
  { id: "P001", name: "Agua", priceCents: 50, visualKey: "water", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P002", name: "Jugo", priceCents: 80, visualKey: "juice", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P003", name: "Galletas", priceCents: 75, visualKey: "cookies", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P004", name: "Yogur", priceCents: 125, visualKey: "yogurt", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P005", name: "Leche", priceCents: 110, visualKey: "milk", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P006", name: "Pan", priceCents: 40, visualKey: "bread", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P007", name: "Chocolate", priceCents: 90, visualKey: "chocolate", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P008", name: "Papas fritas", priceCents: 100, visualKey: "chips", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P009", name: "Caramelo", priceCents: 10, visualKey: "candy", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" },
  { id: "P010", name: "At\xFAn", priceCents: 150, visualKey: "tuna", active: true, createdAt: "2026-01-01T08:00:00Z", updatedAt: "2026-01-01T08:00:00Z", updatedBy: "admin" }
];
var INITIAL_USERS = [
  {
    id: "user_student_1",
    authUid: "dufItgxNuRhdRgvtlt3At1gXeWg2",
    username: "estudiante.demo",
    email: "estudiante@ipca.edu",
    displayName: "Carlos M. (Estudiante Demo)",
    role: "student",
    permissions: [],
    active: true,
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-01T08:00:00Z"
  },
  {
    id: "user_teacher_1",
    authUid: "nEGhIGevplX2niACiZqbEMnWqrk1",
    username: "docente.demo",
    email: "docente@ipca.edu",
    displayName: "Prof. Mar\xEDa Elena (Docente Demo)",
    role: "teacher",
    permissions: ["manage_catalog"],
    active: true,
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-01T08:00:00Z"
  },
  {
    id: "user_admin_1",
    authUid: "OTYBqIm5zNgCXwW4q14jId2E3L33",
    username: "admin.demo",
    email: "admin@ipca.edu",
    displayName: "Ing. Roberto Silva (Admin Demo)",
    role: "technical_admin",
    permissions: ["manage_catalog"],
    active: true,
    createdAt: "2026-01-01T08:00:00Z",
    updatedAt: "2026-01-01T08:00:00Z"
  }
];
var INITIAL_PROFILES = [
  {
    id: "prof_student_1",
    userId: "user_student_1",
    difficultyLevel: "facil",
    choiceCount: 4,
    showHint: true,
    showExample: true,
    textToSpeechEnabled: true,
    pictogramsEnabled: true,
    socialSupportsEnabled: true,
    scaffoldingLevel: "high",
    largeText: false,
    highContrast: false
  }
];
var INITIAL_ACTIVITIES = [
  {
    id: "ACT-001",
    type: "venta_caja",
    moduleTitle: "Venta y caja",
    title: "Venta en caja: Pedido b\xE1sico",
    instruction: "Un cliente solicita 2 jugos y 1 paquete de galletas.",
    lineItems: [
      { productId: "P002", quantity: 2 },
      { productId: "P003", quantity: 1 }
    ],
    paymentAmountCents: 500,
    difficulty: "facil",
    helpLevel: "high",
    active: true
  },
  {
    id: "ACT-002",
    type: "venta_caja",
    moduleTitle: "Venta y caja",
    title: "Venta en caja: Desayuno escolar",
    instruction: "Un cliente solicita 1 leche y 2 panes.",
    lineItems: [
      { productId: "P005", quantity: 1 },
      { productId: "P006", quantity: 2 }
    ],
    paymentAmountCents: 500,
    difficulty: "facil",
    helpLevel: "high",
    active: true
  },
  {
    id: "ACT-003",
    type: "numeracion",
    moduleTitle: "Numeraci\xF3n y conteo",
    title: "Conteo de unidades de productos",
    instruction: "Un cliente solicita 3 botellas de agua. Cuenta y confirma la cantidad.",
    lineItems: [
      { productId: "P001", quantity: 3 }
    ],
    paymentAmountCents: 200,
    difficulty: "facil",
    helpLevel: "high",
    active: true
  },
  {
    id: "ACT-004",
    type: "operaciones",
    moduleTitle: "Operaciones",
    title: "Suma de dos productos del quiosco",
    instruction: "Un cliente solicita 1 yogur y 1 chocolate.",
    lineItems: [
      { productId: "P004", quantity: 1 },
      { productId: "P007", quantity: 1 }
    ],
    paymentAmountCents: 500,
    difficulty: "medio",
    helpLevel: "medium",
    active: true
  },
  {
    id: "ACT-005",
    type: "tiempo",
    moduleTitle: "Tiempo y horarios",
    title: "Horario de apertura y refrigerio",
    instruction: "El cliente consulta a qu\xE9 hora abre la tienda y pide 1 jugo.",
    lineItems: [
      { productId: "P002", quantity: 1 }
    ],
    paymentAmountCents: 100,
    difficulty: "facil",
    helpLevel: "medium",
    active: true
  },
  {
    id: "ACT-006",
    type: "medidas",
    moduleTitle: "Medidas",
    title: "Selecci\xF3n por tama\xF1o de envase",
    instruction: "El cliente pide 1 botella de agua y 1 lata de at\xFAn.",
    lineItems: [
      { productId: "P001", quantity: 1 },
      { productId: "P010", quantity: 1 }
    ],
    paymentAmountCents: 500,
    difficulty: "facil",
    helpLevel: "medium",
    active: true
  },
  {
    id: "ACT-007",
    type: "problemas",
    moduleTitle: "Problemas funcionales",
    title: "Pedido combinado en recreo",
    instruction: "Un cliente solicita 1 paquete de papas fritas y 2 caramelos.",
    lineItems: [
      { productId: "P008", quantity: 1 },
      { productId: "P009", quantity: 2 }
    ],
    paymentAmountCents: 200,
    difficulty: "medio",
    helpLevel: "low",
    active: true
  }
];
var INITIAL_RESULTS = [];
var JsonRepository = class {
  constructor() {
    const dataDir = path.resolve(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
      }
    }
    this.dbPath = path.join(dataDir, "mini_ipca_store.json");
    this.data = this.load();
  }
  getProviderName() {
    return "JsonRepository (Local file storage)";
  }
  load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.activities) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("JsonRepository: could not read existing file, using defaults:", err);
    }
    const initialData = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)),
      results: JSON.parse(JSON.stringify(INITIAL_RESULTS))
    };
    this.persist(initialData);
    return initialData;
  }
  persist(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.warn("JsonRepository: failed to persist to disk:", err);
    }
  }
  save() {
    this.persist(this.data);
  }
  async getUsers() {
    return this.data.users;
  }
  async getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  async getUserByAuthUid(authUid) {
    return this.data.users.find((u) => u.authUid === authUid);
  }
  async getUserByEmail(email) {
    const clean = email.trim().toLowerCase();
    return this.data.users.find((u) => u.email.toLowerCase() === clean);
  }
  async getUserByLogin(login) {
    const clean = login.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean || clean === "estudiante" && u.role === "student" || clean === "docente" && u.role === "teacher" || clean === "admin" && u.role === "technical_admin"
    );
  }
  async createUser(user) {
    const newRecord = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.users.push(newRecord);
    this.save();
    return newRecord;
  }
  async updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save();
    return this.data.users[idx];
  }
  async getProfileByUserId(userId) {
    let prof = this.data.profiles.find((p) => p.userId === userId);
    if (!prof) {
      prof = {
        id: `prof_${userId}`,
        userId,
        difficultyLevel: "facil",
        choiceCount: 4,
        showHint: true,
        showExample: true,
        textToSpeechEnabled: true,
        pictogramsEnabled: true,
        socialSupportsEnabled: true,
        scaffoldingLevel: "high",
        largeText: false,
        highContrast: false
      };
      this.data.profiles.push(prof);
      this.save();
    }
    return prof;
  }
  async updateProfile(userId, updates) {
    const idx = this.data.profiles.findIndex((p) => p.userId === userId);
    if (idx === -1) {
      const newProf = {
        id: `prof_${userId}`,
        userId,
        difficultyLevel: "facil",
        choiceCount: 4,
        showHint: true,
        showExample: true,
        textToSpeechEnabled: true,
        pictogramsEnabled: true,
        socialSupportsEnabled: true,
        scaffoldingLevel: "high",
        largeText: false,
        highContrast: false,
        ...updates
      };
      this.data.profiles.push(newProf);
      this.save();
      return newProf;
    }
    this.data.profiles[idx] = { ...this.data.profiles[idx], ...updates };
    this.save();
    return this.data.profiles[idx];
  }
  async getProducts() {
    return this.data.products;
  }
  async getProductById(id) {
    return this.data.products.find((p) => p.id === id);
  }
  async createProduct(product) {
    const newRecord = {
      ...product,
      id: `P${String(this.data.products.length + 1).padStart(3, "0")}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.products.push(newRecord);
    this.save();
    return newRecord;
  }
  async updateProduct(id, updates) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save();
    return this.data.products[idx];
  }
  async getActivities() {
    return this.data.activities;
  }
  async getActivityById(id) {
    return this.data.activities.find((a) => a.id === id);
  }
  async updateActivity(id, updates) {
    const idx = this.data.activities.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.activities[idx] = { ...this.data.activities[idx], ...updates };
    this.save();
    return this.data.activities[idx];
  }
  async getResults() {
    return this.data.results;
  }
  async saveResult(result) {
    const newRecord = {
      ...result,
      id: `RES-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.results.unshift(newRecord);
    this.save();
    return newRecord;
  }
  async resetToDefaults() {
    this.data = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)),
      results: JSON.parse(JSON.stringify(INITIAL_RESULTS))
    };
    this.save();
  }
};
var FirestoreRepository = class {
  constructor() {
    this.initialized = false;
    this.fallback = null;
    const projectId = "mini-ipca-store";
    const adminApp = getApps().length ? getApps()[0] : initializeApp({ projectId });
    this.firestore = getFirestore(adminApp);
    console.log(
      `[Mini-IPCA Store] FirestoreRepository conectado a proyecto: ${projectId}, base de datos: (default)`
    );
  }
  getProviderName() {
    if (this.fallback) {
      return "FirestoreRepository (fallback a JsonRepository en desarrollo)";
    }
    return "FirestoreRepository (Google Cloud Firestore)";
  }
  async ensureInitialized() {
    if (this.initialized) return;
    try {
      const productsSnap = await this.firestore.collection("products").limit(1).get();
      if (productsSnap.empty) {
        console.log("FirestoreRepository: initializing collections with demo seed data...");
        const batch = this.firestore.batch();
        for (const p of INITIAL_PRODUCTS) {
          batch.set(this.firestore.collection("products").doc(p.id), p);
        }
        for (const a of INITIAL_ACTIVITIES) {
          batch.set(this.firestore.collection("activities").doc(a.id), a);
        }
        for (const u of INITIAL_USERS) {
          batch.set(this.firestore.collection("users").doc(u.id), u);
        }
        for (const prof of INITIAL_PROFILES) {
          batch.set(this.firestore.collection("profiles").doc(prof.userId), prof);
        }
        for (const res of INITIAL_RESULTS) {
          batch.set(this.firestore.collection("results").doc(res.id), res);
        }
        await batch.commit();
        console.log("FirestoreRepository: initialization complete.");
      }
      this.initialized = true;
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        console.error("FirestoreRepository: Error cr\xEDtico de conexi\xF3n a Firestore en producci\xF3n:", err);
        throw new Error(
          `[Mini-IPCA Store] Error cr\xEDtico en Firestore: No se pudo conectar a Cloud Firestore en producci\xF3n (${err.message}). Verifique que la API de Cloud Firestore est\xE9 habilitada en el proyecto de GCP.`
        );
      }
      console.warn(
        `[Mini-IPCA Store] Aviso en desarrollo: No se pudo conectar a Cloud Firestore (${err.message}). Cambiando a JsonRepository como contingencia de desarrollo local.`
      );
      this.fallback = new JsonRepository();
      this.initialized = true;
    }
  }
  async getUsers() {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getUsers();
    const snap = await this.firestore.collection("users").get();
    return snap.docs.map((d) => d.data());
  }
  async getUserById(id) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getUserById(id);
    const doc = await this.firestore.collection("users").doc(id).get();
    if (!doc.exists) return void 0;
    return doc.data();
  }
  async getUserByAuthUid(authUid) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getUserByAuthUid(authUid);
    const snap = await this.firestore.collection("users").where("authUid", "==", authUid).limit(1).get();
    if (snap.empty) return void 0;
    return snap.docs[0].data();
  }
  async getUserByEmail(email) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getUserByEmail(email);
    const clean = email.trim().toLowerCase();
    const snap = await this.firestore.collection("users").where("email", "==", clean).limit(1).get();
    if (snap.empty) return void 0;
    return snap.docs[0].data();
  }
  async getUserByLogin(login) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getUserByLogin(login);
    const clean = login.trim().toLowerCase();
    let snap = await this.firestore.collection("users").where("username", "==", clean).limit(1).get();
    if (!snap.empty) return snap.docs[0].data();
    snap = await this.firestore.collection("users").where("email", "==", clean).limit(1).get();
    if (!snap.empty) return snap.docs[0].data();
    if (["estudiante", "docente", "admin"].includes(clean)) {
      const roleMap = {
        estudiante: "student",
        docente: "teacher",
        admin: "technical_admin"
      };
      snap = await this.firestore.collection("users").where("role", "==", roleMap[clean]).limit(1).get();
      if (!snap.empty) return snap.docs[0].data();
    }
    return void 0;
  }
  async createUser(user) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.createUser(user);
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord = {
      ...user,
      id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.firestore.collection("users").doc(id).set(newRecord);
    return newRecord;
  }
  async updateUser(id, updates) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.updateUser(id, updates);
    const ref = this.firestore.collection("users").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const merged = {
      ...doc.data(),
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await ref.set(merged, { merge: true });
    return merged;
  }
  async getProfileByUserId(userId) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getProfileByUserId(userId);
    const doc = await this.firestore.collection("profiles").doc(userId).get();
    if (doc.exists) {
      return doc.data();
    }
    const defaultProf = {
      id: `prof_${userId}`,
      userId,
      difficultyLevel: "facil",
      choiceCount: 4,
      showHint: true,
      showExample: true,
      textToSpeechEnabled: true,
      pictogramsEnabled: true,
      socialSupportsEnabled: true,
      scaffoldingLevel: "high",
      largeText: false,
      highContrast: false
    };
    await this.firestore.collection("profiles").doc(userId).set(defaultProf);
    return defaultProf;
  }
  async updateProfile(userId, updates) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.updateProfile(userId, updates);
    const ref = this.firestore.collection("profiles").doc(userId);
    const doc = await ref.get();
    const existing = doc.exists ? doc.data() : {
      id: `prof_${userId}`,
      userId,
      difficultyLevel: "facil",
      choiceCount: 4,
      showHint: true,
      showExample: true,
      textToSpeechEnabled: true,
      pictogramsEnabled: true,
      socialSupportsEnabled: true,
      scaffoldingLevel: "high",
      largeText: false,
      highContrast: false
    };
    const merged = { ...existing, ...updates };
    await ref.set(merged, { merge: true });
    return merged;
  }
  async getProducts() {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getProducts();
    const snap = await this.firestore.collection("products").get();
    return snap.docs.map((d) => d.data());
  }
  async getProductById(id) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getProductById(id);
    const doc = await this.firestore.collection("products").doc(id).get();
    if (!doc.exists) return void 0;
    return doc.data();
  }
  async createProduct(product) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.createProduct(product);
    const all = await this.getProducts();
    const id = `P${String(all.length + 1).padStart(3, "0")}`;
    const newRecord = {
      ...product,
      id,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.firestore.collection("products").doc(id).set(newRecord);
    return newRecord;
  }
  async updateProduct(id, updates) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.updateProduct(id, updates);
    const ref = this.firestore.collection("products").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const merged = {
      ...doc.data(),
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await ref.set(merged, { merge: true });
    return merged;
  }
  async getActivities() {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getActivities();
    const snap = await this.firestore.collection("activities").get();
    return snap.docs.map((d) => d.data());
  }
  async getActivityById(id) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getActivityById(id);
    const doc = await this.firestore.collection("activities").doc(id).get();
    if (!doc.exists) return void 0;
    return doc.data();
  }
  async updateActivity(id, updates) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.updateActivity(id, updates);
    const ref = this.firestore.collection("activities").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const merged = { ...doc.data(), ...updates };
    await ref.set(merged, { merge: true });
    return merged;
  }
  async getResults() {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.getResults();
    const snap = await this.firestore.collection("results").orderBy("completedAt", "desc").get();
    return snap.docs.map((d) => d.data());
  }
  async saveResult(result) {
    await this.ensureInitialized();
    if (this.fallback) return this.fallback.saveResult(result);
    const id = `RES-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    const newRecord = {
      ...result,
      id,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.firestore.collection("results").doc(id).set(newRecord);
    return newRecord;
  }
  async resetToDefaults() {
    if (this.fallback) return this.fallback.resetToDefaults();
    const batch = this.firestore.batch();
    for (const p of INITIAL_PRODUCTS) {
      batch.set(this.firestore.collection("products").doc(p.id), p);
    }
    for (const a of INITIAL_ACTIVITIES) {
      batch.set(this.firestore.collection("activities").doc(a.id), a);
    }
    for (const u of INITIAL_USERS) {
      batch.set(this.firestore.collection("users").doc(u.id), u);
    }
    for (const prof of INITIAL_PROFILES) {
      batch.set(this.firestore.collection("profiles").doc(prof.userId), prof);
    }
    for (const res of INITIAL_RESULTS) {
      batch.set(this.firestore.collection("results").doc(res.id), res);
    }
    await batch.commit();
  }
};
function createRepository() {
  const provider = (process.env.DATA_PROVIDER || "").toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";
  if (provider === "firestore" || isProduction) {
    try {
      return new FirestoreRepository();
    } catch (err) {
      if (isProduction) {
        console.error("Error cr\xEDtico al inicializar FirestoreRepository en producci\xF3n:", err);
        throw new Error(
          `[Mini-IPCA Store] Error cr\xEDtico: No se pudo inicializar FirestoreRepository en producci\xF3n (${err.message})`
        );
      }
      console.warn("Fallo al inicializar FirestoreRepository; usando JsonRepository en desarrollo:", err);
      return new JsonRepository();
    }
  }
  return new JsonRepository();
}
var db = createRepository();

// server.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== "mini-ipca-store") {
  delete process.env.GOOGLE_CLOUD_PROJECT;
}
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== "mini-ipca-store") {
  delete process.env.GCLOUD_PROJECT;
}
process.env.FIREBASE_PROJECT_ID = "mini-ipca-store";
var targetProjectId = "mini-ipca-store";
if (!getApps2().length) {
  try {
    initializeApp2({ projectId: targetProjectId });
    console.log(`[Mini-IPCA Store] Firebase Admin SDK inicializado para proyecto: ${targetProjectId}`);
  } catch (err) {
    console.warn("Firebase Admin initializeApp warning:", err);
  }
}
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json());
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso no autenticado. Inicie sesi\xF3n." });
  }
  const idToken = authHeader.split(" ")[1];
  if (!idToken) {
    return res.status(401).json({ error: "Token de autorizaci\xF3n ausente." });
  }
  try {
    let uid;
    let email;
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      uid = decodedToken.uid;
      email = decodedToken.email;
    } catch (verifyErr) {
      if (process.env.NODE_ENV !== "production" && idToken.startsWith("dev_token_")) {
        const emailFromToken = idToken.replace("dev_token_", "");
        email = emailFromToken;
        uid = `uid_${emailFromToken}`;
      } else {
        return res.status(401).json({ error: "Token de autenticaci\xF3n inv\xE1lido o expirado." });
      }
    }
    let user = await db.getUserByAuthUid(uid);
    if (!user && email) {
      user = await db.getUserByEmail(email);
      if (user && user.authUid !== uid) {
        user = await db.updateUser(user.id, { authUid: uid }) || user;
      }
    }
    if (!user) {
      return res.status(403).json({ error: "Usuario no registrado en el sistema vocacional IPCA." });
    }
    if (!user.active) {
      return res.status(403).json({ error: "Cuenta inactiva. Contacte a la coordinaci\xF3n de IPCA." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Error en authenticateToken:", err);
    return res.status(401).json({ error: "Error al verificar autenticaci\xF3n." });
  }
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Acceso denegado. No dispone de los permisos requeridos para esta secci\xF3n."
      });
    }
    next();
  };
}
function requireCatalogPermission(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado." });
  }
  const isTeacher = req.user.role === "teacher";
  const isAdmin = req.user.role === "technical_admin";
  const isAuthorizedStudent = req.user.role === "student" && req.user.permissions.includes("manage_catalog");
  if (isTeacher || isAdmin || isAuthorizedStudent) {
    return next();
  }
  return res.status(403).json({
    error: "Acceso denegado: Se requiere permiso de gesti\xF3n de cat\xE1logo."
  });
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/system/firestore-check", async (_req, res) => {
  try {
    const products = await db.getProducts();
    const users = await db.getUsers();
    res.json({
      status: "ok",
      firebaseAdminProject: "mini-ipca-store",
      firestoreProject: "mini-ipca-store",
      databaseId: "(default)",
      provider: db.getProviderName(),
      productsCount: products.length,
      usersCount: users.length,
      testRead: products.length > 0 ? `Le\xEDdos ${products.length} productos correctamente` : "Colecci\xF3n vac\xEDa"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      firebaseAdminProject: "mini-ipca-store",
      firestoreProject: "mini-ipca-store",
      databaseId: "(default)",
      error: err.message
    });
  }
});
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado." });
  const profile = req.user.role === "student" ? await db.getProfileByUserId(req.user.id) : void 0;
  res.json({ user: req.user, profile });
});
app.post("/api/auth/logout", authenticateToken, (_req, res) => {
  res.json({ message: "Sesi\xF3n cerrada correctamente." });
});
app.get("/api/products", authenticateToken, async (req, res) => {
  const isTeacher = req.user?.role === "teacher";
  const isAdmin = req.user?.role === "technical_admin";
  const canManage = req.user?.permissions.includes("manage_catalog");
  const all = await db.getProducts();
  if (isTeacher || isAdmin || canManage) {
    return res.json(all);
  }
  return res.json(all.filter((p) => p.active));
});
app.post(
  "/api/products",
  authenticateToken,
  requireCatalogPermission,
  async (req, res) => {
    const { name, priceCents, visualKey, imageUrl, active } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "El nombre del producto es obligatorio." });
    }
    const cents = Number(priceCents);
    if (isNaN(cents) || cents < 0 || !Number.isInteger(cents)) {
      return res.status(400).json({ error: "El precio debe ser un n\xFAmero entero de centavos mayor o igual a cero." });
    }
    const created = await db.createProduct({
      name: name.trim(),
      priceCents: cents,
      visualKey: visualKey || "default",
      imageUrl: imageUrl || "",
      active: active !== void 0 ? Boolean(active) : true,
      updatedBy: req.user?.displayName || "sistema"
    });
    res.status(201).json(created);
  }
);
app.put(
  "/api/products/:id",
  authenticateToken,
  requireCatalogPermission,
  async (req, res) => {
    const { id } = req.params;
    const existing = await db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }
    const { name, priceCents, visualKey, imageUrl, active } = req.body;
    const updates = {
      updatedBy: req.user?.displayName || "sistema"
    };
    if (name !== void 0) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "El nombre no puede estar vac\xEDo." });
      }
      updates.name = name.trim();
    }
    if (priceCents !== void 0) {
      const cents = Number(priceCents);
      if (isNaN(cents) || cents < 0 || !Number.isInteger(cents)) {
        return res.status(400).json({ error: "El precio debe ser un n\xFAmero entero de centavos v\xE1lido." });
      }
      updates.priceCents = cents;
    }
    if (visualKey !== void 0) updates.visualKey = visualKey;
    if (imageUrl !== void 0) updates.imageUrl = imageUrl;
    if (active !== void 0) updates.active = Boolean(active);
    const updated = await db.updateProduct(id, updates);
    res.json(updated);
  }
);
app.patch(
  "/api/products/:id/toggle-active",
  authenticateToken,
  requireCatalogPermission,
  async (req, res) => {
    const { id } = req.params;
    const existing = await db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }
    const updated = await db.updateProduct(id, {
      active: !existing.active,
      updatedBy: req.user?.displayName || "sistema"
    });
    res.json(updated);
  }
);
app.get("/api/activities", authenticateToken, async (_req, res) => {
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
        productName: prod ? prod.name : "Producto no disponible",
        quantity: item.quantity,
        unitPriceCents: priceCents,
        subtotalCents: priceCents * item.quantity,
        active: prod ? prod.active : false
      };
    });
    const expectedChangeCents = Math.max(0, act.paymentAmountCents - calculatedTotalCents);
    return {
      ...act,
      itemsDetail,
      expectedTotalCents: calculatedTotalCents,
      expectedChangeCents,
      hasInactiveProduct: hasInactive
    };
  });
  res.json(enriched);
});
app.put(
  "/api/activities/:id",
  authenticateToken,
  requireRole(["teacher", "technical_admin"]),
  async (req, res) => {
    const { id } = req.params;
    const existing = await db.getActivityById(id);
    if (!existing) {
      return res.status(404).json({ error: "Actividad no encontrada." });
    }
    const { difficulty, helpLevel, paymentAmountCents, instruction, title, active } = req.body;
    const updates = {};
    if (difficulty) updates.difficulty = difficulty;
    if (helpLevel) updates.helpLevel = helpLevel;
    if (paymentAmountCents !== void 0) updates.paymentAmountCents = Number(paymentAmountCents);
    if (instruction) updates.instruction = instruction;
    if (title) updates.title = title;
    if (active !== void 0) updates.active = Boolean(active);
    const updated = await db.updateActivity(id, updates);
    res.json(updated);
  }
);
app.get("/api/profiles/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  if (req.user?.role === "student" && req.user.id !== userId) {
    return res.status(403).json({ error: "No autorizado para ver este perfil." });
  }
  const profile = await db.getProfileByUserId(userId);
  res.json(profile);
});
app.put(
  "/api/profiles/:userId",
  authenticateToken,
  requireRole(["teacher", "technical_admin"]),
  async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;
    const updated = await db.updateProfile(userId, updates);
    res.json(updated);
  }
);
app.get("/api/results", authenticateToken, async (req, res) => {
  const all = await db.getResults();
  if (req.user?.role === "student") {
    return res.json(all.filter((r) => r.studentId === req.user?.id));
  }
  return res.json(all);
});
app.post("/api/results", authenticateToken, async (req, res) => {
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
    supportsUsed
  } = req.body;
  if (!activityId) {
    return res.status(400).json({ error: "Falta activityId para registrar el resultado." });
  }
  const resultData = {
    studentId: req.user?.id || "anonimo",
    studentName: req.user?.displayName || "Estudiante",
    activityId,
    lineItemsSnapshot: Array.isArray(lineItemsSnapshot) ? lineItemsSnapshot : [],
    totalExpectedCents: totalExpectedCents !== void 0 ? Number(totalExpectedCents) : 0,
    totalAnsweredCents: totalAnsweredCents !== void 0 ? Number(totalAnsweredCents) : 0,
    paymentAmountCents: paymentAmountCents !== void 0 ? Number(paymentAmountCents) : 0,
    changeExpectedCents: changeExpectedCents !== void 0 ? Number(changeExpectedCents) : 0,
    changeAnsweredCents: changeAnsweredCents !== void 0 ? Number(changeAnsweredCents) : 0,
    attempts: Number(attempts) || 1,
    correct: Boolean(correct),
    supportsUsed: Array.isArray(supportsUsed) ? supportsUsed : []
  };
  if (moduleType) resultData.moduleType = String(moduleType);
  if (activityType) resultData.activityType = String(activityType);
  if (difficulty) resultData.difficulty = difficulty;
  if (generatedOrderId) resultData.generatedOrderId = String(generatedOrderId);
  const saved = await db.saveResult(resultData);
  res.status(201).json(saved);
});
app.get(
  "/api/users",
  authenticateToken,
  requireRole(["technical_admin", "teacher"]),
  async (req, res) => {
    const allUsers = await db.getUsers();
    if (req.user?.role === "teacher") {
      return res.json(allUsers.filter((u) => u.role === "student"));
    }
    res.json(allUsers);
  }
);
app.post(
  "/api/users",
  authenticateToken,
  requireRole(["technical_admin"]),
  async (req, res) => {
    const { username, email, displayName, role, permissions, active, temporaryPassword } = req.body;
    if (!username || !email || !displayName || !role) {
      return res.status(400).json({ error: "Faltan campos obligatorios para registrar el usuario." });
    }
    if (!["student", "teacher", "technical_admin"].includes(role)) {
      return res.status(400).json({ error: "Rol no v\xE1lido. Solo se permiten student, teacher o technical_admin." });
    }
    if (!temporaryPassword || typeof temporaryPassword !== "string" || temporaryPassword.length < 6) {
      return res.status(400).json({
        error: "La contrase\xF1a temporal es obligatoria y debe tener al menos 6 caracteres."
      });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const allowedPermissions = ["manage_catalog"];
    const safePermissions = Array.isArray(permissions) ? permissions.filter((p) => allowedPermissions.includes(p)) : [];
    const existingByEmail = await db.getUserByEmail(cleanEmail);
    if (existingByEmail) {
      return res.status(409).json({ error: "Ya existe un usuario con este correo electr\xF3nico." });
    }
    const allUsers = await db.getUsers();
    if (allUsers.some((u) => u.username === cleanUsername)) {
      return res.status(409).json({ error: "Ya existe un usuario con este nombre de acceso institucional." });
    }
    let createdAuthUid = null;
    let authUserCreated = false;
    try {
      const auth = getAuth();
      const fbUser = await auth.createUser({
        email: cleanEmail,
        password: temporaryPassword,
        displayName: cleanDisplayName,
        emailVerified: true
      });
      createdAuthUid = fbUser.uid;
      authUserCreated = true;
      const created = await db.createUser({
        authUid: fbUser.uid,
        username: cleanUsername,
        email: cleanEmail,
        displayName: cleanDisplayName,
        role,
        permissions: safePermissions,
        active: active !== void 0 ? Boolean(active) : true
      });
      if (role === "student") {
        await db.updateProfile(created.id, {
          difficultyLevel: "facil",
          choiceCount: 4,
          showHint: true,
          showExample: true,
          textToSpeechEnabled: true,
          pictogramsEnabled: true,
          socialSupportsEnabled: true,
          scaffoldingLevel: "high",
          largeText: false,
          highContrast: false
        });
      }
      res.status(201).json(created);
    } catch (err) {
      if (authUserCreated && createdAuthUid) {
        try {
          await getAuth().deleteUser(createdAuthUid);
          console.log(`Rollback ejecutado: cuenta Firebase Auth ${createdAuthUid} eliminada por fallo en persistencia.`);
        } catch (delErr) {
          console.error("Error al realizar rollback de usuario en Firebase Auth:", delErr);
        }
      }
      if (err.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "El correo electr\xF3nico ya est\xE1 registrado en Firebase Authentication." });
      }
      if (process.env.NODE_ENV !== "production" && !authUserCreated && (err.code === "auth/network-request-failed" || err.message?.includes("credential") || err.message?.includes("network") || err.message?.includes("identitytoolkit"))) {
        console.warn("Firebase Admin offline en modo desarrollo; creando usuario local dev:", err.message);
        const devUid = `dev_uid_${cleanUsername}`;
        const created = await db.createUser({
          authUid: devUid,
          username: cleanUsername,
          email: cleanEmail,
          displayName: cleanDisplayName,
          role,
          permissions: safePermissions,
          active: active !== void 0 ? Boolean(active) : true
        });
        if (role === "student") {
          await db.updateProfile(created.id, {
            difficultyLevel: "facil",
            choiceCount: 4,
            showHint: true,
            showExample: true,
            textToSpeechEnabled: true,
            pictogramsEnabled: true,
            socialSupportsEnabled: true,
            scaffoldingLevel: "high",
            largeText: false,
            highContrast: false
          });
        }
        return res.status(201).json(created);
      }
      console.error("Error al crear usuario institucional:", err);
      res.status(500).json({ error: err.message || "Error al crear la cuenta en Firebase Authentication." });
    }
  }
);
app.patch("/api/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const target = await db.getUserById(id);
  if (!target) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }
  if (req.user?.role === "teacher") {
    if (target.role !== "student") {
      return res.status(403).json({ error: "Los docentes solo pueden gestionar permisos de estudiantes." });
    }
    const { permissions } = req.body;
    if (permissions !== void 0) {
      const updated2 = await db.updateUser(id, { permissions });
      return res.json(updated2);
    }
    return res.status(400).json({ error: "Operaci\xF3n no permitida." });
  }
  if (req.user?.role !== "technical_admin") {
    return res.status(403).json({ error: "Se requieren privilegios de administrador t\xE9cnico." });
  }
  const updates = req.body;
  if (updates.active !== void 0 && target.authUid) {
    try {
      await getAuth().updateUser(target.authUid, { disabled: !updates.active });
    } catch (authErr) {
      console.warn(`No se pudo sincronizar estado disabled en Firebase Auth para ${target.authUid}:`, authErr.message);
    }
  }
  const updated = await db.updateUser(id, updates);
  res.json(updated);
});
app.get(
  "/api/system/status",
  authenticateToken,
  requireRole(["technical_admin"]),
  async (_req, res) => {
    res.json({
      appStatus: "operativo",
      backendApi: "operativo",
      database: db.getProviderName(),
      authStatus: "firebase_admin_token_verification",
      persistenceProvider: db.getProviderName(),
      version: "2.1.0-secure",
      productsCount: (await db.getProducts()).length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
);
app.post(
  "/api/system/reset-demo",
  authenticateToken,
  requireRole(["technical_admin"]),
  async (_req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        error: "El reinicio de demostraci\xF3n est\xE1 deshabilitado en entornos de producci\xF3n."
      });
    }
    await db.resetToDefaults();
    res.json({ message: "Datos restaurados a valores iniciales de demostraci\xF3n." });
  }
);
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path2.join(__dirname2, "dist");
  if (isProduction || fs2.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mini-IPCA Store escuchando en http://0.0.0.0:${PORT} [Provider: ${db.getProviderName()}]`);
  });
}
startServer().catch((err) => {
  console.error("Error al iniciar el servidor Mini-IPCA Store:", err);
});
