# 🏗️ BildyApp - User Management System

Sistema completo de gestión de usuarios con autenticación JWT, roles, compañías y verificación de dos pasos.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración del .env](#-configuración-del-env)
- [Ejecución](#-ejecución)
- [Middlewares](#-middlewares)
- [Orden de Ejecución de Endpoints](#-orden-de-ejecución-de-endpoints)
- [Endpoints Detallados](#-endpoints-detallados)
- [Sistema de Eventos](#-sistema-de-eventos)
- [Modelos de Datos](#-modelos-de-datos)

---

## ✨ Características

- ✅ **Autenticación JWT** con tokens de acceso (15min) y refresh (7 días)
- ✅ **Verificación de email** con código de 6 dígitos
- ✅ **Roles y permisos** (admin/guest)
- ✅ **Gestión de compañías** (crear, asignar, freelance)
- ✅ **Subida de logos** con Multer
- ✅ **Eliminación suave y dura** (soft/hard delete)
- ✅ **Cambio de contraseña** con validación Zod `.refine()`
- ✅ **EventEmitter** para eventos del ciclo de vida
- ✅ **Rate limiting** para protección contra ataques
- ✅ **Helmet** para seguridad HTTP
- ✅ **Sanitización NoSQL** con express-mongo-sanitize
- ✅ **Validación Zod** con `.transform()` y `.refine()`

---

## 📁 Estructura del Proyecto

```
usr_manager/
├── src/
│   ├── config/
│   │   ├── env.js                    # Validación de variables de entorno
│   │   └── db.js                     # Conexión a MongoDB
│   │
│   ├── controllers/
│   │   └── user.controller.js        # Lógica de negocio (11 funciones)
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # Verificación JWT
│   │   ├── role.middleware.js        # Validación de roles
│   │   ├── status.middleware.js      # Chequeo de estado (pending/verified)
│   │   ├── validate.middleware.js    # Validación Zod
│   │   ├── sanitize.middleware.js    # Sanitización NoSQL
│   │   ├── rateLimit.middleware.js   # Rate limiting
│   │   └── error-handler.middleware.js  # Manejo centralizado de errores
│   │
│   ├── models/
│   │   ├── user.models.js            # Schema User + virtuals
│   │   ├── company.models.js         # Schema Company
│   │   ├── refreshToken.models.js    # Schema RefreshToken
│   │   └── storage.models.js         # Schema Storage (archivos)
│   │
│   ├── routes/
│   │   └── user.routes.js            # Definición de rutas
│   │
│   ├── services/
│   │   ├── event.service.js          # EventEmitter singleton
│   │   └── notification.service.js   # Listeners centralizados
│   │
│   ├── squemes/ (Zod validators)
│   │   ├── user.squemes.js           # Validaciones de usuario
│   │   └── company.squemes.js        # Validaciones de compañía
│   │
│   ├── utils/
│   │   ├── AppError.js               # Clase de errores personalizada
│   │   ├── handleJWT.js              # Generación y verificación JWT
│   │   ├── handlePassword.js         # Encrypt/compare contraseñas
│   │   ├── handleStorage.utils.js    # Configuración Multer
│   │   └── sanitizer.utils.js        # Sanitización
│   │
│   ├── plugins/
│   │   └── softDelete.plugin.js      # Plugin para soft delete
│   │
│   ├── app.js                        # Configuración Express
│   └── index.js                      # Punto de entrada
│
├── uploads/                          # Directorio de archivos subidos
├── .env                              # Variables de entorno (no versionar)
├── .env_example                      # Plantilla .env
├── BildyApp.postman_collection.json  # Colección Postman
├── POSTMAN_GUIDE.md                  # Guía de Postman
├── package.json
└── README.md
```

---

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 20.11.0+ | Runtime |
| **Express** | 5.2.1 | Framework web |
| **MongoDB/Mongoose** | 9.2.1 | Base de datos |
| **JWT** | 9.0.3 | Autenticación |
| **Bcryptjs** | 3.0.3 | Hashing de contraseñas |
| **Zod** | 4.3.6 | Validación de schemas |
| **Multer** | 2.1.1 | Subida de archivos |
| **Helmet** | 8.1.0 | Seguridad HTTP |
| **express-rate-limit** | 8.3.2 | Rate limiting |

---

## 📦 Instalación

### Requisitos Previos
- Node.js 20.11.0 o superior
- MongoDB Atlas (cuenta gratuita: https://www.mongodb.com/cloud/atlas)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd usr_manager

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (copiar del .env_example)
cp .env_example .env

# 4. Configurar variables de entorno (ver siguiente sección)
nano .env

# 5. Crear directorio de uploads (si no existe)
mkdir -p uploads
```

---

## 🔐 Configuración del .env

### Plantilla (.env_example)
```env
# Configuración del servidor
PORT=
PUBLIC_URL=
NODE_ENV=

# MongoDB Atlas
DB_URI=

# JWT
JWT_SECRET=
```

### Ejemplo Completo (.env)

```env
# ═══════════════════════════════════════════════════════════
# 🔧 CONFIGURACIÓN DEL SERVIDOR
# ═══════════════════════════════════════════════════════════

# Puerto en el que corre el servidor (default: 3000)
PORT=3000

# URL pública para enlaces (default: http://localhost:3000)
PUBLIC_URL=http://localhost:3000

# Ambiente: development | production | test
NODE_ENV=development

# ═══════════════════════════════════════════════════════════
# 🗄️ MONGODB ATLAS
# ═══════════════════════════════════════════════════════════

# Conexión a MongoDB Atlas
# Formato: mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<base-datos>?retryWrites=true&w=majority
#
# Pasos para obtener:
# 1. Ve a https://www.mongodb.com/cloud/atlas
# 2. Crea un cluster gratuito (M0)
# 3. Ve a "Database" → "Connect" → "Drivers"
# 4. Copia el string de conexión
# 5. Reemplaza <password> con tu contraseña
# 6. Reemplaza <database> con el nombre de tu BD (ej: bildy_dev)

# Ejemplo (NO usar en producción):
DB_URI=mongodb+srv://admin:tuContraseña@cluster0.abcdef.mongodb.net/bildy_dev?retryWrites=true&w=majority

# ═══════════════════════════════════════════════════════════
# 🔑 JWT - JSON Web Tokens
# ═══════════════════════════════════════════════════════════

# Secreto para firmar tokens (mínimo 32 caracteres aleatorios)
# Generar en terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# O usar: https://generate-random.org/

JWT_SECRET=tu_secreto_muy_largo_y_aleatorio_aqui_minimo_32_caracteres
```

### ⚙️ Detalles de Cada Variable

#### **PORT**
```env
PORT=3000
```
- El puerto donde escuchará el servidor
- Default: 3000
- Usa 8080, 5000, etc. si 3000 ya está ocupado

#### **PUBLIC_URL**
```env
PUBLIC_URL=http://localhost:3000
```
- URL base para generar enlaces (ej: URLs de archivos subidos)
- **Local**: `http://localhost:3000`
- **Producción**: `https://tudominio.com`
- Incluida en respuestas de upload: `/uploads/filename.jpg`

#### **NODE_ENV**
```env
NODE_ENV=development
```
- `development` - Sin compresión, logs detallados
- `production` - Optimizado, menos logs
- `test` - Para testing

#### **DB_URI**
```env
DB_URI=mongodb+srv://admin:password@cluster0.abc.mongodb.net/bildy_dev?retryWrites=true&w=majority
```

**Componentes:**
- `admin` = usuario de BD
- `password` = contraseña del usuario
- `cluster0.abc` = URL de tu cluster
- `bildy_dev` = nombre de la base de datos (puedes crear varias)
- `?retryWrites=true&w=majority` = opciones de replicación

**Cómo obtenerlo:**
1. https://cloud.mongodb.com → "Database"
2. Botón "Connect" → "Drivers"
3. Selecciona "Node.js" → copia el string
4. Reemplaza `<password>` y `<database>`

#### **JWT_SECRET**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Requisitos:**
- Mínimo 32 caracteres
- Aleatorio y único
- NO usar la misma para múltiples proyectos

**Generar secreto seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Salida:
```
7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7
```

---

## 🚀 Ejecución

### Modo Desarrollo (con reinicio automático)
```bash
npm run dev
```

Salida esperada:
```
✓ Base de datos conectada
✓ Servidor escuchando en puerto 3000
✓ Listeners de notificación inicializados
```

### Verifica que funcione
```bash
curl http://localhost:3000/api/user/register
# Debería devolver un error 400 (sin body)
```

---

## 🛡️ Middlewares

### 1. **sanitize.middleware.js** - Sanitización NoSQL
```javascript
// Previene ataques NoSQL injection
// Ejemplo: { "email": { "$ne": "" } } → { "email": "...$ne.." }
```
**Ubicación en stack**: Al inicio (antes de routes)
**Protege contra**: Login bypass, inyección de queries

---

### 2. **auth.middleware.js** - Verificación JWT
```javascript
// Valida que el token Bearer sea válido y no esté expirado
// Extrae información del usuario del token
// Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
**Ubicación**: Rutas protegidas
**Se requiere en**: Casi todos los endpoints (excepto register, login, refresh)
**Lanza**: 401 si no hay token o está inválido

---

### 3. **role.middleware.js** - Validación de Roles
```javascript
// Verifica que el usuario tenga el rol requerido (admin/guest)
// Uso: checkRol("admin") o checkRol(["admin", "guest"])
```
**Ubicación**: Rutas donde se necesita autorización
**Se requiere en**:
  - `PATCH /logo` (solo admin)
  - `POST /invite` (solo admin)
**Lanza**: 403 Forbidden si el rol no coincide

---

### 4. **status.middleware.js** - Chequeo de Estado
```javascript
// Verifica que el usuario tenga status "verified" o lo que se especifique
// Uso: checkStatus("verified")
```
**Ubicación**: Rutas que requieren usuarios verificados
**Se requiere en**: Casi todas excepto register, login, validation, refresh
**Lanza**: 403 si el usuario está en estado "pending"

---

### 5. **validate.middleware.js** - Validación Zod
```javascript
// Valida body, query, params contra schemas Zod
// Normaliza datos: trim(), toLowerCase() en emails
// Transforma tipos: strings a booleanos, etc.
```
**Ubicación**: Antes del controller
**Valida**:
  - `body`: JSON del request
  - `query`: Parámetros de URL
  - `params`: Parámetros de ruta

**Características**:
```javascript
// Transform: normalizar datos
email: z.email().toLowerCase().trim()

// Refine: validación cruzada
.refine((data) => data.newPassword !== data.currentPassword, {
  message: "Las contraseñas no pueden ser iguales",
  path: ["newPassword"]
})
```

---

### 6. **rateLimit.middleware.js** - Rate Limiting
```javascript
// Limita requests por IP
// Default: 100 requests/15 minutos
// Endpoints sensibles (login, register): 5-10 por 15 min
```
**Ubicación**: Al inicio (después de sanitize)
**Protege contra**: Fuerza bruta, scraping, DDoS
**Retorna**: 429 Too Many Requests cuando se alcanza el límite

---

### 7. **error-handler.middleware.js** - Manejo Centralizado de Errores
```javascript
// Captura todos los errores y devuelve respuestas consistentes
// AppError personalizado → respuesta estructurada
// Errores genéricos → 500 Internal Server Error
```
**Ubicación**: Al final de Express
**Tipos de error que maneja**:
  - AppError (personalizado)
  - ValidationError (Zod)
  - JWTError (JWT expirado/inválido)
  - Errores genéricos

**Respuesta de error**:
```json
{
  "status": 400,
  "message": "El NIF debe tener 9 caracteres"
}
```

---

## 📊 Orden de Ejecución de Endpoints

### 🎯 Flujo Completo Recomendado

#### **FASE 1: Autenticación (Requerida)**

```
1️⃣ POST /register
   ├─ Validar email y contraseña (Zod)
   ├─ Hashear contraseña (bcryptjs)
   ├─ Generar código de 6 dígitos
   ├─ Devolver tokens JWT
   └─ 🎤 Emitir: user:registered

2️⃣ PUT /validation (Email verification)
   ├─ [AUTH] Verificar JWT
   ├─ Validar código Zod (6 dígitos)
   ├─ Comparar con código guardado
   ├─ Cambiar status "pending" → "verified"
   └─ 🎤 Emitir: user:verified
```

#### **FASE 2: Completar Perfil (Después de verificación)**

```
3️⃣ PUT /register (Update personal data)
   ├─ [AUTH] JWT válido
   ├─ [STATUS] Usuario verificado
   ├─ Validar name, lastName, NIF (Zod)
   ├─ Actualizar documento User
   └─ 🎤 Emitir: user:updated

4️⃣ PATCH /company (Company setup)
   ├─ [AUTH] JWT válido
   ├─ [STATUS] Usuario verificado
   ├─ Validar compañía (Zod)
   ├─ Si freelance: crear con NIF
   ├─ Si no existe CIF: crear nueva y asignar (ADMIN)
   ├─ Si existe CIF: asignar a existente (GUEST)
   └─ 🎤 Emitir: user:company-assigned
```

#### **FASE 3: Configuración Empresa (Opcional)**

```
5️⃣ PATCH /logo (Upload company logo)
   ├─ [AUTH] JWT válido
   ├─ [ROLE] Solo admin
   ├─ [STATUS] Verificado
   ├─ Multer upload (forma: logo)
   ├─ Guardar en /uploads
   ├─ Actualizar Company.logo
   └─ Respuesta: URL del archivo

6️⃣ POST /invite (Invitar colegas)
   ├─ [AUTH] JWT válido
   ├─ [ROLE] Solo admin
   ├─ [STATUS] Verificado
   ├─ Validar email (Zod)
   ├─ Crear usuario con role "guest"
   ├─ Asignar misma compañía
   └─ 🎤 Emitir: user:invited
```

#### **FASE 4: Gestión de Cuenta**

```
7️⃣ GET / (Get user profile)
   ├─ [AUTH] JWT válido
   ├─ [STATUS] Verificado
   ├─ Devolver user con company populate
   └─ Incluir virtual fullName

8️⃣ PUT /password (Change password)
   ├─ [AUTH] JWT válido
   ├─ [STATUS] Verificado
   ├─ Validar contraseñas (Zod + refine)
   ├─ Comparar contraseña actual
   ├─ Hashear y guardar nueva
   └─ 🎤 Emitir: user:updated

9️⃣ DELETE / (Delete user)
   ├─ [AUTH] JWT válido
   ├─ [STATUS] Verificado
   ├─ Query ?soft=true|false
   ├─ Soft: marcar deleted=true
   ├─ Hard: eliminar documento
   └─ 🎤 Emitir: user:deleted
```

#### **FASE 5: Sesión**

```
🔟 POST /refresh (Refresh token)
   ├─ Validar refreshToken (Zod)
   ├─ Generar nuevo accessToken
   └─ Respuesta: nuevo accessToken

1️⃣1️⃣ POST /logout
   ├─ [AUTH] JWT válido
   ├─ [STATUS] Verificado
   ├─ Revocar todos los refreshTokens
   └─ 🎤 Emitir: user:logged-out
```

#### **FASE 6: Acceso (Alternativa si es registered)**

```
🔐 POST /login
   ├─ Validar email/password (Zod)
   ├─ Buscar usuario
   ├─ Comparar contraseña (bcryptjs)
   ├─ Verificar status ≠ pending
   ├─ Devolver tokens JWT
   └─ No emite evento (ya está registered)
```

---

## 🔌 Endpoints Detallados

### **1. POST /api/user/register** - Registrar Usuario
**Descripción**: Crear nueva cuenta con email y contraseña

| Propiedad | Valor |
|-----------|-------|
| **Método** | POST |
| **Auth requerida** | ❌ No |
| **Middlewares** | validate (body) |
| **Status Code** | 200 |

**Request Body** (JSON):
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Validación Zod**:
- `email`: Formato válido, convertido a minúsculas
- `password`: Mínimo 8 caracteres, mayúscula, minúscula, número

**Response** (200):
```json
{
  "userData": {
    "email": "juan@example.com",
    "status": "pending",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Errores posibles**:
- `400` - Email o contraseña inválida
- `409` - Email ya registrado

**Eventos emitidos**: `user:registered`

---

### **2. PUT /api/user/validation** - Verificar Email
**Descripción**: Validar código de verificación (6 dígitos)

| Propiedad | Valor |
|-----------|-------|
| **Método** | PUT |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | authMiddleware, validate |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Request Body** (JSON):
```json
{
  "code": "123456"
}
```

**Validación**:
- `code`: Exactamente 6 dígitos

**Response** (200):
```json
{
  "message": "Usuario verificado",
  "user": { ...documento user... }
}
```

**Errores posibles**:
- `400` - Código incorrecto
- `429` - Más de 3 intentos fallidos (usuario eliminado)
- `401` - Token inválido

**Eventos emitidos**: `user:verified`

---

### **3. POST /api/user/login** - Iniciar Sesión
**Descripción**: Autenticarse con email y contraseña

| Propiedad | Valor |
|-----------|-------|
| **Método** | POST |
| **Auth requerida** | ❌ No |
| **Middlewares** | validate (body) |
| **Status Code** | 200 |

**Request Body** (JSON):
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Response** (200):
```json
{
  "userData": {
    "email": "juan@example.com",
    "status": "verified",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Errores posibles**:
- `400` - Email o contraseña incorrecta
- `401` - Usuario pendiente de verificación

---

### **4. PUT /api/user/register** - Actualizar Datos Personales
**Descripción**: Completar perfil con nombre, apellido, NIF

| Propiedad | Valor |
|-----------|-------|
| **Método** | PUT |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, status (verified), validate |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Request Body** (JSON):
```json
{
  "name": "Juan",
  "lastName": "Pérez García",
  "nif": "12345678A"
}
```

**Validación**:
- `name`: 2-100 caracteres
- `lastName`: 2-100 caracteres
- `nif`: 8 números + 1 letra (convertido a mayúscula)

**Response** (200):
```json
{
  "_id": "...",
  "email": "juan@example.com",
  "name": "Juan",
  "lastName": "Pérez García",
  "nif": "12345678A",
  "...": "..."
}
```

**Eventos emitidos**: `user:updated`

---

### **5. PATCH /api/user/company** - Configurar Compañía
**Descripción**: Crear nueva compañía, unirse a existente o configurar como freelance

| Propiedad | Valor |
|-----------|-------|
| **Método** | PATCH |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, status (verified), validate |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Caso 1: Crear Nueva Compañía**
```json
{
  "isFreelance": false,
  "name": "Tech Solutions Inc",
  "cif": "A12345678",
  "address": {
    "street": "Calle Principal",
    "number": "123",
    "postal": "28001",
    "city": "Madrid",
    "province": "Madrid"
  }
}
```
**Resultado**: Usuario se convierte en ADMIN de la compañía

**Caso 2: Configurar como Autónomo**
```json
{
  "isFreelance": true
}
```
**Resultado**: Compañía creada con NIF del usuario, usuario es ADMIN

**Caso 3: Unirse a Compañía Existente**
```json
{
  "isFreelance": false,
  "name": "Existing Company",
  "cif": "A12345678",
  "address": { ... }
}
```
**Resultado**: Usuario se asigna con rol GUEST

**Eventos emitidos**: `user:company-assigned`

---

### **6. PATCH /api/user/logo** - Subir Logo de Compañía
**Descripción**: Subir imagen de logo de la compañía

| Propiedad | Valor |
|-----------|-------|
| **Método** | PATCH |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, role (admin), status, upload, validateFile |
| **Status Code** | 201 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Body (multipart)**:
```
Field: "logo"
Type: File
Max: 5MB
Formats: JPG, PNG, GIF, WebP
```

**Response** (201):
```json
{
  "data": {
    "logo": "https://res.cloudinary.com/demo/image/upload/v1714380000/logo.png",
    "company": {
      "_id": "65f1f77bcf3f1b8ad2f45c11",
      "name": "Construcciones Norte SL",
      "logo": "https://res.cloudinary.com/demo/image/upload/v1714380000/logo.png"
    }
  }
}
```

**Errores posibles**:
- `400` - No se subió archivo
- `413` - Archivo muy grande
- `403` - Solo admin puede subir logos

---

### **7. GET /api/user** - Obtener Perfil del Usuario
**Descripción**: Devolver información completa del usuario con compañía

| Propiedad | Valor |
|-----------|-------|
| **Método** | GET |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, status (verified) |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Response** (200):
```json
{
  "_id": "...",
  "email": "juan@example.com",
  "name": "Juan",
  "lastName": "Pérez",
  "fullName": "Juan Pérez",              // Virtual
  "nif": "12345678A",
  "role": "admin",
  "status": "verified",
  "company": {                           // Populated
    "_id": "...",
    "name": "Tech Solutions",
    "cif": "A12345678",
    "owner": "...",
    "logo": "http://...",
    "address": { ... }
  },
  "deleted": false,
  "createdAt": "2026-04-07T10:00:00Z",
  "updatedAt": "2026-04-07T10:00:00Z"
}
```

**Nota**: Virtual `fullName` solo aparece si se configuró en el modelo con `toJSON: { virtuals: true }`

---

### **8a. POST /api/user/refresh** - Refrescar Token
**Descripción**: Generar nuevo accessToken usando refreshToken

| Propiedad | Valor |
|-----------|-------|
| **Método** | POST |
| **Auth requerida** | ❌ No |
| **Middlewares** | validate (body) |
| **Status Code** | 200 |

**Request Body** (JSON):
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Errores posibles**:
- `401` - Token no válido o expirado

---

### **8b. POST /api/user/logout** - Cerrar Sesión
**Descripción**: Revocar todos los tokens de refresh del usuario

| Propiedad | Valor |
|-----------|-------|
| **Método** | POST |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, status (verified) |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Response** (200):
```json
{
  "message": "Todas las sesiones cerradas"
}
```

**Eventos emitidos**: `user:logged-out`

---

### **9. DELETE /api/user** - Eliminar Usuario
**Descripción**: Eliminación suave (soft) o dura (hard) del usuario

| Propiedad | Valor |
|-----------|-------|
| **Método** | DELETE |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, status (verified), validate (query) |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `soft=true` - Eliminación suave (marcar deleted=true)
- `soft=false` o sin parámetro - Eliminación dura (eliminar BD)

**Ejemplo URLs**:
```
DELETE /api/user?soft=true
DELETE /api/user?soft=false
DELETE /api/user
```

**Response** (200):
```json
{
  "message": "Usuario eliminado (soft delete)"
}
```
o
```json
{
  "message": "Usuario eliminado (hard delete)"
}
```

**Eventos emitidos**:
```javascript
{
  user:deleted {
    email: "...",
    deleteType: "soft" | "hard",
    deletedAt: "2026-04-07T10:00:00Z",
    timestamp: "2026-04-07T10:00:00Z"
  }
}
```

---

### **10. POST /api/user/invite** - Invitar Colega
**Descripción**: Crear nuevo usuario guest en la misma compañía

| Propiedad | Valor |
|-----------|-------|
| **Método** | POST |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, role (admin), status (verified), validate |
| **Status Code** | 201 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Request Body** (JSON):
```json
{
  "email": "colleague@example.com"
}
```

**Validación**:
- `email`: Formato válido, convertido a minúsculas

**Response** (201):
```json
{
  "message": "Usuario invitado con éxito",
  "user": {
    "_id": "...",
    "email": "colleague@example.com",
    "password": "$2b$...",  // Hasheada
    "role": "guest",
    "status": "pending",
    "company": "...",       // Misma compañía del inviter
    "...": "..."
  }
}
```

**Errores posibles**:
- `403` - Solo admins pueden invitar
- `400` - Email inválido

**Eventos emitidos**: `user:invited`

---

### **BONUS: PUT /api/user/password** - Cambiar Contraseña
**Descripción**: Cambiar contraseña actual por una nueva

| Propiedad | Valor |
|-----------|-------|
| **Método** | PUT |
| **Auth requerida** | ✅ Sí (JWT) |
| **Middlewares** | auth, status (verified), validate |
| **Status Code** | 200 |

**Headers requeridos**:
```
Authorization: Bearer <accessToken>
```

**Request Body** (JSON):
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Validación Zod**:
- Ambas contraseñas deben cumplir formato seguro
- `.refine()`: Nueva ≠ Actual
- Ambas: Mínimo 8 caracteres, mayúscula, minúscula, número

**Response** (200):
```json
{
  "message": "Contraseña actualizada"
}
```

**Errores posibles**:
- `400` - Contraseña actual incorrecta
- `400` - Nueva contraseña igual a la actual

**Eventos emitidos**: `user:updated`

---

## 🎤 Sistema de Eventos

Todos los eventos se emiten a través del singleton `EventEmitter` desde `event.service.js`.

### **Eventos Disponibles**

| Evento | Momento | Payload |
|--------|---------|---------|
| `user:registered` | Registro exitoso | email, name, role, status, timestamp |
| `user:verified` | Email validado | email, verifiedAt, timestamp |
| `user:updated` | Datos actualizados | email, timestamp |
| `user:company-assigned` | Compañía asignada | email, company, timestamp |
| `user:logged-out` | Logout exitoso | email, timestamp |
| `user:invited` | Colega invitado | email, invitedBy, invitedAt, timestamp |
| `user:deleted` | Usuario eliminado | email, deletedAt, deleteType, timestamp |

### **Inicialización de Listeners**

En `src/app.js` línea ~23:
```javascript
import { initializeNotificationListeners } from './services/notification.service.js';

// ...

initializeNotificationListeners();
```

### **Ejemplo de Listener Personalizado**

Para agregar más listeners sin modificar controllers:

```javascript
// En notification.service.js

eventEmitter.on(EVENTS.USER_REGISTERED, async (data) => {
  // Enviar email de bienvenida
  await sendWelcomeEmail(data.email);

  // Registrar en analytics
  analytics.track('user_registered', { email: data.email });

  // Integración con Slack
  await slackBot.notify(`Nuevo usuario: ${data.email}`);
});
```

---

## 📊 Modelos de Datos

### **User** (`models/user.models.js`)

```javascript
{
  _id: ObjectId,

  // Existencia
  email: String,              // unique, lowercase
  password: String,           // bcrypted
  nif: String,               // Documento de identidad

  // Perfil
  name: String,
  lastName: String,
  fullName: String,           // Virtual: name + lastName
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },

  // Autenticación
  role: Enum["admin", "guest"],        // default: admin
  status: Enum["pending", "verified"],  // default: pending
  deleted: Boolean,                     // default: false

  // Verificación
  verificationCode: String,       // 6 dígitos
  verificationAttempts: Number,   // max: 3

  // Relaciones
  company: ObjectId,  // ref: Company, index

  // Timestamps
  createdAt: Date,
  updatedAt: Date,

  // Índices
  index({ email: 1 }),        // unique
  index({ company: 1 }),
  index({ status: 1 }),
  index({ role: 1 })
}
```

---

### **Company** (`models/company.models.js`)

```javascript
{
  _id: ObjectId,

  // Información de compañía
  name: String,
  cif: String,              // CIF único
  isFreelance: Boolean,     // default: false

  // Identificación
  owner: ObjectId,          // ref: User (admin)
  logo: String,            // URL del logo

  // Dirección
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },

  // Estado
  deleted: Boolean,         // default: false

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

### **RefreshToken** (`models/refreshToken.models.js`)

```javascript
{
  _id: ObjectId,

  // Token
  token: String,            // JWT

  // Relación
  user: ObjectId,          // ref: User

  // Revocación
  revokedAt: Date,         // null si activo
  revokedByIp: String,

  // Validez
  expiresAt: Date,         // 7 días
  createdByIp: String,

  // Timestamps
  createdAt: Date,

  // Método
  isActive(): Boolean       // !revokedAt && !expirado
}
```

---

### **Storage** (`models/storage.models.js`)

```javascript
{
  _id: ObjectId,

  // Archivo
  filename: String,         // nombre en servidor
  originalName: String,    // nombre original
  url: String,            // URL pública

  // Metadatos
  mimetype: String,       // ej: image/jpeg
  size: Number,           // en bytes

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing con Postman

Importa la colección `BildyApp.postman_collection.json` en Postman:

```bash
# Opción 1: Importar directamente
File → Import → Upload Files → BildyApp.postman_collection.json

# Opción 2: Copiar URL JSON
https://raw.githubusercontent.com/.../BildyApp.postman_collection.json
```

Lee `POSTMAN_GUIDE.md` para detalles de testing.

---

## 🐛 Troubleshooting

### **"Cannot find module ..."**
```bash
npm install
```

### **"MongooseError: Cannot connect to MongoDB"**
- Verifica `DB_URI` en `.env`
- Confirma que MongoDB Atlas está online
- Whitelist tu IP en MongoDB Atlas

### **"401 Unauthorized"**
- Token expirado → usa `/refresh`
- Token no enviado → agrega `Authorization: Bearer ...`
- Token inválido → haz login nuevamente

### **"ValidationError from Zod"**
- Revisa el formato del body (JSON válido)
- Email debe ser correo válido
- Contraseña: 8+ caracteres, mayúscula, minúscula, número

### **Puerto ya en uso**
```bash
# Cambiar puerto en .env
PORT=5000
```

---

## 📚 Recursos

- [Express.js Documentación](https://expressjs.com/)
- [Mongoose Guía](https://mongoosejs.com/)
- [JWT Intro](https://jwt.io/)
- [Zod Validación](https://zod.dev/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 📄 Licencia

ISC

---

## 👨‍💻 Autor: Diego Vega

Proyecto desarrollado para educación.

**Última actualización**: 2026-04-07
