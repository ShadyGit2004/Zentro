import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: {
    url: string;
    publicId?: string;
  };
  passwordHash?: string;
  firebaseUid?: string;
  authProviders: ("password" | "google")[];
  emailVerifiedAt?: Date;
  role: "user" | "admin";
  status: "active" | "suspended" | "deleted";
  createdAt: Date;
  updatedAt: Date;
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
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
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

userSchema.index({ displayName: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;