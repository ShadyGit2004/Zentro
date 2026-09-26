import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;

  subscription?: mongoose.Types.ObjectId;

  plan: "bronze" | "silver" | "gold";

  provider: "razorpay" | "stripe";

  providerOrderId: string;
  providerPaymentId?: string;

  amount: number;
  currency: string;

  status: PaymentStatus;

  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      index: true,
    },

    plan: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      required: true,
    },

    provider: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },

    providerOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    providerPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      required: true,
      default: "created",
      index: true,
    },

    paidAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ user: 1, status: 1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
