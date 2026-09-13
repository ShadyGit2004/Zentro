import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";

import {
  getAll,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", authMiddleware, requireActiveUser, getAll);

router.patch(
  "/read-all",
  authMiddleware,
  requireActiveUser,
  markAllAsRead
);

router.patch(
  "/:notificationId/read",
  authMiddleware,
  requireActiveUser,
  markAsRead
);

export default router;