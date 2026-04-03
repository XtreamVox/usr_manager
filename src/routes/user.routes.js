import { Router } from "express";
import authMiddleware from "../middleware/auth.midddleware.js";
import {
  getUsers,
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
} from "../controllers/user.controller.js";

const router = Router();

router.use("/");

router.post("/register", registerUser);
router.put("/validation", authMiddleware, doubleStepVerification)
router.post("/login", loginUser);
router.put("/register", authMiddleware, updateUserData);
router.patch("/company", authMiddleware, updateCompanyData);
router.patch("/logo", authMiddleware, updateCompanyLogo);
router.get("/", authMiddleware, getUsers);
router.post("/refresh", refreshUserSession);
router.post("/logout", authMiddleware, logOutUser);
router.delete("/", authMiddleware, deleteUser);
router.put("/password", authMiddleware, changePassword);
router.post("/invite", authMiddleware, inviteUser);

export default router;