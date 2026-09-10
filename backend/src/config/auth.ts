const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const JWT_SECRET = getJwtSecret();

export const ACCESS_TOKEN_EXPIRES_IN = "15m";

export const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;