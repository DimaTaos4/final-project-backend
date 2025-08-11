import { Response, NextFunction } from "express";
import * as notificationService from "../services/notifications.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getNotificationsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId!;
    const notifications =
      await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markNotificationAsReadController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
};
