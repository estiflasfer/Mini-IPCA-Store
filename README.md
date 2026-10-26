# Mini-IPCA Store — Documentación del Sistema

## 1. Propósito y Contexto Vocacional
**Mini-IPCA Store** es una herramienta educativa y de entrenamiento vocacional diseñada específicamente para adolescentes de entre 12 y 18 años con discapacidad intelectual en el **IPCA**.

En esta aplicación, **el estudiante NO es un cliente**. El estudiante se capacita en el puesto de trabajo como **vendedor o dependiente de caja** en la tienda real del IPCA, con el objetivo a largo plazo de fomentar su autonomía, empleabilidad y participación en el trabajo remunerado.

---

## 2. Alcance Formal del Diseño vs. Alcance de la Prueba de Concepto (PoC)
- **Alcance formal académico:** El diseño accesible, pedagógico y centrado en la persona (DUA/UDL) de la aplicación, definiendo las interfaces de baja carga cognitiva, los apoyos graduados y el flujo de trabajo de ventas.
- **Alcance de la prueba de concepto (PoC):** Sistema funcional interactivo full-stack con persistencia desacoplada y autenticación por roles, verificando en tiempo real las operaciones matemáticas dinámicas, la búsqueda de productos y la gestión del catálogo.
- **Fuera de alcance intencional:** No es un software de contabilidad, ERP, facturación, tributación, pagos electrónicos, gestión de proveedores ni control de inventario/kardex con conteo de unidades.

---

## 3. Roles del Sistema
Se definen estrictamente **tres roles**:
1. **Estudiante (`student`):**
   - Realiza actividades de entrenamiento como dependiente/vendedor.
   - Busca productos (por texto y voz opcional), registra cantidades pedidas por el cliente.
   - Calcula el total y calcula el cambio correspondiente.
   - Accede a apoyos auditivos (TTS), pistas pedagógicas, ejemplos modelados y el panel contextual de “Frases útiles”.
   - Visualiza su progreso personal.
   - *Permiso especial:* Si se le concede `manage_catalog = true`, puede acceder a la gestión de productos sin perder su rol de estudiante.
2. **Docente (`teacher`):**
   - Selecciona perfiles de estudiantes y ajusta niveles de dificultad y andamiaje (Alto, Medio, Bajo).
   - Configura apoyos didácticos (pistas, ejemplos, pictogramas, TTS, opciones múltiples de 2 o 4 botones).
   - Gestiona el catálogo de productos y precios.
   - Consulta el historial formativo y exporta resúmenes anonimizados en formato CSV.
   - Otorga o revoca el permiso `manage_catalog` a estudiantes.
3. **Administrador Técnico (`technical_admin`):**
   - Administra cuentas de usuario y credenciales institucionales.
   - Asigna roles y activa/desactiva cuentas.
   - Supervisa el estado técnico del servidor, la base de datos y la versión del sistema.
   - No interfiere en la configuración pedagógica de los estudiantes.

---

## 4. Enfoque de Autenticación (Firebase Authentication)
- **Flujo:** Pantalla de login (`P01`) → Autenticación con `signInWithEmailAndPassword` (Firebase Web SDK) → Obtención de ID Token → Verificación en servidor Node.js mediante Firebase Admin `verifyIdToken()` → Asignación segura de rol y permisos desde el repositorio de datos confiable → Redirección automática al área autorizada (`S01`, `T01` o `A01`).
- Los usuarios **NO eligen su rol** en el login.
- Soporta compatibilidad nativa con administradores de contraseñas, autocompletado del navegador (`autocomplete="username"`, `autocomplete="current-password"`) y copiar/pegar.
- No utiliza CAPTCHAs ni desafíos cognitivos que impidan el acceso a los estudiantes.
- Mensaje genérico de error de seguridad: *“Usuario o contraseña incorrectos. Intenta nuevamente.”*

---

## 5. Cuentas de Demostración
| Rol | Nombre visible | Usuario / Alias | Correo Institucional Demo | Contraseña |
| :--- | :--- | :--- | :--- | :--- |
| **Estudiante** | Carlos M. (Estudiante Demo) | `estudiante.demo` | `estudiante@ipca.edu` | Configurada vía Secret / Env |
| **Docente** | Prof. María Elena (Docente Demo) | `docente.demo` | `docente@ipca.edu` | Configurada vía Secret / Env |
| **Admin** | Ing. Roberto Silva (Admin Demo) | `admin.demo` | `admin@ipca.edu` | Configurada vía Secret / Env |

*Seguridad:* Las contraseñas nunca se exponen en el código fuente, la interfaz de usuario, ni en repositorios. En la pantalla de login, los chips de demostración solo seleccionan el identificador institucional del usuario.

