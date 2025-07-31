import * as yup from "yup";
import {
  emailValidation,
  passwordValidation,
  userNameValidation,
} from "../constants/user.constants";

export const addUserSchema = yup.object({
  email: yup
    .string()
    .matches(emailValidation.value, emailValidation.message)
    .required("Email is required"),
  fullName: yup.string().required("Full name is required"),
  userName: yup
    .string()
    .matches(userNameValidation.value, userNameValidation.message)
    .required("Username is required"),
  password: yup
    .string()
    .matches(passwordValidation.value, passwordValidation.message)
    .required("Password is required"),
});

export type AddUserInput = yup.InferType<typeof addUserSchema>;

export const updateUserSchema = yup.object({
  fullName: yup.string().min(1).optional(),
  userName: yup.string().min(3).optional(),
  bio: yup.string().max(500).optional(),
  avatarUrl: yup.string().url().optional(),
  link: yup.string().url().optional(),
});

export type UpdateUserInput = yup.InferType<typeof updateUserSchema>;
