import resend from "../resend";
import "dotenv/config";
const { PORT, FRONTEND_URL } = process.env;

export const sendEmailToConfirm = async (email: string, token: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirm your email",
    html: `Click to verify: <a href="http://localhost:${PORT}/api/users/verify/${token}">Verify Email</a>`,
  });
};

export const sendEmailToResetPassword = async (
  email: string,
  token: string
) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirm your email to reset a password",
    html: `Click to reset the password: <a href="${FRONTEND_URL}/reset-password?token=${token}">Verify Email</a>`,
  });
};
