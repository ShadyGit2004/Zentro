import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getAll,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", authMiddleware, getAll);

router.patch(
  "/read-all",
  authMiddleware,
  markAllAsRead
);

router.patch(
  "/:notificationId/read",
  authMiddleware,
  markAsRead
);

export default router;