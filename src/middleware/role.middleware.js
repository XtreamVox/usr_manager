// src/middleware/rol.middleware.js
import { AppError } from "../utils/AppError.js";
/**
 * Middleware de autorización por rol
 * @param {string|string[]} roles - Role permitido (string) o array de roles permitidos
 */
const checkRol = (roles) => (req, res, next) => {
  try {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    const { user } = req;

    if (!user) {
      throw AppError.unauthorized("Usuario no autenticado");
    }

    const userRol = user.role;

    const checkValueRol = allowedRoles.includes(userRol);

    if (!checkValueRol) {
      throw AppError.forbidden("No tienes permisos para realizar esta acción");
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkRol;