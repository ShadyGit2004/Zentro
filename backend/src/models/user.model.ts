import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;