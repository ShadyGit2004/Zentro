import mongoose, { Document, Schema } from "mongoose";

interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  lastUsedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
    },

    lastUsedAt: {
      type: Date,
      required: true,
    },

    userAgent: {
      type: String,
    },

    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB automatically removes expired sessions. (TTL Index)
sessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;