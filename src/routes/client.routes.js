import { Router } from "express";
import uploadMiddleware from "../utils/handleStorage.utils.js";
import authMiddleware from "../middleware/auth.midddleware.js";
import checkRol from "../middleware/role.middleware.js";
import { checkForCompany, checkUserAndClientInCompany } from "../middleware/client_checks.middleware.js";
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
import { check } from "zod";

const router = Router()

router.post("/", authMiddleware, validate({body : createClientScheme }), checkForCompany, createClient);
router.put("/", authMiddleware, validate({body : updateClientDataScheme}), validate({params: validateClientIdScheme}), checkForCompany, checkUserAndClientInCompany, updateClient);
router.get("/", authMiddleware, validate({query: ClientPaginationAndFilterScheme}), checkForCompany, getAllClients)
router.get("/", authMiddleware, validate({params: validateClientIdScheme}), checkForCompany, checkUserAndClientInCompany ,getClient);
router.delete("/", authMiddleware, validate({params: validateDeleteIdScheme}), validate({query: sortDeleteClientScheme}), checkForCompany, checkUserAndClientInCompany, deleteClient)
router.get("/archived", authMiddleware, checkRol("admin"), checkForCompany, listArchivedClients)
router.patch("/restore", authMiddleware, checkRol("admin"), validate({params: validateClientIdScheme}), checkForCompany, checkUserAndClientInCompany, restoreArchivedClientById)

export default router;