---

## 6. Modelo de Autorización (Deny by Default)
- Cada solicitud a la API (`/api/*`) debe enviar el Firebase ID Token en el encabezado `Authorization: Bearer <ID_TOKEN>`.
- El servidor Node.js valida:
  1. Identidad de Firebase válida y no expirada (`verifyIdToken`).
  2. Cuenta activa en la base de datos (`active = true`).
  3. Rol autorizado para la operación (`requireRole`).
  4. Permisos especiales para modificación de productos (`requireCatalogPermission`).
- Catálogo: Solo pueden gestionar productos los docentes, administradores técnicos o estudiantes con permiso `manage_catalog = true`.
- Endpoints sensibles:
  - `/api/system/status`: Solo accesible por `technical_admin` autenticado.
  - `/api/system/reset-demo`: Solo accesible por `technical_admin` autenticado y estrictamente deshabilitado cuando `NODE_ENV='production'`.
  - `/api/health`: Público, pero limitado a `{ status: 'ok' }`.

---

## 7. Persistencia Desacoplada y Firestore
La arquitectura aísla el almacenamiento detrás de la interfaz `IRepository`:
- **Modo Deployed / Cloud Run (`DATA_PROVIDER=firestore`):** Almacenamiento persistente en Google Cloud Firestore mediante `firebase-admin/firestore`. No depende del sistema de archivos local efímero del contenedor.
- **Modo Local / Fallback (`DATA_PROVIDER=json`):** Almacenamiento en archivo JSON local (`data/mini_ipca_store.json`) para desarrollo sin conexión.
- **Colecciones en Firestore:** `products`, `users`, `profiles`, `activities`, `results`.
- **Reglas de seguridad Firestore (`firestore.rules`):** Zero-Trust (`allow read, write: if false;`), bloqueando escrituras directas desde el cliente web. Toda mutación pasa obligatoriamente por la API del backend.

---

## 8. Escenario Base de Entrenamiento y Matemáticas Dinámicas
- **Escenario central:** *“Un cliente solicita 2 jugos y 1 paquete de galletas.”*
  - Precios iniciales: 2 × Jugo ($0.80) = $1.60 + 1 × Galletas ($0.75) = $0.75 → **Total: $2.35**.
  - Pago del cliente: $5.00 → **Cambio: $2.65**.
- **Cálculo dinámico verificado:**
  - Si el docente actualiza el precio del Jugo a $0.90 en la pantalla `T05`:
  - Los nuevos ejercicios calculan en tiempo real: 2 × $0.90 + $0.75 = **$2.55**.
  - Con un billete de $5.00, el cambio se actualiza automáticamente a **$2.45**.
  - Los resultados registrados previamente con el precio anterior se mantienen inalterados gracias al snapshot histórico `lineItemsSnapshot`.

---

## 9. Despliegue en Cloud Run y Compilación Reproducible
### Puerto de escucha:
El servidor implementa exactamente:
```typescript
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', ...);
```
Cloud Run inyecta la variable `PORT` y el servidor escucha en ese puerto específico.

### Comandos de compilación y ejecución:
```bash
# 1. Compilación completa para producción (Frontend Vite + Backend esbuild)
npm run build

# 2. Iniciar servidor compilado en producción
npm run start
```
- `npm run build:client` compila el frontend en `dist/`.
- `npm run build:server` compila y empaqueta `server.ts` y sus módulos en `server.js` (JavaScript puro ejecutable por Node).
- `npm run start` ejecuta `node server.js`, que sirve los archivos estáticos de `dist/` y los endpoints de la API.

---

## 10. Acción Única Requerida en la Consola de Firebase
Si el proyecto se despliega por primera vez en un proyecto nuevo de Firebase:
1. Ir a [Firebase Console](https://console.firebase.google.com/) y seleccionar el proyecto.
2. Ingresar a **Authentication** → pestaña **Sign-in method** (Método de inicio de sesión).
3. Hacer clic en **Correo electrónico/Contraseña** (Email/Password) y activar la casilla **Habilitar**.
4. Guardar los cambios.
*(Esta es una acción única requerida por las políticas de seguridad de Firebase para habilitar credenciales de correo/contraseña).*

---

## 11. Migración Futura a la Red Local del IPCA (LAN)
```text
Tablets / Teléfonos (Frontend)
           ↓ (Wi-Fi / Red Local IPCA)
Servidor Node.js Local en IPCA (Puerto 3000)
           ↓
Base de Datos Central Local (SQLite / PostgreSQL / Servidor Interno)
```
Como todos los componentes React consumen la API REST mediante DTOs estandarizados en centavos enteros, el frontend no requerirá cambios al migrar de Firestore a un servidor de base de datos local dentro del IPCA.
