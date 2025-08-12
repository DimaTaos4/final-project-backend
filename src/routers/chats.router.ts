import { Router } from "express";
import {
  getChatsForUserController,
  getOrCreateChatController,
} from "../controllers/chats.controller";

import authMiddleware from "../middlewares/auth.middleware";

const chatRouter = Router();

chatRouter.get("/:userId", getChatsForUserController);
chatRouter.post("/get-or-create", authMiddleware, getOrCreateChatController);

export default chatRouter;
