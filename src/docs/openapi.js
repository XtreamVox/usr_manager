/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         street: { type: string, example: "Gran Via" }
 *         number: { type: string, example: "12" }
 *         postal: { type: string, example: "28013" }
 *         city: { type: string, example: "Madrid" }
 *         province: { type: string, example: "Madrid" }
 *     Error:
 *       type: object
 *       properties:
 *         error: { type: boolean, example: true }
 *         message: { type: string, example: "Error de validacion" }
 *         code: { type: string, example: "VALIDATION_ERROR" }
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field: { type: string, example: "email" }
 *               message: { type: string, example: "Email no valido" }
 *     Pagination:
 *       type: object
 *       properties:
 *         total: { type: integer, example: 42 }
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 10 }
 *         totalPages: { type: integer, example: 5 }
 *         hasNextPage: { type: boolean, example: true }
 *         hasPrevPage: { type: boolean, example: false }
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *         id: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *         email: { type: string, format: email, example: "ana@example.com" }
 *         name: { type: string, example: "Ana" }
 *         lastName: { type: string, example: "Lopez" }
 *         fullName: { type: string, example: "Ana Lopez" }
 *         nif: { type: string, example: "12345678Z" }
 *         role: { type: string, enum: [admin, guest], example: "admin" }
 *         status: { type: string, enum: [pending, verified, blocked], example: "verified" }
 *         verificationAttempts: { type: integer, example: 3 }
 *         company: { type: string, example: "65f1f77bcf3f1b8ad2f45c11" }
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       required: [email]
 *     Company:
 *       type: object
 *       properties:
 *         _id: { type: string, example: "65f1f77bcf3f1b8ad2f45c11" }
 *         owner: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *         name: { type: string, example: "Construcciones Norte SL" }
 *         cif: { type: string, example: "B12345678" }
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         logo: { type: string, example: "https://res.cloudinary.com/demo/logo.png" }
 *         isFreelance: { type: boolean, example: false }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       required: [name, cif]
 *     Client:
 *       type: object
 *       properties:
 *         _id: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *         user: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *         company: { type: string, example: "65f1f77bcf3f1b8ad2f45c11" }
 *         name: { type: string, example: "Cliente Demo SL" }
 *         cif: { type: string, example: "B87654321" }
 *         email: { type: string, format: email, example: "cliente@example.com" }
 *         phone: { type: string, example: "600123123" }
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *       required: [user, company, cif, email]
 *     Project:
 *       type: object
 *       properties:
 *         _id: { type: string, example: "65f1f77bcf3f1b8ad2f45c13" }
 *         user: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *         company: { type: string, example: "65f1f77bcf3f1b8ad2f45c11" }
 *         client: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *         name: { type: string, example: "Reforma local centro" }
 *         projectCode: { type: string, example: "PRJ-LQ4S0A-8F3J2K" }
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         email: { type: string, format: email, example: "obra@example.com" }
 *         notes: { type: string, example: "Acceso por calle lateral" }
 *         active: { type: boolean, example: true }
 *       required: [user, company, client, name]
 *     DeliveryNote:
 *       type: object
 *       properties:
 *         _id: { type: string, example: "65f1f77bcf3f1b8ad2f45c14" }
 *         user: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *         company: { type: string, example: "65f1f77bcf3f1b8ad2f45c11" }
 *         client: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *         project: { type: string, example: "65f1f77bcf3f1b8ad2f45c13" }
 *         format: { type: string, enum: [material, hours], example: "material" }
 *         description: { type: string, example: "Entrega de material" }
 *         workDate: { type: string, format: date-time, example: "2026-04-29T10:00:00.000Z" }
 *         material:
 *           type: object
 *           properties:
 *             unit: { type: string, example: "kg" }
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name: { type: string, example: "Cemento" }
 *                   quantity: { type: number, example: 20 }
 *         workers:
 *           type: object
 *           properties:
 *             hours: { type: number, example: 8 }
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name: { type: string, example: "Operario 1" }
 *                   hours: { type: number, example: 8 }
 *         signed: { type: boolean, example: false }
 *         signedAt: { type: string, format: date-time, nullable: true }
 *         signatureUrl: { type: string, nullable: true, example: "https://res.cloudinary.com/demo/signature.png" }
 *         pdfUrl: { type: string, nullable: true, example: "https://res.cloudinary.com/demo/albaran.pdf" }
 *       required: [user, company, client, project, format]
 *     AuthResponse:
 *       type: object
 *       properties:
 *         userData:
 *           type: object
 *           properties:
 *             email: { type: string, example: "ana@example.com" }
 *             status: { type: string, example: "pending" }
 *             role: { type: string, example: "admin" }
 *             id: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *             verificationCode: { type: string, example: "123456" }
 *         accessToken: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *         refreshToken: { type: string, example: "7f8e9d2c0a1b..." }
 *   responses:
 *     BadRequest:
 *       description: Solicitud invalida o error de validacion.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "Error de validacion"
 *             code: "VALIDATION_ERROR"
 *             details:
 *               - field: "email"
 *                 message: "Email no valido"
 *     Unauthorized:
 *       description: Token ausente, invalido o credenciales incorrectas.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "No se proporciono token"
 *             code: "UNAUTHORIZED"
 *     Forbidden:
 *       description: Usuario sin permisos, rol incorrecto o estado no permitido.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "No tienes permisos para realizar esta accion"
 *             code: "FORBIDDEN"
 *     NotFound:
 *       description: Recurso no encontrado.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "Recurso no encontrado"
 *             code: "NOT_FOUND"
 *     Conflict:
 *       description: Conflicto con recurso existente o clave unica duplicada.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "Ya existe un registro con ese 'email'"
 *             code: "DUPLICATE_KEY"
 *     TooManyRequests:
 *       description: Limite de peticiones o intentos excedido.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "Demasiadas peticiones"
 *             code: "RATE_LIMIT"
 *     InternalError:
 *       description: Error interno del servidor.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: true
 *             message: "Error interno del servidor"
 *             code: "INTERNAL_ERROR"
 *   parameters:
 *     MongoId:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         pattern: "^[0-9a-fA-F]{24}$"
 *       example: "65f1f77bcf3f1b8ad2f45c12"
 *     SoftDelete:
 *       name: soft
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["true", "false"]
 *       example: "true"
 *     Page:
 *       name: page
 *       in: query
 *       required: false
 *       schema: { type: integer, minimum: 1, default: 1 }
 *     Limit:
 *       name: limit
 *       in: query
 *       required: false
 *       schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 */

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags: [User]
 *     summary: Registra un usuario administrador.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Ana" }
 *               email: { type: string, format: email, example: "ana@example.com" }
 *               password: { type: string, format: password, example: "Password1" }
 *           example:
 *             name: "Ana"
 *             email: "ana@example.com"
 *             password: "Password1"
 *     responses:
 *       200:
 *         description: Usuario registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   put:
 *     tags: [User]
 *     summary: Completa o actualiza los datos personales del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lastName, nif]
 *             properties:
 *               name: { type: string, example: "Ana" }
 *               lastName: { type: string, example: "Lopez" }
 *               nif: { type: string, example: "12345678Z" }
 *           example:
 *             name: "Ana"
 *             lastName: "Lopez"
 *             nif: "12345678Z"
 *     responses:
 *       200:
 *         description: Usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/login:
 *   post:
 *     tags: [User]
 *     summary: Inicia sesion y devuelve tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "ana@example.com" }
 *               password: { type: string, format: password, example: "Password1" }
 *           example:
 *             email: "ana@example.com"
 *             password: "Password1"
 *     responses:
 *       200:
 *         description: Login correcto.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/validation:
 *   put:
 *     tags: [User]
 *     summary: Verifica el codigo de doble paso del usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, minLength: 6, maxLength: 6, example: "123456" }
 *           example:
 *             code: "123456"
 *     responses:
 *       200:
 *         description: Usuario verificado.
 *         content:
 *           application/json:
 *             example:
 *               message: "Usuario verificado"
 *               user:
 *                 _id: "65f1f77bcf3f1b8ad2f45c10"
 *                 email: "ana@example.com"
 *                 status: "verified"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user:
 *   get:
 *     tags: [User]
 *     summary: Obtiene el usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   delete:
 *     tags: [User]
 *     summary: Elimina el usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SoftDelete'
 *     responses:
 *       200:
 *         description: Usuario eliminado.
 *         content:
 *           application/json:
 *             example:
 *               message: "Usuario eliminado (soft delete)"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/company:
 *   patch:
 *     tags: [User, Company]
 *     summary: Crea o asocia la compania del usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [isFreelance]
 *                 properties:
 *                   isFreelance: { type: boolean, enum: [true], example: true }
 *               - type: object
 *                 required: [isFreelance, name, cif, address]
 *                 properties:
 *                   isFreelance: { type: boolean, enum: [false], example: false }
 *                   name: { type: string, example: "Construcciones Norte SL" }
 *                   cif: { type: string, example: "B12345678" }
 *                   address:
 *                     $ref: '#/components/schemas/Address'
 *           example:
 *             isFreelance: false
 *             name: "Construcciones Norte SL"
 *             cif: "B12345678"
 *             address:
 *               street: "Gran Via"
 *               number: "12"
 *               postal: "28013"
 *               city: "Madrid"
 *               province: "Madrid"
 *     responses:
 *       200:
 *         description: Compania creada/asociada o usuario actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Company'
 *                 - $ref: '#/components/schemas/User'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/logo:
 *   patch:
 *     tags: [User, Company]
 *     summary: Sube el logo de la compania.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [logo]
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Logo subido.
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 filename: "logo-1714380000000.png"
 *                 originalName: "logo.png"
 *                 url: "http://localhost:3000/uploads/logo-1714380000000.png"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/refresh:
 *   post:
 *     tags: [User]
 *     summary: Renueva la sesion con un refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string, example: "7f8e9d2c0a1b" }
 *           example:
 *             refreshToken: "7f8e9d2c0a1b"
 *     responses:
 *       200:
 *         description: Sesion renovada.
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/logout:
 *   post:
 *     tags: [User]
 *     summary: Cierra todas las sesiones activas del usuario.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones cerradas.
 *         content:
 *           application/json:
 *             example:
 *               message: "Todas las sesiones cerradas"
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/password:
 *   put:
 *     tags: [User]
 *     summary: Cambia la contrasena del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password, example: "Password1" }
 *               newPassword: { type: string, format: password, example: "Newpass1" }
 *           example:
 *             currentPassword: "Password1"
 *             newPassword: "Newpass1"
 *     responses:
 *       200:
 *         description: Contrasena actualizada.
 *         content:
 *           application/json:
 *             example:
 *               message: "Contrasena actualizada"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/invite:
 *   post:
 *     tags: [User]
 *     summary: Invita a un usuario guest a la compania.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, lastName, password]
 *             properties:
 *               email: { type: string, format: email, example: "invitado@example.com" }
 *               name: { type: string, example: "Luis" }
 *               lastName: { type: string, example: "Perez" }
 *               password: { type: string, format: password, example: "Password1" }
 *           example:
 *             email: "invitado@example.com"
 *             name: "Luis"
 *             lastName: "Perez"
 *             password: "Password1"
 *     responses:
 *       201:
 *         description: Usuario invitado.
 *         content:
 *           application/json:
 *             example:
 *               message: "Usuario invitado con exito"
 *               user:
 *                 email: "invitado@example.com"
 *                 role: "guest"
 *                 status: "pending"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/user/clean:
 *   delete:
 *     tags: [User]
 *     summary: Limpia usuarios, companias, ficheros y refresh tokens.
 *     responses:
 *       200:
 *         description: Base de datos limpiada.
 *         content:
 *           application/json:
 *             example:
 *               message: "Base de datos limpiada"
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 */

