import { Response, NextFunction } from "express";
import * as usersService from "../services/users.service";
import { addUserSchema } from "../validation/user.schema";
import HttpException from "../utils/HttpExeption";
import { ValidationError } from "yup";
import cloudinary from "../utils/cloudinary";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Readable } from "stream";
import { User } from "../models/Users/Users";
import { v4 as uuidv4 } from "uuid";
import resend from "../resend";
import { Types } from "mongoose";
const { FRONTEND_URL } = process.env;
export const addUsersController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = await addUserSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const data = await usersService.addUsers(validatedData);

    res.status(201).json(data);
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors[0] || "Invalid input";
      next(new HttpException(400, message));
    } else {
      next(error);
    }
  }
};
export const verifyEmailController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await usersService.verifyEmail(req.params.token);
    res.redirect(`${FRONTEND_URL}/verify-email?success=true`);
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmailController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) throw new HttpException(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) throw new HttpException(404, "User not found");

    if (user.isVerified) {
      throw new HttpException(400, "Email already verified");
    }

    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await user.save();

    const { PORT } = process.env;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Resend email verification",
      html: `Click to verify: <a href="http://localhost:${PORT}/api/users/verify/${verificationToken}">Verify Email</a>`,
    });

    res.status(200).json({ message: "Verification email sent again" });
  } catch (error) {
    next(error);
  }
};

export const loginUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await usersService.loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUsersController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await usersService.getAllUsers();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await usersService.getUserById(id);
    if (!result) throw new HttpException(404, `User with id=${id} not found`);
    res.json({
      _id: result._id,
      avatarUrl: result.avatarUrl || null,
      bio: result.bio || null,
      link: result.link || null,
      email: result.email,
      fullName: result.fullName,
      userName: result.userName,
      isVerified: result.isVerified,
      followers: result.followers,
      following: result.following,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

const streamUpload = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "avatars" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const updateUserProfileController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new HttpException(401, "Unauthorized");

    const { bio, link, removeAvatar, userName } = req.body;
    const file = req.file;

    const updates: any = {};

    if (bio !== undefined) updates.bio = bio;
    if (link !== undefined) updates.link = link;
    if (userName !== undefined) updates.userName = userName;

    if (file) {
      const result = await streamUpload(file.buffer);
      updates.avatarUrl = result.secure_url;
    }

    if (removeAvatar === "true" && !file) {
      updates.avatarUrl = "";
    }

    const updatedUser = await usersService.updateUserProfile(userId, updates);

    if (!updatedUser) {
      throw new HttpException(404, "User not found");
    }

    res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const requestResetPasswordController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const data = await usersService.requestResetPassword(email);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword, repeatNewPassword } = req.body;
    await usersService.resetPassword(token, newPassword, repeatNewPassword);
    res.json({
      message: "Password successfully changed",
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsersController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;
    const users = await usersService.searchUsers(q as string);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userIdToDelete = req.params.id;
    const currentUserId = req.userId;

    if (!currentUserId || currentUserId !== userIdToDelete) {
      throw new HttpException(403, "You are not allowed to delete this user");
    }

    await usersService.deleteUser(userIdToDelete);

    res.status(200).json({ message: "User and related subscriptions deleted" });
  } catch (error) {
    next(error);
  }
};

export const followUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const followedId = req.params.id;
    const currentUserId = req.userId;
    if (!currentUserId) throw new HttpException(401, "Unauthorized");
    const data = await usersService.followUser(followedId, currentUserId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const unfollowUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const followedId = req.params.id;
    const currentUserId = req.userId;
    if (!currentUserId) throw new HttpException(401, "Unauthorized");
    await usersService.unfollowUser(followedId, currentUserId);
    res.status(200).json({
      message: "Unfollowed successfully",
    });
  } catch (error) {
    next(error);
  }
};
