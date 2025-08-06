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
  resendVerificationEmailController,
  requestResetPasswordController,
  resetPasswordController,
  searchUsersController,
  followUserController,
  deleteUserController,
  unfollowUserController
} from "../controllers/users.controller";

const usersRouter = Router();

usersRouter.get("/", getUsersController);

usersRouter.get("/:id", getUserByIdController);

usersRouter.post("/register", addUsersController);

usersRouter.post("/resend-email", resendVerificationEmailController);

usersRouter.get("/verify/:token", verifyEmailController);

usersRouter.post("/login", loginUserController);

usersRouter.patch(
  "/edit",
  authMiddleware,
  upload.single("avatar"),
  updateUserProfileController
);

usersRouter.post("/reset-request", requestResetPasswordController);

usersRouter.post("/reset-password", resetPasswordController);

usersRouter.get("/search/users", searchUsersController);

usersRouter.delete("/:id", authMiddleware, deleteUserController);

usersRouter.post("/:id/follow", authMiddleware, followUserController);
usersRouter.post("/:id/unfollow", authMiddleware, unfollowUserController);


export default usersRouter;
