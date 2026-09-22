import mongoose, { Document, Schema } from "mongoose";

interface IRepost extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const repostSchema = new Schema<IRepost>(
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

repostSchema.index({ user: 1, post: 1 }, { unique: true });

const Repost = mongoose.model<IRepost>("Repost", repostSchema);

export default Repost;
