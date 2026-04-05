// src/middleware/rol.middleware.js
// ASK: Import correcto de AppError
import { AppError } from "../utils/AppError.js";
/**
 * Middleware de autorización por rol
 * @param {string|string[]} roles - Role permitido (string) o array de roles permitidos
 */
const checkRol = (roles) => (req, res, next) => {
  try {
    // ASK: Convertir string a array si es necesario
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // El usuario viene del middleware de autenticación
    const { user } = req;

    // ASK: Validación de usuario autenticado
    if (!user) {
      throw AppError.unauthorized("Usuario no autenticado");
    }

    // Obtener rol del usuario
    const userRol = user.role;

    // Verificar si el rol está en la lista de permitidos
    const checkValueRol = allowedRoles.includes(userRol);

    // ASK: Lanzar error si el rol no está permitido
    if (!checkValueRol) {
      throw AppError.forbidden("No tienes permisos para realizar esta acción");
    }

    next();
  } catch (err) {
    // ASK: Pasar error al middleware de error
    next(err);
  }
};

export default checkRol;