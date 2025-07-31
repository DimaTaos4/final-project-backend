import { User, IUserDoc } from "../models/Users/Users";
import bcrypt from "bcrypt";
import HttpException from "../utils/HttpExeption";
import { AddUserInput } from "../validation/user.schema";

import { UpdateUserInput } from "../validation/user.schema";
import resend from "../resend";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const { JWT_SECRET, PORT } = process.env;
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

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: payload.email,
    subject: "Confirm your email",
    html: `Click to verify: <a href="http://localhost:${PORT}/api/users/verify/${verificationToken}">Verify Email</a>`, // должен быть ссылка на BACKEND
  });

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
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      userName: user.userName,
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