/**
 * @openapi
 * /api/client:
 *   post:
 *     tags: [Client]
 *     summary: Crea un cliente para la compania del usuario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif, email]
 *             properties:
 *               name: { type: string, example: "Cliente Demo SL" }
 *               cif: { type: string, example: "B87654321" }
 *               email: { type: string, format: email, example: "cliente@example.com" }
 *               phone: { type: string, example: "600123123" }
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *           example:
 *             name: "Cliente Demo SL"
 *             cif: "B87654321"
 *             email: "cliente@example.com"
 *             phone: "600123123"
 *             address:
 *               street: "Mayor"
 *               number: "3"
 *               postal: "28001"
 *               city: "Madrid"
 *               province: "Madrid"
 *     responses:
 *       201:
 *         description: Cliente creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   get:
 *     tags: [Client]
 *     summary: Lista clientes con paginacion y filtros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - name: sort
 *         in: query
 *         schema: { type: string, example: "-createdAt" }
 *       - name: name
 *         in: query
 *         schema: { type: string, example: "Cliente Demo SL" }
 *       - name: cif
 *         in: query
 *         schema: { type: string, example: "B87654321" }
 *     responses:
 *       200:
 *         description: Lista paginada de clientes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *             example:
 *               data:
 *                 - _id: "65f1f77bcf3f1b8ad2f45c12"
 *                   name: "Cliente Demo SL"
 *                   cif: "B87654321"
 *                   email: "cliente@example.com"
 *               pagination:
 *                 total: 1
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 1
 *                 hasNextPage: false
 *                 hasPrevPage: false
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/client/archived:
 *   get:
 *     tags: [Client]
 *     summary: Lista clientes archivados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clientes archivados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/client/{id}:
 *   get:
 *     tags: [Client]
 *     summary: Obtiene un cliente por id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   put:
 *     tags: [Client]
 *     summary: Actualiza un cliente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Cliente Actualizado SL" }
 *               cif: { type: string, example: "B87654321" }
 *               email: { type: string, format: email, example: "cliente.updated@example.com" }
 *               phone: { type: string, example: "600123124" }
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *           example:
 *             name: "Cliente Actualizado SL"
 *             email: "cliente.updated@example.com"
 *     responses:
 *       200:
 *         description: Cliente actualizado.
 *         content:
 *           application/json:
 *             example:
 *               name: "Cliente Actualizado SL"
 *               email: "cliente.updated@example.com"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   delete:
 *     tags: [Client]
 *     summary: Elimina un cliente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *       - $ref: '#/components/parameters/SoftDelete'
 *     responses:
 *       200:
 *         description: Cliente eliminado.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               clientName: "Cliente Demo SL"
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/client/{id}/restore:
 *   patch:
 *     tags: [Client]
 *     summary: Restaura un cliente archivado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Cliente restaurado.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 */

