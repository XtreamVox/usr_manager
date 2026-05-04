import Client from "../models/client.models.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.models.js";
import Company from "../models/company.models.js";
import { success } from "zod";
import { emitToCompany, SOCKET_EVENTS } from "../services/socket.service.js";

export async function createClient(req, res, next) {
  const { name, cif, email, phone, address } = req.body;

  const repe = await Client.findOne({ company: req.user.company, cif: cif });

  if (repe)
    throw AppError.conflict("Ya existe el cliente asociado a esta company");

  const client = await Client.create({
    user: req.user._id,
    company: req.user.company,
    name: name,
    cif: cif,
    email: email,
    phone: phone,
    address: address,
  });

  emitToCompany(client.company, SOCKET_EVENTS.CLIENT_NEW, client);
  res.status(201).json(client);
}

export async function updateClient(req, res, next) {
  const { id } = req.params;

  const obj = req.body;

  // recuperar el client y actualizar
  const client = await Client.findOne({ _id: id, company: req.user.company });
  if (!client) throw AppError.notFound("Cliente no encontrado");
  await client.updateOne(obj, { new: true, runValidators: true });

  res.status(200).json(obj);
}

export async function getAllClients(req, res, next) {
  const { limit, sort, page, filters } = req.query;
  const query = { ...filters, company: req.user.company };
  const skip = (page - 1) * limit;
  const clients = await Client.find(query)
    .populate("company", "name")
    .populate("user", "name")
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await Client.countDocuments(query);
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
}

export async function getClient(req, res, next) {
  const { id } = req.params;

  const client = await Client.findOne({ _id: id, company: req.user.company });
  if (!client) throw AppError.notFound("Cliente no encontrado");

  res.status(200).json(client);
}

export async function deleteClient(req, res, next) {
  const { soft } = req.query;
  const { id } = req.params;

  const client = await Client.findOne({ _id: id, company: req.user.company });
  if (!client) throw AppError.notFound("Cliente no encontrado");

  if (soft) {
    await Client.softDeleteById(id);
  } else {
    await Client.hardDelete(id);
  }

  res.status(200).json({
    success: true,
    clientName: client.name,
  });
}

export async function listArchivedClients(req, res, next) {
  console.log(req.user.company);
  const clients = await Client.findDeleted({ company: req.user.company });
  if (!clients) throw AppError.notFound("Cliente no encontrado");

  res.status(200).json(clients);
}

export async function restoreArchivedClientById(req, res, next) {
  const { id } = req.params;

  const isDeleted = await Client.findDeleted({
    _id: id,
    company: req.user.company,
  });
  if (isDeleted.length <= 0)
    throw AppError.notFound("No hay cliente archivado");

  const client = await Client.restoreById(id);
  res.status(200).json({
    success: true,
  });
}
