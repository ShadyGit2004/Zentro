const getEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error("Email configuration is missing");
  }

  return {
    user: emailUser,
    password: emailPassword,
  };
};

export const emailConfig = getEmailConfig();