import { Router } from "express";
import { verifyToken } from "../utils/handleJWT.js";
import authMiddleware from "../middleware/auth.midddleware.js";

const router = Router();

router.use('/');

router.get("/", authMiddleware);
export default router;