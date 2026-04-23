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

// TODO guardar client en el request, para optimizar los endpoints
export const checkUserAndClientInCompany = async (req, res, next) => {
  try {
    const client = Client.findById(req.params.id)

    if (req.user.company != client.company)
      throw AppError.badRequest("El usuario y el cliente no pertenecen a la misma company");
    next();
  } catch (error) {
    next(error);
  }
};
