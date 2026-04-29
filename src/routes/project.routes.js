import { Router } from "express";
import authMiddleware from "../middleware/auth.midddleware.js";
import checkRol from "../middleware/role.middleware.js";
import { validate, validateFile } from "../middleware/validate.middleware.js";
import { checkForCompany, validateProjectUpdate } from "../middleware/client_checks.middleware.js"

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
  softDeleteProjectScheme,
  getProjectScheme,
  createProjectScheme,
  restoreArchivedProjectScheme,
  updateProjectBodyScheme,
  updateProjectIdScheme,
  validateDeleteIdScheme,
} from "../squemes/project.squemes.js";
import { get } from "mongoose";

const router = Router();

router.post("/", authMiddleware, checkForCompany, validate({body : createProjectScheme}), createProject);
router.get("/archived", authMiddleware, checkForCompany, checkRol("admin"), listArchivedProjects)
router.get("/",authMiddleware, checkForCompany, validate({query: ProjectPaginationAndFilterScheme}), getAllProjects)
router.put("/:id", authMiddleware, checkForCompany, validate({ body : updateProjectBodyScheme}), validate({params : updateProjectIdScheme}), validateProjectUpdate, updateProject)
router.get("/:id",authMiddleware, checkForCompany, validate({params: getProjectScheme}) ,getProject)
router.delete("/:id", authMiddleware, checkForCompany, checkRol("admin"), validate({ params : validateDeleteIdScheme}), validate({query: softDeleteProjectScheme}), deleteProject)
router.patch("/:id/restore", authMiddleware, checkForCompany, checkRol("admin"), validate({ params : restoreArchivedProjectScheme}), restoreArchivedProjectById)

export default router;