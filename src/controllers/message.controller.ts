import { Request, Response, NextFunction } from "express";
import * as messageService from "../services/message.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getMessagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = req.params;
    const data = await messageService.getMessages(chatId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const sendMessageController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.userId;
    const { chatId, recipientId, text } = req.body;

    if (!senderId || !recipientId || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = await messageService.sendMessage(
      chatId,
      senderId,
      recipientId,
      text
    );

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
