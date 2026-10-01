import AppError from "../utils/appError"; 

const getEmailConfig = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Zentro";

  if (!apiKey || !senderEmail) {
    throw new AppError(
      500,
      "EMAIL_CONFIG_MISSING",
      "Email configuration is missing"
    );
  }

  return {
    apiKey,
    sender: {
      email: senderEmail,
      name: senderName,
    },
  };
};

export const emailConfig = getEmailConfig();