import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";
import { get } from "../controllers/feed.controller";

const router = Router();

router.get("/", authMiddleware, requireActiveUser, get);

export default router;