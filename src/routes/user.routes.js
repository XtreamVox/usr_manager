import { Router } from "express";
import uploadMiddleware from "../utils/handleStorage.utils.js";
import authMiddleware from "../middleware/auth.midddleware.js";
import checkRol from "../middleware/role.middleware.js";
import { validateFile, validate } from "../middleware/validate.middleware.js";
import {
  getUser,
  updateCompanyData,
  deleteUser,
  changePassword,
  doubleStepVerification,
  inviteUser,
  logOutUser,
  loginUser,
  refreshUserSession,
  registerUser,
  updateCompanyLogo,
  updateUserData,
  cleanDB
} from "../controllers/user.controller.js";

import {
  registerUserSchema,
  updateUserDataSchema,
  doubleStepVerificationSchema,
  changeUserPasswordSchema,
  loginUserSchema,
  refreshUserSessionSchema,
  deleteUserSchema,
  inviteUserSchema
} from "../squemes/user.squemes.js";

import {
  updateCompanyDataSchema,
  updateCompanyLogoSchema,
} from "../squemes/company.squemes.js";

const router = Router();

router.post("/register", validate({ body: registerUserSchema }), registerUser);
router.put(
  "/validation",
  authMiddleware,
  validate({ body: doubleStepVerificationSchema }),
  doubleStepVerification,
);
router.post("/login", validate({ body: loginUserSchema }), loginUser);
router.put(
  "/register",
  authMiddleware,
  validate({ body: updateUserDataSchema }),
  updateUserData,
);
router.patch(
  "/company",
  authMiddleware,
  validate({ body: updateCompanyDataSchema }),
  updateCompanyData,
);

router.patch(
  "/logo",
  authMiddleware,
  checkRol("admin"),
  uploadMiddleware.single("logo"),
  validateFile(updateCompanyLogoSchema),
  updateCompanyLogo,
);
router.get("/", authMiddleware, getUser);
router.post(
  "/refresh",
  validate({ body: refreshUserSessionSchema }),
  refreshUserSession,
);
router.post("/logout", authMiddleware, logOutUser);
router.delete(
  "/",
  authMiddleware,
  validate({ query: deleteUserSchema }),
  deleteUser,
);
router.put(
  "/password",
  authMiddleware,
  validate({ body: changeUserPasswordSchema }),
  changePassword,
);
router.post("/invite", authMiddleware, checkRol("admin"), validate( { body: inviteUserSchema }), inviteUser);
router.delete("/clean", cleanDB);

export default router;
