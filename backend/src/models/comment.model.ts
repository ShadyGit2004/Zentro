import mongoose, { Document, Schema } from "mongoose";

interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ post: 1, _id: -1 });

const Comment = mongoose.model<IComment>(
  "Comment",
  commentSchema
);

export default Comment;