/**
 * @openapi
 * /api/project:
 *   post:
 *     tags: [Project]
 *     summary: Crea un proyecto asociado a un cliente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [client, name]
 *             properties:
 *               client: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *               name: { type: string, example: "Reforma local centro" }
 *               email: { type: string, format: email, example: "obra@example.com" }
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *               notes: { type: string, example: "Acceso por calle lateral" }
 *               active: { type: boolean, example: true }
 *           example:
 *             client: "65f1f77bcf3f1b8ad2f45c12"
 *             name: "Reforma local centro"
 *             email: "obra@example.com"
 *             notes: "Acceso por calle lateral"
 *             active: true
 *     responses:
 *       201:
 *         description: Proyecto creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   get:
 *     tags: [Project]
 *     summary: Lista proyectos con paginacion y filtros.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - name: sort
 *         in: query
 *         schema: { type: string, example: "-createdAt" }
 *       - name: name
 *         in: query
 *         schema: { type: string, example: "Reforma local centro" }
 *       - name: active
 *         in: query
 *         schema: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Lista paginada de proyectos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/project/archived:
 *   get:
 *     tags: [Project]
 *     summary: Lista proyectos archivados.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyectos archivados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/project/{id}:
 *   get:
 *     tags: [Project]
 *     summary: Obtiene un proyecto por id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Proyecto encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   put:
 *     tags: [Project]
 *     summary: Actualiza un proyecto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user: { type: string, example: "65f1f77bcf3f1b8ad2f45c10" }
 *               client: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *               name: { type: string, example: "Reforma local actualizado" }
 *               email: { type: string, format: email, example: "obra.updated@example.com" }
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *               notes: { type: string, example: "Nueva nota" }
 *               active: { type: boolean, example: false }
 *           example:
 *             name: "Reforma local actualizado"
 *             active: false
 *     responses:
 *       200:
 *         description: Proyecto actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   delete:
 *     tags: [Project]
 *     summary: Elimina un proyecto.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *       - $ref: '#/components/parameters/SoftDelete'
 *     responses:
 *       200:
 *         description: Proyecto eliminado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/project/{id}/restore:
 *   patch:
 *     tags: [Project]
 *     summary: Restaura un proyecto archivado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Proyecto restaurado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 */

