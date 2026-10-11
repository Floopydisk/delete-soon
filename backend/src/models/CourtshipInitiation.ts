import crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";

export interface ICourtshipInitiation extends Document {
  churchZoneId: mongoose.Types.ObjectId;
  initiatedBy: mongoose.Types.ObjectId;
  brotherEmail?: string;
  sisterEmail?: string;
  tokenHash: string;
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const hashCourtshipInitiationToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const courtshipInitiationSchema = new Schema<ICourtshipInitiation>(
  {
    churchZoneId: { type: Schema.Types.ObjectId, ref: "ChurchZone", required: true },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brotherEmail: { type: String, trim: true, lowercase: true },
    sisterEmail: { type: String, trim: true, lowercase: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

courtshipInitiationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ICourtshipInitiation>(
  "CourtshipInitiation",
  courtshipInitiationSchema,
);
