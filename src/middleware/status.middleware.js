import { AppError } from "../utils/AppError.js";
/**
 * Middleware de autorización por estado
 * @param {string|string[]} estados - Estado permitido (string) o array de estados permitidos
 */
const checkStatus = (estados) => (req, res, next) => {
  try {
    const allowedStates = Array.isArray(estados) ? estados : [estados];

    const { user } = req;

    if (!user) {
      throw AppError.unauthorized("Usuario no autenticado");
    }

    const userStatus = user.status;

    const checkValueStatus = allowedStates.includes(userStatus);

    if (!checkValueStatus) {
      throw AppError.forbidden("No tienes permisos para realizar esta acción");
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkStatus;