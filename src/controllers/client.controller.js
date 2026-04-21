import Client from "../models/client.models.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.models.js";

export async function createClient(req, res, next) {
  try {
    const { name, cif, email, phone, address } = req.body;

    const repe = await Client.find({ company: req.user.company, cif: cif });
    if (repe)
      throw AppError.conflict("Ya existe el cliente asociado a esta company");

    const client = await Client.create({
      user: req.user._id,
      company: req.user.company,
      name: name,
      cif: cif,
      email: email,
      phone: phone,
      address: phone,
    });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
}

export async function updateClient(req, res, next) {
  try {
    const { id } = req.params;

    const obj = req.body;

    // recuperar el client y actualizar
    const client = await Client.findByIdAndUpdate(id, obj);

    res.status(200).json(obj);
  } catch (error) {
    next(error);
  }
}

// ASK listar con populate?
export async function getAllClients(req, res, next) {
  try {
    // TODO gestionar querys y establecer defaults con zod
    const { limit, sort, page, filter } = req.query;
    // TODO hacer esto en zod: limit ? minimum(limit, 100) : 1;
    const skip = (page - 1) * limit;
    const clients = await Client.find(filter)
      .populate("Company", "User")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments();
    res.json({
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getClient(req, res, next) {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req, res, next) {
  try {
    // TODO hacer que llegue como bool en zod
    const { soft } = req.query;
    const { id } = req.params;

    const client = Client.findById(id);

    if (soft) {
      await Client.softDeleteById(id);
    } else {
      await Client.hardDelete(id);
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
}

export async function listArchivedClients(req, res, next) {
  try {
    const clients = Client.findDeleted();
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
}

export async function restoreArchivedClientById(req, res, next) {
  try {
    const { id } = req.params;

    // ASK gestionar distintos errores de existencia ??
    const clients = Client.restoreById();
    res.status(200).json(clients);
  } catch (error){
    next(error);
  }
}
