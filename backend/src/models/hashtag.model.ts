import mongoose, { Document, Schema } from "mongoose";

export interface IHashtag extends Document {
  name: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const hashtagSchema = new Schema<IHashtag>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

hashtagSchema.index({
  postsCount: -1,
  name: 1,
});

const Hashtag = mongoose.model<IHashtag>("Hashtag", hashtagSchema);

export default Hashtag;
