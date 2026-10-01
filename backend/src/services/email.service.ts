import { emailConfig } from "../config/email";
import AppError from "../utils/appError";

import { verificationEmail } from "../utils/email/verificationEmail";
import { resetPasswordEmail } from "../utils/email/resetPasswordEmail";
import { subscriptionInvoiceEmail } from "../utils/email/subscriptionInvoiceEmail";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT = 15_000;

const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailInput): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": emailConfig.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: emailConfig.sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
  } catch {
    throw new AppError(
      502,
      "EMAIL_PROVIDER_UNAVAILABLE",
      "Unable to connect to email provider"
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Brevo email API error:", {
      status: response.status,
      body: errorBody,
    });

    throw new AppError(502, "EMAIL_SEND_FAILED", "Unable to send email");
  }
};

const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new AppError(
      500,
      "FRONTEND_URL_MISSING",
      "Frontend URL is not configured"
    );
  }

  const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

  await sendEmail({
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
    throw new AppError(
      500,
      "FRONTEND_URL_MISSING",
      "Frontend URL is not configured"
    );
  }

  const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

  await sendEmail({
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
  await sendEmail({
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
