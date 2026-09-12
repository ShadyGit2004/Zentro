import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = "like" | "comment" | "follow";

interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  type: NotificationType;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
  _id: -1,
});

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;