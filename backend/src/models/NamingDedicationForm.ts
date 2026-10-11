import mongoose, { Schema, Document } from "mongoose";

export interface INamingDedicationForm extends Document {
  // Parent Information
  fatherName: string;
  fatherPhone?: string;
  motherName: string;
  motherPhone?: string;
  homeAddress?: string;
  homeTelephone?: string;
  homeCellRegion?: string;

  // Church Information
  churchZoneId?: mongoose.Types.ObjectId;
  worshipCenter?: string;
  cellLeaderName?: string;
  regionalPastorName?: string;

  // Membership Information
  fatherMembershipLevel?: string;
  motherMembershipLevel?: string;
  fatherIsMember: boolean;
  motherIsMember: boolean;
  fatherDaystarMember?: string;
  motherDaystarMember?: string;

  // Baby Information
  babies: {
    name: string;
    dateOfBirth: Date;
    sex: string;
  }[];
  placeOfBirth?: string;
  isTwins: boolean;

  // Ceremony Details
  ceremonyType: "naming" | "dedication" | "both";
  intendedNamingDate?: Date;
  intendedDedicationDate?: Date;

  // Status and Processing
  status: "pending" | "approved" | "rejected" | "completed";
  submittedBy?: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const namingDedicationFormSchema = new Schema<INamingDedicationForm>(
  {
    // Parent Information
    fatherName: {
      type: String,
      required: [true, "Father name is required"],
      trim: true,
      maxlength: [100, "Father name must be less than 100 characters"],
    },
    fatherPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },
    motherName: {
      type: String,
      required: [true, "Mother name is required"],
      trim: true,
      maxlength: [100, "Mother name must be less than 100 characters"],
    },
    motherPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },
    homeAddress: {
      type: String,
      trim: true,
    },
    homeTelephone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },
    homeCellRegion: {
      type: String,
      trim: true,
      maxlength: [100, "Homecell region must be less than 100 characters"],
    },

    // Church Information
    churchZoneId: {
      type: Schema.Types.ObjectId,
      ref: "ChurchZone",
    },
    worshipCenter: {
      type: String,
      trim: true,
      maxlength: [100, "Worship center must be less than 100 characters"],
    },
    cellLeaderName: {
      type: String,
      trim: true,
      maxlength: [100, "Cell leader name must be less than 100 characters"],
    },
    regionalPastorName: {
      type: String,
      trim: true,
      maxlength: [100, "Regional pastor name must be less than 100 characters"],
    },

    // Membership Information
    fatherMembershipLevel: {
      type: String,
      enum: [
        "Pastor",
        "Zonal Coordinator",
        "Area Coordinator",
        "Section Leader/Head of Unit",
        "Cell Leader",
        "Assistant Cell Leader",
        "Church Attendee",
        "Member",
      ],
    },
    motherMembershipLevel: {
      type: String,
      enum: [
        "Pastor",
        "Zonal Coordinator",
        "Area Coordinator",
        "Section Leader/Head of Unit",
        "Cell Leader",
        "Assistant Cell Leader",
        "Church Attendee",
        "Member",
      ],
    },
    fatherIsMember: {
      type: Boolean,
      default: false,
    },
    motherIsMember: {
      type: Boolean,
      default: false,
    },
    fatherDaystarMember: {
      type: String,
      enum: ["yes", "no"],
    },
    motherDaystarMember: {
      type: String,
      enum: ["yes", "no"],
    },

    // Baby Information
    babies: [
      {
        name: { type: String, required: true, trim: true },
        dateOfBirth: { type: Date, required: true },
        sex: { type: String, required: true, enum: ["Male", "Female"] },
      },
    ],
    placeOfBirth: {
      type: String,
      trim: true,
      maxlength: [100, "Place of birth must be less than 100 characters"],
    },
    isTwins: {
      type: Boolean,
      default: false,
    },

    // Ceremony Details
    ceremonyType: {
      type: String,
      enum: ["naming", "dedication", "both"],
      required: [true, "Ceremony type is required"],
    },
    intendedNamingDate: {
      type: Date,
    },
    intendedDedicationDate: {
      type: Date,
    },

    // Status and Processing
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
namingDedicationFormSchema.index({ churchZoneId: 1 });
namingDedicationFormSchema.index({ status: 1 });
namingDedicationFormSchema.index({ createdAt: -1 });

export default mongoose.model<INamingDedicationForm>(
  "NamingDedicationForm",
  namingDedicationFormSchema,
);
