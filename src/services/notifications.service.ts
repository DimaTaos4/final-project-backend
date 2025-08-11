import { Notification } from "../models/Notifications/Notifications";

import HttpException from "../utils/HttpExeption";

interface CreateNotificationInput {
  type: "like" | "comment" | "follow";
  sender: string;
  receiver: string;
  post?: string;
  comment?: string;
}

export const createNotification = async (input: CreateNotificationInput) => {
  const { type, sender, receiver, post, comment } = input;

  if (sender === receiver) return;

  await Notification.create({
    type,
    sender,
    receiver,
    post,
    comment,
  });
};

export const getUserNotifications = async (userId: string) => {
  return Notification.find({ receiver: userId })
    .sort({ createdAt: -1 })
    .populate("sender", "userName avatarUrl")
    .populate("post", "_id imageUrls")
    .lean();
};

export const markAsRead = async (notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new HttpException(404, "Notification not found");
  }
  return notification;
};
