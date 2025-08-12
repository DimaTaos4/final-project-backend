import { Request, Response, NextFunction } from "express";
import * as chatsService from "../services/chats.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getChatsForUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const chats = await chatsService.getChatsForUser(userId);
    res.json(chats);
  } catch (error) {
    next(error);
  }
};

export const getOrCreateChatController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.userId;
    const { recipientId } = req.body;

    if (!senderId || !recipientId) {
      return res.status(400).json({ error: "Missing senderId or recipientId" });
    }

    const chat = await chatsService.getOrCreateChat(senderId, recipientId);
    res.json({ chatId: chat._id });
  } catch (error) {
    next(error);
  }
};
