// Packages
import { Router } from "express";

// Middlewares
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";

// Controllers
import { getMe } from "../controllers/user.controller";

const router = Router();

router.get("/me", authMiddleware, requireVerifiedEmail, getMe);

export default router;