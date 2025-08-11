import { Post, PostDoc } from "../models/Posts/Post";
import HttpException from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";
import { User } from "../models/Users/Users";
import { Types } from "mongoose";

import * as notificationService from "./notifications.service";

interface EditPostParams {
  postId: string;
  userId: string;
  newCaption: string;
  newFiles?: Express.Multer.File[];
}

export const createPost = (
  userId: string,
  imageUrls: string[],
  caption: string
): Promise<PostDoc> => {
  return Post.create({ author: userId, imageUrls, caption });
};

export const getUserPosts = (userId: string): Promise<PostDoc[]> => {
  return Post.find({ author: userId }).sort({ createdAt: -1 }).exec();
};

export const getImagesById = async (postId: string) => {
  const post = await Post.findById(postId).populate({
    path: "comments.user",
    select: "userName avatarUrl",
  });

  if (!post) throw new HttpException(404, "Post not found");

  return post;
};

const streamUpload = (buffer: Buffer): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const editPostById = async ({
  postId,
  userId,
  newCaption,
  newFiles,
}: EditPostParams) => {
  const post = await Post.findById(postId);
  if (!post) throw new HttpException(404, "Post not found");

  if (post.author.toString() !== userId)
    throw new HttpException(403, "Forbidden: Not your post");

  let newImageUrls = post.imageUrls;

  if (newFiles && newFiles.length > 0) {
    for (const url of post.imageUrls) {
      const publicId = url.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`posts/${publicId}`);
    }

    const uploadResults = await Promise.all(
      newFiles.map((file) => streamUpload(file.buffer))
    );

    newImageUrls = uploadResults.map((result) => result.secure_url);
  }

  if (newCaption !== undefined) {
    post.caption = newCaption;
  }
  post.imageUrls = newImageUrls;

  await post.save();

  return post;
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new HttpException(404, "Not found post");

  if (userId !== post.author.toString())
    throw new HttpException(403, "Not allowed to delete");

  for (const url of post.imageUrls) {
    const publicId = url.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(`posts/${publicId}`);
  }

  await Post.findByIdAndDelete(postId);

  return post;
};

export const getPostByIdUser = async (userId: string) => {
  const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
  return posts;
};

export const getAllPosts = async () => {
  const posts = await Post.find();
  return posts;
};

export const getPostsfromFollowing = async (userId: string) => {
  const currUser = await User.findById(userId);
  if (!currUser) throw new HttpException(404, "User not found");
  const posts = await Post.find({ author: { $in: currUser.following } })
    .sort({
      createdAt: -1,
    })
    .populate("author", "userName avatarUrl followers")
    .exec();
  return posts;
};

export const likePost = async (id: string, currentUserId: string) => {
  const post = await Post.findById(id);
  if (!post) throw new HttpException(404, "Post not found");

  const user = await User.findById(currentUserId);
  if (!user) throw new HttpException(404, "User not found");

  const alreadyLiked = post.likes.includes(currentUserId as any);
  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (userId) => userId.toString() !== currentUserId
    );
  } else {
    post.likes.push(new Types.ObjectId(currentUserId));

    if (post.author.toString() !== currentUserId) {
      await notificationService.createNotification({
        type: "like",
        sender: currentUserId,
        receiver: post.author.toString(),
        post: (post._id as Types.ObjectId).toString(),
      });
    }
  }

  const updatedPost = await post.save();
  return updatedPost;
};

export const commentPost = async (
  id: string,
  currentUserId: string,
  commentText: string
) => {
  const post = await Post.findById(id);
  if (!post) throw new HttpException(404, "Post not found");

  const user = await User.findById(currentUserId);
  if (!user) throw new HttpException(404, "User not found");

  const newComment = {
    user: new Types.ObjectId(currentUserId),
    text: commentText,
    createdAt: new Date(),
  };

  post.comments.push(newComment);

  await post.save();

  if (post.author.toString() !== currentUserId) {
    await notificationService.createNotification({
      type: "comment",
      sender: currentUserId,
      receiver: post.author.toString(),
      post: (post._id as Types.ObjectId).toString(),
      comment: commentText,
    });
  }

  const updatedPost = await Post.findById(id).populate({
    path: "comments.user",
    select: "userName avatarUrl",
  });

  return updatedPost;
};

export const deleteComment = async (
  postId: string,
  commentId: string,
  currentUserId: string
) => {
  const post = await Post.findById(postId);
  if (!post) throw new HttpException(404, "Post not found");

  const comment = post.comments.find(
    (c: any) => c._id.toString() === commentId
  );

  if (!comment) throw new HttpException(404, "Comment not found");

  if (comment.user.toString() !== currentUserId) {
    throw new HttpException(403, "You are not allowed to delete this comment");
  }

  post.comments = post.comments.filter(
    (c: any) => c._id.toString() !== commentId
  );

  const updatedPost = await post.save();
  return updatedPost;
};
