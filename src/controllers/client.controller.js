import Client from "../models/client.models.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.models.js";

export async function createClient(req, res, error) {
  try {
    const { name, cif, email, phone, address } = req.body;

    const repe = await Client.find({ company: req.user.company, cif: cif });
    if (repe)
      throw AppError.conflict("Ya existe el cliente asociado a esta company");

    const client = await Client.create({
      user: req.user._id,
      company: req.user.company,
      name,
      cif,
      email,
      phone,
      address,
    });
    res.status(201).json(client);
  } catch {
    next(error);
  }
}

export async function updateClient(req, res, error) {
  try {
    const { id } = req.params;

    const obj = req.body;

    // recuperar el client y actualizar
    const client = await Client.findByIdAndUpdate(id, obj);

    res.status(200).json(obj);
  } catch {
    next(error);
  }
}

// ASK listar con populate?
export async function getAllClients(req, res, error) {
  try {
    const { limit, sort } = req.query;
    // TODO hacer esto en zod: limit ? minimum(limit, 100) : 1;
    let clients;
    const skip = (page - 1) * limit;
    clients = await Client.find()
      .populate("Company", "User")
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = Client.countDocuments();
    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch {
    next(error);
  }
}

export async function getClient(req, res, error) {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    res.status(200).json(client);
  } catch {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
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
  } catch {
    next(error);
  }
}

export async function listArchivedClients(req, res, next) {
  try {
    const clients = Client.findDeleted();
    res.status(200).json(clients);
  } catch {
    next(error);
  }
}

export async function restoreArchivedClientById(req, res, next) {
  try {
    const {id} = req.params;

    // ASK gestionar distintos errores de existencia ??
    const clients = Client.restoreById();
    res.status(200).json(clients);
  } catch {
    next(error);
  }
}
