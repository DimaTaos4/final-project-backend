import { User, IUserDoc } from "../models/Users/Users";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import HttpException from "../utils/HttpExeption";
import { AddUserInput } from "../validation/user.schema";
import {
  sendEmailToConfirm,
  sendEmailToResetPassword,
} from "../utils/sendEmails";
import { UpdateUserInput } from "../validation/user.schema";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { passwordValidation } from "../constants/user.constants";

import { Post } from "../models/Posts/Post";

const { JWT_SECRET } = process.env;

export const addUsers = async (payload: AddUserInput): Promise<IUserDoc> => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new HttpException(409, "User with this email already exists");
  }
  const existingUsername = await User.findOne({ userName: payload.userName });
  if (existingUsername) {
    throw new HttpException(409, "User with this username already exists");
  }
  const hashPassword = await bcrypt.hash(payload.password, 10);
  const verificationToken = uuidv4();

  await sendEmailToConfirm(payload.email, verificationToken);

  return User.create({
    ...payload,
    password: hashPassword,
    verificationToken,
  });
};

export const verifyEmail = async (token: string) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) throw new HttpException(401, "Invalid token");
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
};
interface ILoginUser {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: ILoginUser) => {
  const user = await User.findOne({ email });

  if (!user) throw new HttpException(401, "The email is not correct");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new HttpException(401, "The password is invalid");

  if (!user.isVerified) {
    throw new HttpException(403, "Please verify your email before logging in");
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      userName: user.userName,
      followers: user.followers,
      following: user.following,
    },
  };
};

export const getAllUsers = (): Promise<IUserDoc[]> => User.find();

export const getUserById = (payload: string) =>
  User.findById(payload).select("-password");

export const updateUserProfile = async (
  userId: string,
  updates: UpdateUserInput
) => {
  return User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  ).select("-password");
};

export const requestResetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new HttpException(404, "User not found");
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  await sendEmailToResetPassword(user.email, token);
  user.resetToken = token;
  user.resetTokenExpiry = new Date(Date.now() + 3600000);
  return await user.save();
};
export const resetPassword = async (
  token: string,
  newPassword: string,
  repeatNewPassword: string
) => {
  if (newPassword !== repeatNewPassword) {
    throw new HttpException(400, "New passwords do not match");
  }

  if (!passwordValidation.value.test(newPassword)) {
    throw new HttpException(400, passwordValidation.message);
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (err) {
    throw new HttpException(401, "Token is invalid or expired");
  }

  const user = await User.findById(payload.userId);
  if (!user) throw new HttpException(404, "User not found");

  if (
    !user.resetToken ||
    user.resetToken !== token ||
    !user.resetTokenExpiry ||
    user.resetTokenExpiry < new Date()
  ) {
    throw new HttpException(400, "Reset token is invalid or has expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  await user.save();
};

export const searchUsers = async (q: string) => {
  const user = await User.find({
    userName: { $regex: q, $options: "i" },
  }).select("-password -isVerified -verificationToken");
  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new HttpException(404, "User not found");

  await User.updateMany(
    { followers: userId },
    { $pull: { followers: userId } }
  );
  await User.updateMany(
    { following: userId },
    { $pull: { following: userId } }
  );

  await Post.deleteMany({ author: userId });

  return;
};

export const followUser = async (followedId: string, currentUserId: string) => {
  if (followedId === currentUserId)
    throw new HttpException(400, "You cannot follow yourself");

  const followedUser = await User.findById(followedId);

  const currentUser = await User.findById(currentUserId);
  if (!currentUser || !followedUser)
    throw new HttpException(404, "User not found");
  if (followedUser.followers.includes(new Types.ObjectId(currentUserId)))
    throw new HttpException(400, "You have been followed");

  followedUser.followers.push(new Types.ObjectId(currentUserId));
  await followedUser.save();
  currentUser.following.push(new Types.ObjectId(followedId));
  return await currentUser.save();
};

export const unfollowUser = async (
  followedId: string,
  currentUserId: string
) => {
  if (followedId === currentUserId) {
    throw new HttpException(400, "You cannot unfollow yourself");
  }

  const followedUser = await User.findById(followedId);
  const currentUser = await User.findById(currentUserId);

  if (!followedUser || !currentUser) {
    throw new HttpException(404, "User not found");
  }

  const isFollowing = followedUser.followers.some((followerId) =>
    followerId.equals(currentUserId)
  );

  if (!isFollowing) {
    throw new HttpException(400, "You are not following this user");
  }

  followedUser.followers = followedUser.followers.filter(
    (followerId) => !followerId.equals(currentUserId)
  );
  await followedUser.save();

  currentUser.following = currentUser.following.filter(
    (followingId) => !followingId.equals(followedId)
  );
  return await currentUser.save();
};

export const getFollowersById = async (id: string) => {
  const data = await User.findById(id).populate(
    "followers",
    "avatarUrl userName"
  );
  if (!data) throw new HttpException(404, "Not found user");
  return data;
};

export const getFollowingsById = async (id: string) => {
  const data = await User.findById(id).populate(
    "following",
    "avatarUrl userName"
  );
  if (!data) throw new HttpException(404, "Not found user");
  return data;
};


