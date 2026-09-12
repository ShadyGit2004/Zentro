import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { get } from "../controllers/feed.controller";

const router = Router();

router.get("/", authMiddleware, get);

export default router;