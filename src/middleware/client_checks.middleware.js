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
