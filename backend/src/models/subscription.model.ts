import mongoose, { Document, Schema } from "mongoose";

export type SubscriptionPlan = "free" | "bronze" | "silver" | "gold";

export type SubscriptionStatus = "active" | "pending" | "cancelled" | "expired";

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;

  plan: SubscriptionPlan;
  status: SubscriptionStatus;

  startDate?: Date;
  endDate?: Date;

  provider?: "razorpay" | "stripe";

  providerCustomerId?: string;
  providerSubscriptionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "pending", "cancelled", "expired"],
      required: true,
      default: "pending",
      index: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
      index: true,
    },

    provider: {
      type: String,
      enum: ["razorpay", "stripe"],
    },

    providerCustomerId: {
      type: String,
      sparse: true,
      index: true,
    },

    providerSubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ user: 1, createdAt: -1 });

const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);

export default Subscription;
