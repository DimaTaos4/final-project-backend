import { Router } from "express";

import { upload } from "../utils/upload";

import authMiddleware from "../middlewares/auth.middleware";

import {
  addUsersController,
  loginUserController,
  getUsersController,
  getUserByIdController,
  updateUserProfileController,
  verifyEmailController,
} from "../controllers/users.controller";

const usersRouter = Router();

usersRouter.get("/", getUsersController);

usersRouter.get("/:id", getUserByIdController);

usersRouter.post("/register", addUsersController);

usersRouter.get("/verify/:token", verifyEmailController);

usersRouter.post("/login", loginUserController);

usersRouter.patch(
  "/edit",
  authMiddleware,
  upload.single("avatar"),
  updateUserProfileController
);

export default usersRouter;
