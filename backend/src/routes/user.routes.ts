import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getMe } from "../controllers/user.controller";

const router = Router();

router.get("/me", authMiddleware, getMe);

export default router;