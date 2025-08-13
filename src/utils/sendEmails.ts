import resend from "../resend";
import "dotenv/config";
const { PORT, FRONTEND_URL } = process.env;

export const sendEmailToConfirm = async (email: string, token: string) => {
  const verificationLink = `http://localhost:${PORT}/api/users/verify/${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Please confirm your email address",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Ichgram! 🎉</h2>
        <p>Hi there!</p>
        <p>You're almost ready to start using Ichgram. Please confirm your email address by clicking the button below:</p>
        <a href="${verificationLink}" 
          style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Confirm Email
        </a>
        <p>If that doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${verificationLink}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">If you didn't sign up for Ichgram, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendEmailToResetPassword = async (
  email: string,
  token: string
) => {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your Ichgram password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Requested 🔒</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${resetLink}" 
          style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="word-break: break-all;">${resetLink}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">Ichgram Security Team</p>
      </div>
    `,
  });
};
