import { Router } from "express";
import authMiddleware from "../middleware/auth.midddleware.js";
import checkRol from "../middleware/role.middleware.js";
import { validate, validateFiles } from "../middleware/validate.middleware.js";
import { checkForCompany } from "../middleware/client_checks.middleware.js"

import {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProject,
  listArchivedProjects,
  restoreArchivedProjectById,
} from "../controllers/project.controller.js";

import {
  ProjectPaginationAndFilterScheme,
  deleteProjectScheme,
  getProjectScheme,
  postProjectScheme,
  restoreArchivedProjectScheme,
  updateProjectBodyScheme,
  updateProjectIdScheme,
  validateDeleteIdScheme,
} from "../squemes/project.squemes.js";
import { get } from "mongoose";

const router = Router();

router.post("/", authMiddleware, checkForCompany, validate({body : postProjectScheme}), createProject);
router.put("/:id", authMiddleware, checkForCompany, validate({params : updateProjectIdScheme}), validate({ body : updateProjectBodyScheme}), updateProject)
router.get("/",authMiddleware, checkForCompany, validate({query: ProjectPaginationAndFilterScheme}), getAllProjects)
router.get("/:id",authMiddleware, checkForCompany, validate({params: getProjectScheme}) ,getProject)
router.delete("/:id", authMiddleware, checkForCompany, checkRol("admin"), validate({ params : validateDeleteIdScheme}), validate({query: deleteProjectScheme}), deleteProject)
router.get("/archived", authMiddleware, checkForCompany, checkRol("admin"), listArchivedProjects) // ASK estos también se paginan?
router.patch("/:id/restore", authMiddleware, checkForCompany, checkRol("admin"), validate({ params : restoreArchivedProjectScheme}), restoreArchivedProjectById)