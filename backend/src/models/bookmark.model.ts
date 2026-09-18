import mongoose, { Document, Schema } from "mongoose";

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same user cannot bookmark the same post twice.
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

// Useful for fetching a user's bookmarks newest first.
bookmarkSchema.index({
  user: 1,
  createdAt: -1,
  _id: -1,
});

const Bookmark = mongoose.model<IBookmark>("Bookmark", bookmarkSchema);

export default Bookmark;
