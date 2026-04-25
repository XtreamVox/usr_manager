import Client from "../models/client.models.js";
import Project from "../models/project.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";

export function createProject(req, res, next) {
  try {
    // recibe ObjectIds
    const { name, client } = req.body;

    const project = Project.create({
      user: req.user,
      company: req.user.company,
      name: name,
      client: client,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    let project = Project.findOne({ _id: id, company: req.user.company });
    if (!project) throw AppError.notFound("Pryecto no encontrado");

    if (req.user.role == "admin") {
      const userToReasign = User.findOne({
        _id: req.body.user,
        company: req.user.company,
      });
      if (!userToReasign) throw AppError.notFound("Usuario no encontrado");
      project.updateOne(req.body, { new: true });
    } else {
      if (req.body.user != null)
        throw AppError.forbidden("Un guest no puede reasignar un proyecto");
      project.updateOne(req.body, { new: true });
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}

export async function getAllProjects(req, res, next) {
  try {
    const { limit, sort, page, filter } = req.query;
    const skip = (page - 1) * limit;
    const projects = await Project.find({ filter, company: req.user.company })
      .populate(["Company", "User", "Client"])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments();
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
  } catch (error) {
    next(error);
  }
}

export async function getProject(req, res, next) {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      _id: id,
      company: req.user.company,
    });

    if (!project) throw AppError.notFound("Projecto no encontrado");

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { soft } = req.query;
    const { id } = req.params;

    const project = Project.findOne({ _id: id, company: req.user.company });
    if (!project) throw AppError.notFound("Projecto no encontrado");

    if (soft) {
      await Project.softDeleteById(id);
    } else {
      await Project.hardDelete(id);
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}

export async function listArchivedProjects(req, res, next) {
  try {
    const projects = Project.findDeleted({ company: req.user.company });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
}

export async function restoreArchivedProjectById(req, res, next) {
  try {
    const { id } = req.params;

    const isDeleted = await Project.findDeleted({
      _id: id,
      company: req.user.company,
    });
    if (!isDeleted) throw AppError.notFound("No hay cliente archivado");

    const projects = Project.restoreById(id);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
}
