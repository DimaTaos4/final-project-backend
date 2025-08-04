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
  searchUsersController
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

usersRouter.get("/search/users", searchUsersController)


export default usersRouter;
