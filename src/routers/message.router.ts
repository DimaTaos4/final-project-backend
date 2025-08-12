import { Router } from "express";
import {
  getMessagesController,
  sendMessageController,
} from "../controllers/message.controller";
import authMiddleware from "../middlewares/auth.middleware";

const messageRouter = Router();

messageRouter.get("/:chatId", authMiddleware, getMessagesController);
messageRouter.post("/", authMiddleware, sendMessageController);

export default messageRouter;
