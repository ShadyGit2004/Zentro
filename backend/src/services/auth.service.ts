// Packages
import bcrypt from "bcrypt";


// Models
import User from "../models/user.model";
import Session from "../models/session.model";
import VerificationToken from "../models/verification-token.model";
import PasswordResetToken from "../models/password-reset-token.model";

// Utility Functions
import { hasMailServer } from "../utils/email";
import AppError from "../utils/appError";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generateVerificationToken,
  hashVerificationToken,
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../utils/token";

// Services & Configs
import { sendPasswordResetEmail, sendVerificationEmail } from "./email.service";
import { REFRESH_TOKEN_EXPIRES_IN_DAYS } from "../config/auth";

import { getAuth } from "firebase-admin/auth";
import firebaseAdminApp from "../config/firebase";

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

interface GoogleLoginData {
  idToken: string;
}

const registerUser = async (data: RegisterData) => {
  const mailServerExists = await hasMailServer(data.email);

  if (!mailServerExists) {
    throw new AppError(
      422,
      "INVALID_EMAIL_DOMAIN",
      "Email domain cannot receive emails"
    );
  }

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

  // Generate verification token
  try {
    const verificationToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(verificationToken);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await VerificationToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
    });

    // Send email
    await sendVerificationEmail(user.email, verificationToken);

  } catch (error) {
    // Cleanup if email/token process fails
    await VerificationToken.deleteMany({
      user: user._id,
    });

    await User.deleteOne({
      _id: user._id,
    });

    throw new AppError(
      503,
      "VERIFICATION_EMAIL_FAILED",
      "Unable to send verification email. Please try again later."
    );
  }

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    authProviders: user.authProviders,
  };
};

const verifyEmail = async (token: string) => {
  const tokenHash = hashVerificationToken(token);

  const verificationToken = await VerificationToken.findOne({
    tokenHash,
  });

  if (
    !verificationToken ||
    verificationToken.usedAt ||
    verificationToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      400,
      "INVALID_VERIFICATION_TOKEN",
      "Invalid or expired verification token"
    );
  }

  const user = await User.findById(verificationToken.user);

  if (!user || user.status !== "active") {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (user.emailVerifiedAt) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_VERIFIED",
      "Email is already verified"
    );
  }

  user.emailVerifiedAt = new Date();
  await user.save();

  verificationToken.usedAt = new Date();
  await verificationToken.save();

  return {
    message: "Email verified successfully",
  };
};

const resendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email });

  // Don't reveal whether email exists
  if (!user || user.status !== "active") {
    return;
  }

  // Already verified → nothing to resend
  if (user.emailVerifiedAt) {
    return;
  }

  // Invalidate existing unused tokens
  await VerificationToken.updateMany(
    {
      user: user._id,
      usedAt: { $exists: false },
    },
    {
      $set: { usedAt: new Date() },
    }
  );

  const verificationToken = generateVerificationToken();
  const tokenHash = hashVerificationToken(verificationToken);

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

  await VerificationToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  await sendVerificationEmail(user.email, verificationToken);
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

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });

  // Always return normally to prevent account enumeration
  if (!user || user.status !== "active") {
    return;
  }

  // Invalidate previous reset tokens
  await PasswordResetToken.updateMany(
    {
      user: user._id,
      usedAt: { $exists: false },
    },
    {
      $set: { usedAt: new Date() },
    }
  );

  const resetToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(resetToken);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await PasswordResetToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, resetToken);
};

const resetPassword = async (
  token: string,
  newPassword: string
) => {
  const tokenHash = hashPasswordResetToken(token);

  const resetToken = await PasswordResetToken.findOne({
    tokenHash,
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= new Date()
  ) {
    throw new AppError(
      400,
      "INVALID_RESET_TOKEN",
      "Invalid or expired password reset token"
    );
  }

  const user = await User.findById(resetToken.user);

  if (!user || user.status !== "active") {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  user.passwordHash = passwordHash;

  if (!user.authProviders.includes("password")) {
    user.authProviders.push("password");
  }

  await user.save();

  resetToken.usedAt = new Date();
  await resetToken.save();

  // Invalidate all existing sessions
  await Session.updateMany(
    {
      user: user._id,
      revokedAt: { $exists: false },
    },
    {
      $set: { revokedAt: new Date() },
    }
  );
};

const updatePassword = async (
  userId: string,
  currentPassword: string | undefined,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Authentication required"
    );
  }

  if (user.status !== "active") {
    throw new AppError(
      403,
      "ACCOUNT_UNAVAILABLE",
      "Account is not available"
    );
  }

  // Password already exists → current password required
  if (user.passwordHash) {
    if (!currentPassword) {
      throw new AppError(
        400,
        "CURRENT_PASSWORD_REQUIRED",
        "Current password is required"
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError(
        401,
        "INVALID_CURRENT_PASSWORD",
        "Current password is incorrect"
      );
    }
    
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  user.passwordHash = passwordHash;

  if (!user.authProviders.includes("password")) {
    user.authProviders.push("password");
  }

  await user.save();

  return {
    message: "Password updated successfully",
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

const googleLoginUser = async (
  idToken: string,
  metadata: SessionMetadata
) => {
  let decodedToken;

  try {
    decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(idToken);
  } catch {
    throw new AppError(
      401,
      "INVALID_FIREBASE_TOKEN",
      "Invalid Google authentication token"
    );
  }

  const firebaseUid = decodedToken.uid;
  const email = decodedToken.email?.trim().toLowerCase();

  if (!email || decodedToken.email_verified !== true) {
    throw new AppError(
      401,
      "GOOGLE_EMAIL_NOT_VERIFIED",
      "Google email is not verified"
    );
  }

  let user = await User.findOne({
    $or: [{ firebaseUid }, { email }],
  });

  // Existing account
  if (user) {
    if (user.status !== "active") {
      throw new AppError(
        403,
        "ACCOUNT_UNAVAILABLE",
        "Account is not available"
      );
    }

    // Existing password account → link Google
    if (!user.firebaseUid) {
      user.firebaseUid = firebaseUid;
    }

    // Different Google account already linked
    if (user.firebaseUid !== firebaseUid) {
      throw new AppError(
        409,
        "GOOGLE_ACCOUNT_CONFLICT",
        "This Google account is already linked to another account"
      );
    }

    if (!user.authProviders.includes("google")) {
      user.authProviders.push("google");
    }

    // Google has already verified the email
    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
    }

    await user.save();
  }

  /*
     * New Google account.
     *
     * Firebase doesn't give us a guaranteed unique username
     * suitable for Zentro, so generate one.
  */
  if (!user) {
    const baseUsername =
      decodedToken.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20) || "user";

    let username = baseUsername;
    let counter = 1;

    while (await User.exists({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = await User.create({
      email,
      username,
      displayName: decodedToken.name || username,
      profileImage: decodedToken.picture ? { url: decodedToken.picture, } : undefined,
      firebaseUid,
      authProviders: ["google"],
      emailVerifiedAt: new Date(),
    });
  }

  // Issue Zentro's own tokens
  const accessToken = generateAccessToken(user._id.toString());

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
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

export { registerUser, verifyEmail, resendVerificationEmail, googleLoginUser, loginUser, refreshUserSession, logoutUser, forgotPassword, updatePassword, resetPassword, };