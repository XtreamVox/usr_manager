// src/middleware/session.middleware.js
import User from "../models/user.models.js";
// ASK: Import correcto de AppError
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/handleJWT.js";

/**
 * Middleware de autenticación
 * Verifica el token JWT y añade el usuario a req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar que existe el header Authorization
    if (!req.headers.authorization) {
      // ASK: Lanzar error en lugar de solo retornar
      throw AppError.unauthorized("No se proporcionó token");
    }

    // Extraer token: "Bearer eyJhbG..." -> "eyJhbG..."
    const token = req.headers.authorization.split(" ").pop();

    // Verificar token
    const dataToken = await verifyAccessToken(token);

    if (!dataToken || !dataToken._id) {
      // ASK: Lanzar error en lugar de solo retornar
      throw AppError.unauthorized("Token inválido");
    }

    // Buscar usuario y añadirlo a req
    const user = await User.findById(dataToken._id);

    if (!user) {
      // ASK: Lanzar error en lugar de solo retornar
      throw AppError.notFound("Usuario");
    }

    // Inyectar usuario en la petición
    req.user = user;

    next();
  } catch (err) {
    // ASK: Pasar error al middleware de error
    next(err);
  }
};

export default authMiddleware;
