import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  passwordHash?: string;
  firebaseUid?: string;
  authProviders: ("password" | "google")[];
  emailVerifiedAt?: Date;
  role: "user" | "admin";
  status: "active" | "suspended" | "deleted";
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProviders: {
      type: [String],
      enum: ["password", "google"],
      required: true,
      default: ["password"],
    },

    emailVerifiedAt: {
      type: Date,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;