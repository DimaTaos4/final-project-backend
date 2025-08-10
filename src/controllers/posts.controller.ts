import { AuthenticatedRequest } from "./../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import * as postsService from "../services/posts.service";
import HttpException from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";
import { Post } from "../models/Posts/Post";
import streamifier from "streamifier";

const streamUpload = (buffer: Buffer): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const createPostController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new HttpException(401, "Unauthorized");

    const files = req.files as Express.Multer.File[];
    const caption = req.body.caption || "";

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadResults = await Promise.all(
      files.map((file) => streamUpload(file.buffer))
    );

    const imageUrls = uploadResults.map((result) => result.secure_url);

    const newPost = await Post.create({
      author: userId,
      imageUrls,
      caption,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    next(error);
  }
};

export const getUserPostsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new HttpException(401, "Unauthorized");

    const posts = await postsService.getUserPosts(userId);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getImagesByIdController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await postsService.getImagesById(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
export const editPostController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const userId = req.userId;
    if (!userId) throw new HttpException(401, "Unauthorized");
    const newCaption = req.body.caption;

    const files = req.files as Express.Multer.File[] | undefined;

    const updatedPost = await postsService.editPostById({
      postId: id,
      userId,
      newCaption,
      newFiles: files,
    });

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const deletePostController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const userId = req.userId;
    if (!userId) throw new HttpException(401, "Unauthorized");
    await postsService.deletePost(id, userId);
    res.status(200).json({
      message: "Post deleted successfuly",
    });
  } catch (error) {
    next(error);
  }
};

export const getPostByIdUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = await postsService.getPostByIdUser(id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllPostsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const data = await postsService.getAllPosts();
  res.json(data);
};

export const getPostsfromFollowingController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const result = await postsService.getPostsfromFollowing(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const likePostController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = req.userId;
    if (!currentUserId) throw new HttpException(404, "Unauthorized");
    const data = await postsService.likePost(id, currentUserId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const commentPostController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const currentUserId = req.userId;

    if (!currentUserId) throw new HttpException(401, "Unauthorized");
    if (!text) throw new HttpException(400, "Comment text is required");

    const data = await postsService.commentPost(id, currentUserId, text);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteCommentController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId } = req.params;
    const currentUserId = req.userId;

    if (!currentUserId) throw new HttpException(401, "Unauthorized");

    const updatedPost = await postsService.deleteComment(
      postId,
      commentId,
      currentUserId
    );

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};
