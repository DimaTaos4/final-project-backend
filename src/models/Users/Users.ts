import { Schema, model, Document } from "mongoose";
import {
  emailValidation,
  passwordValidation,
  userNameValidation,
} from "../../constants/user.constants";

interface IUserDoc extends Document {
  email: string;
  fullName: string;
  userName: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified?: boolean;
  verificationToken?: string;
}

const userSchema = new Schema<IUserDoc>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v: string) => emailValidation.value.test(v),
        message: emailValidation.message,
      },
    },
    fullName: { type: String, required: true },
    userName: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: (v: string) => userNameValidation.value.test(v),
        message: userNameValidation.message,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => passwordValidation.value.test(v),
        message: passwordValidation.message,
      },
    },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    link: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = model<IUserDoc>("User", userSchema);

export { User, IUserDoc };
