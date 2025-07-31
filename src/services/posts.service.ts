import { Post, PostDoc } from "../models/Posts/Post";
import HttpException from "../utils/HttpExeption";
import cloudinary from "../utils/cloudinary";
import streamifier from "streamifier";

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
  const post = await Post.findById(postId);
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