/**
 * @openapi
 * /api/deliverynote:
 *   post:
 *     tags: [DeliveryNote]
 *     summary: Crea un albaran de materiales u horas.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [client, project, format, material]
 *                 properties:
 *                   client: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *                   project: { type: string, example: "65f1f77bcf3f1b8ad2f45c13" }
 *                   format: { type: string, enum: [material], example: "material" }
 *                   description: { type: string, example: "Entrega de material" }
 *                   workDate: { type: string, format: date, example: "2026-04-29" }
 *                   material:
 *                     type: object
 *                     properties:
 *                       unit: { type: string, example: "kg" }
 *                       data:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name: { type: string, example: "Cemento" }
 *                             quantity: { type: number, example: 20 }
 *               - type: object
 *                 required: [client, project, format, workers]
 *                 properties:
 *                   client: { type: string, example: "65f1f77bcf3f1b8ad2f45c12" }
 *                   project: { type: string, example: "65f1f77bcf3f1b8ad2f45c13" }
 *                   format: { type: string, enum: [hours], example: "hours" }
 *                   description: { type: string, example: "Horas trabajadas" }
 *                   workDate: { type: string, format: date, example: "2026-04-29" }
 *                   workers:
 *                     type: object
 *                     properties:
 *                       hours: { type: number, example: 8 }
 *                       workers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name: { type: string, example: "Operario 1" }
 *                             hours: { type: number, example: 8 }
 *           example:
 *             client: "65f1f77bcf3f1b8ad2f45c12"
 *             project: "65f1f77bcf3f1b8ad2f45c13"
 *             format: "material"
 *             description: "Entrega de material"
 *             workDate: "2026-04-29"
 *             material:
 *               unit: "kg"
 *               data:
 *                 - name: "Cemento"
 *                   quantity: 20
 *     responses:
 *       201:
 *         description: Albaran creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   get:
 *     tags: [DeliveryNote]
 *     summary: Lista albaranes con paginacion, filtros y rango de fecha.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - name: sort
 *         in: query
 *         schema: { type: string, example: "-createdAt" }
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date, example: "2026-04-01" }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date, example: "2026-04-30" }
 *       - name: format
 *         in: query
 *         schema: { type: string, enum: [material, hours], example: "material" }
 *       - name: signed
 *         in: query
 *         schema: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Lista paginada de albaranes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryNote'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/deliverynote/{id}:
 *   get:
 *     tags: [DeliveryNote]
 *     summary: Obtiene un albaran por id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: Albaran encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 *   delete:
 *     tags: [DeliveryNote]
 *     summary: Elimina un albaran no firmado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *       - $ref: '#/components/parameters/SoftDelete'
 *     responses:
 *       200:
 *         description: Albaran eliminado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     tags: [DeliveryNote]
 *     summary: Descarga el PDF de un albaran.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     responses:
 *       200:
 *         description: PDF generado o descargado.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     tags: [DeliveryNote]
 *     summary: Firma un albaran y sube el PDF firmado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/MongoId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [signature]
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Imagen binaria de la firma.
 *     responses:
 *       200:
 *         description: Albaran firmado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 *       500: { $ref: '#/components/responses/InternalError' }
 */
