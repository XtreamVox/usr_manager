import Client from "../models/client.models.js";
import Company from "../models/company.models.js";

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
      const userToReasign = User.findOne({
        _id: req.body.user,
        company: req.user.company,
      });
      if (!userToReasign) throw AppError.notFound("Usuario no encontrado");
    } else {
      if (req.body.user != null)
        throw AppError.forbidden("Un guest no puede reasignar un proyecto");
    }
  } catch (error) {
    next(error)
  }
}