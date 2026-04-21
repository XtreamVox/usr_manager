import Client from "../models/client.models.js";
import Project from "../models/project.models.js";
import User from "../models/user.models.js";
import { AppError } from "../utils/AppError.js";

export default function createProject(req, res, next) {
  try {
    // recibe ObjectIds
    const { user, company, name, client } = req.body;

    const userDoc = User.findById(user);
    const clientDoc = Client.findById(client);
    if (userDoc.company != company) throw AppError.badRequest("El usuario debe pertenecer a la company");
    if (clientDoc.company != company) throw AppError.badRequest("El cliente debe pertenecer a la company");

    const project = Project.create({
      user: user,
      company: company,
      name: name,
      client: client,
    });

    res.status(201).json(project)
  } catch (error) {
    next(error);
  }
}
// ASK hasta que punto se puede modificar
export default function updateProject(req, res, next) {
    try {
        const { id } = req.params;
        const project = Project.findByIdAndUpdate(id, req.body);

        
        res.status(200).json(project)
    } catch (error) {
        next(error)
    }
}


export async function getAllProjects(req, res, next) {
  try {
    // TODO gestionar querys y establecer defaults con zod
    const { limit, sort, page, filter } = req.query;
    // TODO hacer esto en zod: limit ? minimum(limit, 100) : 1;
    const skip = (page - 1) * limit;
    const projects = await Project.find(filter)
      .populate("Company", "User", "Client")
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

    const project = await Project.findById(id);

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    // TODO hacer que llegue como bool en zod
    const { soft } = req.query;
    const { id } = req.params;

    const project = Project.findById(id);

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
    const projects = Project.findDeleted();
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
}


export async function restoreArchivedProjectById(req, res, next) {
  try {
    const { id } = req.params;

    // ASK gestionar distintos errores de existencia ??
    const projects = Project.restoreById();
    res.status(200).json(projects);
  } catch (error){
    next(error);
  }
}

