import Client from "../models/client.models.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.models.js";
import Company from "../models/company.models.js";
import { success } from "zod";

export async function createClient(req, res, next) {
  try {
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
    const client = await Client.findByIdAndUpdate(id, obj,{ new : true });
    if(!client) throw AppError.notFound("Cliente no encontrado")

    res.status(200).json(obj);
  } catch (error) {
    next(error);
  }
}

//TODO los populate solo deben mostrar cierta información
export async function getAllClients(req, res, next) {
  try {
    const { limit, sort, page, filter } = req.query;
    const skip = (page - 1) * limit;
    const clients = await Client.find({...filter, company: req.user.company})
      .populate(["company", "user"])
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

    const client = await Client.findOne({_id: id, company: req.user.company});
    if(!client) throw AppError.notFound("Cliente no encontrado")

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req, res, next) {
  try {
    const { soft } = req.query;
    const { id } = req.params;
    
    
    const client = Client.findOne({_id: id, company: req.user.company});
    if(!client) throw AppError.notFound("Cliente no encontrado")

    if (soft === 'true') {
      await Client.softDeleteById(id);
    } else {
      await Client.hardDelete(id);
    }

    res.status(200).json( {
      success: true,
      clientName: client.name
    });
  } catch (error) {
    next(error);
  }
}

export async function listArchivedClients(req, res, next) {
  try {
    const clients = Client.findDeleted({company: req.user.company});
    if(!clients) throw AppError.notFound("Cliente no encontrado")

    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
}

export async function restoreArchivedClientById(req, res, next) {
  try {
    const { id } = req.params;

    const isDeleted = await Client.findDeleted({_id: id, company: req.user.company})
    if(!isDeleted)
      throw AppError.notFound("No hay cliente archivado")

    const client = Client.restoreById(id);
    res.status(200).json({
      success : true
    });
  } catch (error){
    next(error);
  }
}
