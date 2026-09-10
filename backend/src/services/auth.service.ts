import bcrypt from "bcrypt";
import User from "../models/user.model";
import Session from "../models/session.model";
import AppError from "../utils/appError";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/token";
import { REFRESH_TOKEN_EXPIRES_IN_DAYS } from "../config/auth";

interface RegisterData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}

const registerUser = async (data: RegisterData) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }],
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new AppError(
        409,
        "EMAIL_ALREADY_EXISTS",
        "Email is already registered"
      );
    }

    throw new AppError(
      409,
      "USERNAME_ALREADY_EXISTS",
      "Username is already taken"
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    email: data.email,
    username: data.username,
    displayName: data.displayName,
    passwordHash,
    authProviders: ["password"],
  });

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    authProviders: user.authProviders,
  };
};

const loginUser = async (
  data: LoginData,
  metadata: SessionMetadata
) => {
  const user = await User.findOne({
    email: data.email,
  }).select("+passwordHash");

  // Same response for unknown email and wrong password.
  if (!user || !user.passwordHash) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password"
    );
  }

  if (user.status !== "active") {
    throw new AppError(
      403,
      "ACCOUNT_UNAVAILABLE",
      "Account is not available"
    );
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password"
    );
  }

  const accessToken = generateAccessToken(user._id.toString());

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  );

  await Session.create({
    user: user._id,
    refreshTokenHash,
    expiresAt,
    lastUsedAt: new Date(),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
    },
  };
};

const refreshUserSession = async (
  refreshToken: string,
  metadata: SessionMetadata
) => {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await Session.findOne({
    refreshTokenHash,
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Invalid or expired refresh token"
    );
  }

  const user = await User.findById(session.user);

  if (!user || user.status !== "active") {
    throw new AppError(
      401,
      "INVALID_SESSION",
      "Session is no longer valid"
    );
  }

  // Revoke old refresh-token session.
  session.revokedAt = new Date();
  await session.save();

  // Generate a completely new refresh token.
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
  );

  await Session.create({
    user: user._id,
    refreshTokenHash: newRefreshTokenHash,
    expiresAt,
    lastUsedAt: new Date(),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
  });

  const accessToken = generateAccessToken(user._id.toString());

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const logoutUser = async (refreshToken: string) => {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await Session.updateOne(
    {
      refreshTokenHash,
      revokedAt: { $exists: false },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};

export { registerUser, loginUser, refreshUserSession, logoutUser };