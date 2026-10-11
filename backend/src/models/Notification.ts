import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
  formType: string;
  formId: string;
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientEmail: {
      type: String,
      required: [true, "Recipient email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    recipientName: {
      type: String,
      trim: true,
      maxlength: [100, "Recipient name must be less than 100 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [255, "Subject must be less than 255 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    formType: {
      type: String,
      required: [true, "Form type is required"],
      enum: ["naming_dedication", "courtship", "burial", "custom"],
      trim: true,
    },
    formId: {
      type: String,
      required: [true, "Form ID is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
notificationSchema.index({ status: 1 });
notificationSchema.index({ formType: 1, formId: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
