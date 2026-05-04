import Client from "../models/client.models.js";
import Project from "../models/project.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";
import { emitToCompany, SOCKET_EVENTS } from "../services/socket.service.js";

export async function createProject(req, res, next) {
  const client = await Client.findOne({
    _id: req.body.client,
    company: req.user.company,
  });
  if (!client) throw AppError.notFound("No se encontró el cliente");

  const project = await Project.create({
    user: req.user,
    company: req.user.company,
    ...req.body,
  });

  emitToCompany(project.company, SOCKET_EVENTS.PROJECT_NEW, project);
  res.status(201).json(project);
}

export async function updateProject(req, res, next) {
  const { id } = req.params;
  let project = await Project.findOne({ _id: id, company: req.user.company });
  if (!project) throw AppError.notFound("Proyecto no encontrado");

  await project.updateOne(req.body, { new: true });
  res.status(200).json(project);
}

export async function getAllProjects(req, res, next) {
  const { limit, sort, page, filters } = req.query;
  const query = { ...filters, company: req.user.company };
  const skip = (page - 1) * limit;
  const projects = await Project.find(query)
    .populate("company", "name")
    .populate("user", "name")
    .populate("client", "name")
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await Project.countDocuments(query);
  res.json({
    data: projects,
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

export async function getProject(req, res, next) {
  const { id } = req.params;

  const project = await Project.findOne({
    _id: id,
    company: req.user.company,
  });

  if (!project) throw AppError.notFound("Projecto no encontrado");

  res.status(200).json(project);
}

export async function deleteProject(req, res, next) {
  const { soft } = req.query;
  const { id } = req.params;

  const project = await Project.findOne({ _id: id, company: req.user.company });
  if (!project) throw AppError.notFound("Projecto no encontrado");

  if (soft) {
    await Project.softDeleteById(id);
  } else {
    await Project.hardDelete(id);
  }

  res.status(200).json(project);
}

export async function listArchivedProjects(req, res, next) {
  const projects = await Project.findDeleted({ company: req.user.company });
  res.status(200).json(projects);
}

export async function restoreArchivedProjectById(req, res, next) {
  const { id } = req.params;

  const isDeleted = await Project.findDeleted({
    _id: id,
    company: req.user.company,
  });
  if (!isDeleted) throw AppError.notFound("No hay cliente archivado");

  const projects = await Project.restoreById(id);
  res.status(200).json(projects);
}
