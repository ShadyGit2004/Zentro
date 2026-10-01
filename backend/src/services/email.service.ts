import nodemailer from "nodemailer";
import { emailConfig } from "../config/email";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.password,
  },
});

import { verificationEmail } from "../utils/email/verificationEmail";
import { resetPasswordEmail } from "../utils/email/resetPasswordEmail";
import { subscriptionInvoiceEmail } from "../utils/email/subscriptionInvoiceEmail";

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
    to: email,
    subject: "Reset your Zentro password",
    html: resetPasswordEmail(resetUrl),
  });
};

interface SendSubscriptionInvoiceEmailInput {
  email: string;
  displayName: string;
  plan: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  providerPaymentId: string;
  providerOrderId: string;
  periodStart: Date;
  periodEnd: Date;
}

const sendSubscriptionInvoiceEmail = async ({
  email,
  displayName,
  plan,
  amount,
  currency,
  paymentDate,
  providerPaymentId,
  providerOrderId,
  periodStart,
  periodEnd,
}: SendSubscriptionInvoiceEmailInput): Promise<void> => {
  await transporter.sendMail({
    to: email,
    subject: `Zentro Subscription Payment Receipt — ${plan}`,
    html: subscriptionInvoiceEmail({
      displayName,
      plan,
      amount,
      currency,
      paymentDate,
      providerPaymentId,
      providerOrderId,
      periodStart,
      periodEnd,
    }),
  });
};

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSubscriptionInvoiceEmail,
};
