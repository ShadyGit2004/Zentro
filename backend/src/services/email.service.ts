import nodemailer from "nodemailer";
import { emailConfig } from "../config/email";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not configured");
  }

  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Zentro" <${emailConfig.user}>`,
    to: email,
    subject: "Verify your Zentro email",
    text: `Verify your email by visiting: ${verificationUrl}`,
    html: `
      <h2>Welcome to Zentro!</h2>
      <p>Please verify your email address by clicking the button below.</p>
      <a href="${verificationUrl}">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
};

const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not configured");
  }

  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Zentro" <${emailConfig.user}>`,
    to: email,
    subject: "Reset your Zentro password",
    text: `Reset your password by visiting: ${resetUrl}`,
    html: `
      <h2>Password Reset</h2>
      <p>We received a request to reset your Zentro password.</p>
      <a href="${resetUrl}">
        Reset Password
      </a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

export { sendVerificationEmail, sendPasswordResetEmail };