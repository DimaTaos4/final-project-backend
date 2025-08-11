import express from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
  getNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notifications.controller";

const router = express.Router();

router.get("/", authMiddleware, getNotificationsController);

router.patch("/:id/read", authMiddleware, markNotificationAsReadController);

export default router;
