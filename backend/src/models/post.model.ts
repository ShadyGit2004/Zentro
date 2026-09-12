import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content?: string;
  media?: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: 280,
    },

    media: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ author: 1, createdAt: -1, _id: -1 });

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;