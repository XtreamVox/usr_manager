import { Router } from "express";
import uploadMiddleware from "../utils/handleStorage.utils.js";
import authMiddleware from "../middleware/auth.midddleware.js";
import checkRol from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { checkForCompany } from "../middleware/client_checks.middleware.js";

import {
  createDeliveryNote,
  deleteDeliveryNote,
  getAllDeliveryNotes,
  getDeliveryNote,
  getPdfFromDeliveryNote,
  signPdf,
} from "../controllers/deliveryNote.controller.js";

import { 
  createDeliveryNoteScheme,
  DeliveryNotePaginationAndFilterScheme,
  validateDeliveryNoteIdScheme,
  validateDeleteIdScheme,
  softDeleteDeliveryNoteScheme
  } from "../squemes/deliveryNote.squeme.js";

const router = Router();

router.post("/", authMiddleware, checkForCompany, validate({ body: createDeliveryNoteScheme}), createDeliveryNote)
router.get("/", authMiddleware, checkForCompany, validate({query : DeliveryNotePaginationAndFilterScheme}) ,getAllDeliveryNotes)
router.get("/pdf/:id", authMiddleware, checkForCompany, validate({params : validateDeliveryNoteIdScheme}), getPdfFromDeliveryNote)
router.patch("/:id/sign", authMiddleware, checkForCompany, validate({params : validateDeliveryNoteIdScheme}), uploadMiddleware.single("signature"), signPdf)
router.get("/:id", authMiddleware, checkForCompany, validate({params : validateDeliveryNoteIdScheme}), getDeliveryNote)
router.delete("/:id", authMiddleware, checkForCompany, checkRol("admin"), validate({params: validateDeleteIdScheme}), validate({query: softDeleteDeliveryNoteScheme}), deleteDeliveryNote)

export default router;
