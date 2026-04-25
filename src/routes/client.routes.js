import { Router } from "express";
import uploadMiddleware from "../utils/handleStorage.utils.js";
import authMiddleware from "../middleware/auth.midddleware.js";
import checkRol from "../middleware/role.middleware.js";
import { checkForCompany } from "../middleware/client_checks.middleware.js";
import checkStatus from "../middleware/status.middleware.js";
import { validateFile, validate } from "../middleware/validate.middleware.js";
import {
  createClient,
  deleteClient,
  getAllClients,
  getClient,
  listArchivedClients,
  restoreArchivedClientById,
  updateClient,
} from "../controllers/client.controller.js";

import {
  ClientPaginationAndFilterScheme,
  createClientScheme,
  sortDeleteClientScheme,
  getClientScheme,
  restoreArchivedProjectScheme,
  validateDeleteIdScheme,
  updateClientDataScheme,
  validateClientIdScheme
} from "../squemes/client.squemes.js";

const router = Router()

router.post("/", authMiddleware, validate({body : createClientScheme }), checkForCompany, createClient);
router.put("/:id", authMiddleware, validate({body : updateClientDataScheme}), validate({params: validateClientIdScheme}), checkForCompany, updateClient);
router.get("/", authMiddleware, validate({query: ClientPaginationAndFilterScheme}), checkForCompany, getAllClients)
router.get("/:id", authMiddleware, validate({params: validateClientIdScheme}), checkForCompany, getClient);
router.delete("/:id", authMiddleware, validate({params: validateDeleteIdScheme}), validate({query: sortDeleteClientScheme}), checkForCompany, deleteClient)
router.get("/archived", authMiddleware, checkRol("admin"), checkForCompany, listArchivedClients)
router.patch("/:id/restore", authMiddleware, checkRol("admin"), validate({params: validateClientIdScheme}), checkForCompany, restoreArchivedClientById)

export default router;