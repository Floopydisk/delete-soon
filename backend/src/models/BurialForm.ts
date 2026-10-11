import { Schema, model, Document, Types } from "mongoose";

export interface IBurialForm extends Document {
  fullNameOfDeceased: string;
  dateOfBirth: Date;
  dateOfDeath: Date;
  ageAtTimeOfDeath: string;
  causeOfDeath: string;
  maritalStatus: string;
  churchInvolvement: string;
  serviceOfSongsDate?: Date;
  serviceOfSongsVenue?: string;
  funeralServiceDate?: Date;
  funeralServiceVenue?: string;
  zonalCoordinator: string;
  zone: string;
  region: string;
  regionalPastor: string;
  remarks?: string;
  submittedBy?: Types.ObjectId;
  processedBy?: Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const BurialFormSchema = new Schema<IBurialForm>(
  {
    fullNameOfDeceased: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    dateOfDeath: { type: Date, required: true },
    ageAtTimeOfDeath: { type: String, required: true },
    causeOfDeath: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    churchInvolvement: { type: String, required: true },
    serviceOfSongsDate: { type: Date },
    serviceOfSongsVenue: { type: String },
    funeralServiceDate: { type: Date },
    funeralServiceVenue: { type: String },
    zonalCoordinator: { type: String, required: true },
    zone: { type: String, required: true },
    region: { type: String, required: true },
    regionalPastor: { type: String, required: true },
    remarks: { type: String },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default model<IBurialForm>("BurialForm", BurialFormSchema);
