import mongoose, { Document, Schema } from "mongoose";

interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
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

likeSchema.index(
  { user: 1, post: 1 },
  { unique: true }
);

const Like = mongoose.model<ILike>("Like", likeSchema);

export default Like;