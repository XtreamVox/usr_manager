import { Router } from "express";
import { verifyToken } from "../utils/handleJWT.js";
import authMiddleware from "../middleware/auth.midddleware.js";
import { updateCompanyLogo } from "../controllers/user.controller.js";

const router = Router();

router.use('/');

router.get("/", authMiddleware);
router.patch('/', uploadMiddleware.single('file'), updateCompanyLogo);
export default router;