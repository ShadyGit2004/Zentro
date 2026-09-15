import nodemailer from "nodemailer";
import { emailConfig } from "../config/email";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

import { verificationEmail } from "../utils/email/verificationEmail";
import { resetPasswordEmail } from "../utils/email/resetPasswordEmail";

const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not configured");
  }

  const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    // from: `"Zentro" <${emailConfig.user}>`,
    to: email,
    subject: "Verify your Zentro email",
    html: verificationEmail(verificationUrl),
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

  const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    // from: `"Zentro" <${emailConfig.user}>`,
    to: email,
    subject: "Reset your Zentro password",
    html: resetPasswordEmail(resetUrl),
  });
};

export { sendVerificationEmail, sendPasswordResetEmail };