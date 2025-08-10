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
  getAllPostsController,
  getPostsfromFollowingController,
  likePostController,
  commentPostController,
  deleteCommentController,
} from "../controllers/posts.controller";

const postRouter = Router();

postRouter.post(
  "/",
  authMiddleware,
  upload.array("images", 10),
  createPostController
);

postRouter.get("/", getAllPostsController);

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

postRouter.get("/feed/:id", getPostsfromFollowingController);

postRouter.post("/like/:id", authMiddleware, likePostController);

postRouter.post("/comment/:id", authMiddleware, commentPostController);

postRouter.delete(
  "/comment/:postId/:commentId",
  authMiddleware,
  deleteCommentController
);

export default postRouter;
