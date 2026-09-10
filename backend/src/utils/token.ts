import crypto from "crypto";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth";

interface AccessTokenPayload {
  userId: string;
}

const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};