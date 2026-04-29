import Client from "../models/client.models.js";
import Company from "../models/company.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";

export const checkForCompany = async (req, res, next) => {
  try {
    if (!req.user.company)
      throw AppError.badRequest("El cliente no tiene company asociada");
    next();
  } catch (error) {
    next(error);
  }
};

export const validateProjectUpdate = async (req, res, next) => {
  try {
    if (req.user.role == "admin" && req.body.user != null) {
      const userToReasign = await User.findOne({
        _id: req.body.user,
        company: req.user.company,
      });
      if (!userToReasign) throw AppError.notFound("Usuario no encontrado");
    } else {
      if (req.body.user != null)
        throw AppError.forbidden("Un guest no puede reasignar un proyecto");
    }
    next();
  } catch (error) {
    next(error)
  }
}
