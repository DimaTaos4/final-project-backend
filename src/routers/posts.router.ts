import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { upload } from "../utils/upload";
import {
  createPostController,
  getUserPostsController,
  getImagesByIdController,
  editPostController,
  deletePostController,
  getPostByIdUserController,
  getAllPostsController
} from "../controllers/posts.controller";

const postRouter = Router();

postRouter.post(
  "/",
  authMiddleware,
  upload.array("images", 10),
  createPostController
);

postRouter.get("/", getAllPostsController)


postRouter.get("/byuser/:id", getPostByIdUserController);

postRouter.get("/mine", authMiddleware, getUserPostsController);

postRouter.get("/:id", getImagesByIdController);

postRouter.patch(
  "/edit/:id",
  authMiddleware,
  upload.array("images", 10),
  editPostController
);

postRouter.delete("/delete/:id", authMiddleware, deletePostController);

export default postRouter;
