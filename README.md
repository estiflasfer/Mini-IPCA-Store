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

## 4. Enfoque de Autenticación
- **Flujo:** Pantalla de login (`P01`) → Autenticación de credenciales → Asignación segura de rol en el servidor → Redirección automática al área autorizada (`S01`, `T01` o `A01`).
- Los usuarios **NO eligen libremente su rol** al iniciar sesión.
- Soporta compatibilidad nativa con administradores de contraseñas, autocompletado del navegador (`autocomplete="username"`, `autocomplete="current-password"`) y copiar/pegar.
- No utiliza CAPTCHAs ni desafíos cognitivos que impidan el acceso a los estudiantes.
- Mensaje genérico de error de seguridad: *“Usuario o contraseña incorrectos. Intenta nuevamente.”*

---

## 5. Cuentas de Demostración Configuradas
| Rol | Nombre visible | Usuario / Alias | Correo Demo | Contraseña |
| :--- | :--- | :--- | :--- | :--- |
| **Estudiante** | Carlos M. (Estudiante Demo) | `estudiante.demo` | `estudiante@ipca.edu` | `estudiante123` |
| **Docente** | Prof. María Elena (Docente Demo) | `docente.demo` | `docente@ipca.edu` | `docente123` |
| **Admin** | Ing. Roberto Silva (Admin Demo) | `admin.demo` | `admin@ipca.edu` | `admin123` |

*Nota:* En la pantalla de inicio de sesión se incluyen botones directos para autocompletar estas credenciales durante las evaluaciones de la prueba de concepto.

---

## 6. Modelo de Autorización
- El sistema aplica una política de **denegación por defecto (deny by default)**.
- El componente frontend `RoleGuard` actúa como capa de usabilidad; cada solicitud al backend requiere un encabezado `Authorization: Bearer <token>` que es validado en el servidor Node.js.
- Se verifican en cada llamada:
  1. Usuario autenticado y sesión activa.
  2. Cuenta en estado `active = true`.
  3. Rol permitido para la ruta.
  4. Permisos específicos (como `manage_catalog`).

---

## 7. Modelo de Datos y Catálogo de Productos
- **Moneda en centavos enteros (`priceCents`):** Para evitar errores de redondeo de punto flotante, todos los precios se almacenan en enteros (ej. $0.80 = 80 centavos).
- **Disponibilidad (Stock binario):** El stock se modela exclusivamente mediante el campo booleano `active = true / false`. No existen cantidades numéricas (“20 en stock”) ni movimientos de inventario.
- **Preservación histórica:** Los productos nunca se eliminan físicamente; desactivar un producto lo retira de la selección del estudiante pero preserva la integridad de los resultados históricos ya completados.
- **Catálogo de 10 productos iniciales:**
  - P001 — Agua — $0.50
  - P002 — Jugo — $0.80
  - P003 — Galletas — $0.75
  - P004 — Yogur — $1.25
  - P005 — Leche — $1.10
  - P006 — Pan — $0.40
  - P007 — Chocolate — $0.90
  - P008 — Papas fritas — $1.00
  - P009 — Caramelo — $0.10
  - P010 — Atún — $1.50

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

## 9. Arquitectura y Persistencia
- **Frontend:** React 19 con TypeScript, Tailwind CSS y componentes modulares accesibles.
- **Backend:** Servidor Node.js con Express, proporcionando la API REST de autenticación, catálogo, actividades, perfiles y resultados.
- **Persistencia en la PoC:** Repositorio en disco local (`data/mini_ipca_store.json`), desacoplado completamente de los componentes React mediante interfaces abstractas.
- **Utilidad Firebase Admin:** Se incluye `server/seed-firebase.ts` documentando el script de siembra para sincronizar usuarios y colecciones con Firebase Authentication y Cloud Firestore si se aprovisionan credenciales institucionales.

---

## 10. Migración Futura a la Red Local del IPCA (LAN)
La arquitectura de Mini-IPCA Store fue concebida con el siguiente objetivo institucional:

```text
Tablets / Teléfonos (Frontend)
           ↓ (Wi-Fi / Red Local IPCA)
Servidor Node.js Local en IPCA (Puerto 3000)
           ↓
Base de Datos Central Local (SQLite / PostgreSQL / Servidor Interno)
```

### Pasos de migración del almacenamiento:
1. Reemplazar la implementación en `server/db.ts` por el adaptador de base de datos local deseado (ej. PostgreSQL o SQLite con Drizzle ORM).
2. Como todos los controladores y vistas consumen la API REST mediante DTOs estandarizados en centavos enteros, **el frontend React no requiere ninguna modificación**.
3. El sistema operará 100% de manera autónoma dentro del aula y la tienda física del IPCA sin requerir conexión a Internet pública.

---

## 11. Cómo Ejecutar el Proyecto
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo full-stack (Puerto 3000)
npm run dev

# Compilar para producción
npm run build
npm run start
```
