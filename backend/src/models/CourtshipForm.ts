import mongoose, { Schema, Document } from "mongoose";

export interface ICourtshipForm extends Document {
  // Brother Information
  brotherName: string;
  brotherDob?: Date;
  brotherAge?: number;
  brotherBloodGroup?: string;
  brotherGenotype?: string;
  brotherIsDaystarMember: string;
  brotherChurch?: string;
  brotherSalvationDate?: Date;
  brotherDepartment?: string;
  brotherDaystarCompleted: boolean;
  brotherDaystarLevel?: string;
  brotherBaptizedHolyGhost: boolean;
  brotherBaptizedDate?: Date;
  brotherHomeAddress?: string;
  brotherOccupation?: string;
  brotherPhone?: string;
  brotherEmail?: string;
  brotherOfficeAddress?: string;
  brotherMaritalConviction?: string;
  brotherPreviouslyMarried: boolean;
  brotherPreviousMarriageDetails?: string;
  brotherRecentRelationship: boolean;
  brotherParentalConsent: boolean;
  brotherPhotoUrl?: string;
  brotherProposedWeddingDate?: Date;
  brotherRegionalPastor?: string;
  brotherZonalCoordinator?: string;
  brotherPastorName?: string;
  brotherPastorChurch?: string;
  brotherPastorPhone?: string;
  brotherLetterOfRecommendationUrl?: string;

  // Sister Information
  sisterName: string;
  sisterDob?: Date;
  sisterAge?: number;
  sisterBloodGroup?: string;
  sisterGenotype?: string;
  sisterIsDaystarMember: string;
  sisterChurch?: string;
  sisterSalvationDate?: Date;
  sisterDepartment?: string;
  sisterDaystarCompleted: boolean;
  sisterDaystarLevel?: string;
  sisterBaptizedHolyGhost: boolean;
  sisterBaptizedDate?: Date;
  sisterHomeAddress?: string;
  sisterOccupation?: string;
  sisterPhone?: string;
  sisterEmail?: string;
  sisterOfficeAddress?: string;
  sisterMaritalConviction?: string;
  sisterPreviouslyMarried: boolean;
  sisterPreviousMarriageDetails?: string;
  sisterRecentRelationship: boolean;
  sisterParentalConsent: boolean;
  sisterPhotoUrl?: string;
  sisterProposedWeddingDate?: Date;
  sisterRegionalPastor?: string;
  sisterZonalCoordinator?: string;
  sisterPastorName?: string;
  sisterPastorChurch?: string;
  sisterPastorPhone?: string;
  sisterLetterOfRecommendationUrl?: string;

  // General Information
  proposedWeddingDate?: Date;
  churchZoneId?: mongoose.Types.ObjectId;
  supervisingCounselor?: string;
  counselorPhone?: string;

  // Status and Processing
  status: "pending" | "approved" | "in_counseling" | "completed";

  // Verification Workflow
  membershipVerificationStatus?: "pending" | "verified" | "not_required";
  membershipVerifiedBy?: string;
  membershipVerifiedAt?: Date;
  membershipId?: string;
  membershipVerificationComments?: string;

  zonalVerificationStatus?: "pending" | "verified" | "rejected";
  zonalVerifiedBy?: string;
  zonalVerifiedAt?: Date;
  zonalComments?: string;
  zonalVerificationComments?: string;

  regionalApprovalStatus?: "pending" | "approved" | "rejected";
  regionalApprovedBy?: string;
  regionalApprovedAt?: Date;
  regionalComments?: string;
  regionalApprovalComments?: string;

  // Optional coordinator/pastor fields referenced by some routes
  zonalCoordinator?: string;
  zonalCoordinatorEmail?: string;
  regionalPastor?: string;
  regionalPastorEmail?: string;

  submittedBy?: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courtshipFormSchema = new Schema<ICourtshipForm>(
  {
    // Brother Information
    brotherName: {
      type: String,
      required: [true, "Brother name is required"],
      trim: true,
      maxlength: [100, "Name must be less than 100 characters"],
    },
    brotherDob: {
      type: Date,
    },
    brotherAge: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [100, "Age must be less than 100"],
    },
    brotherBloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      trim: true,
    },
    brotherGenotype: {
      type: String,
      enum: ["AA", "AS", "AC", "SS", "SC", "CC"],
      trim: true,
    },
    brotherIsDaystarMember: {
      type: String,
      required: true,
    },
    brotherChurch: {
      type: String,
      trim: true,
      maxlength: [100, "Church name must be less than 100 characters"],
    },
    brotherSalvationDate: {
      type: Date,
    },
    brotherDepartment: {
      type: String,
      trim: true,
      maxlength: [50, "Department must be less than 50 characters"],
    },
    brotherDaystarCompleted: {
      type: Boolean,
      default: false,
    },
    brotherDaystarLevel: {
      type: String,
      trim: true,
      maxlength: [50, "Daystar level must be less than 50 characters"],
    },
    brotherBaptizedHolyGhost: {
      type: Boolean,
      default: false,
    },
    brotherBaptizedDate: {
      type: Date,
    },
    brotherHomeAddress: {
      type: String,
      trim: true,
    },
    brotherOccupation: {
      type: String,
      trim: true,
      maxlength: [100, "Occupation must be less than 100 characters"],
    },
    brotherPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },
    brotherEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    brotherOfficeAddress: {
      type: String,
      trim: true,
    },
    brotherMaritalConviction: {
      type: String,
      trim: true,
    },
    brotherPreviouslyMarried: {
      type: Boolean,
      default: false,
    },
    brotherPreviousMarriageDetails: {
      type: String,
      trim: true,
    },
    brotherRecentRelationship: {
      type: Boolean,
      default: false,
    },
    brotherParentalConsent: {
      type: Boolean,
      default: false,
    },
    brotherPhotoUrl: {
      type: String,
      trim: true,
    },
    brotherProposedWeddingDate: {
      type: Date,
    },
    brotherRegionalPastor: {
      type: String,
      trim: true,
    },
    brotherZonalCoordinator: {
      type: String,
      trim: true,
    },
    brotherPastorName: {
      type: String,
      trim: true,
    },
    brotherPastorChurch: {
      type: String,
      trim: true,
    },
    brotherPastorPhone: {
      type: String,
      trim: true,
    },
    brotherLetterOfRecommendationUrl: {
      type: String,
      trim: true,
    },

    // Sister Information
    sisterName: {
      type: String,
      required: [true, "Sister name is required"],
      trim: true,
      maxlength: [100, "Name must be less than 100 characters"],
    },
    sisterDob: {
      type: Date,
    },
    sisterAge: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [100, "Age must be less than 100"],
    },
    sisterBloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      trim: true,
    },
    sisterGenotype: {
      type: String,
      enum: ["AA", "AS", "AC", "SS", "SC", "CC"],
      trim: true,
    },
    sisterIsDaystarMember: {
      type: String,
      required: true,
    },
    sisterChurch: {
      type: String,
      trim: true,
      maxlength: [100, "Church name must be less than 100 characters"],
    },
    sisterSalvationDate: {
      type: Date,
    },
    sisterDepartment: {
      type: String,
      trim: true,
      maxlength: [50, "Department must be less than 50 characters"],
    },
    sisterDaystarCompleted: {
      type: Boolean,
      default: false,
    },
    sisterDaystarLevel: {
      type: String,
      trim: true,
      maxlength: [50, "Daystar level must be less than 50 characters"],
    },
    sisterBaptizedHolyGhost: {
      type: Boolean,
      default: false,
    },
    sisterBaptizedDate: {
      type: Date,
    },
    sisterHomeAddress: {
      type: String,
      trim: true,
    },
    sisterOccupation: {
      type: String,
      trim: true,
      maxlength: [100, "Occupation must be less than 100 characters"],
    },
    sisterPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },
    sisterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    sisterOfficeAddress: {
      type: String,
      trim: true,
    },
    sisterMaritalConviction: {
      type: String,
      trim: true,
    },
    sisterPreviouslyMarried: {
      type: Boolean,
      default: false,
    },
    sisterPreviousMarriageDetails: {
      type: String,
      trim: true,
    },
    sisterRecentRelationship: {
      type: Boolean,
      default: false,
    },
    sisterParentalConsent: {
      type: Boolean,
      default: false,
    },
    sisterPhotoUrl: {
      type: String,
      trim: true,
    },
    sisterProposedWeddingDate: {
      type: Date,
    },
    sisterRegionalPastor: {
      type: String,
      trim: true,
    },
    sisterZonalCoordinator: {
      type: String,
      trim: true,
    },
    sisterPastorName: {
      type: String,
      trim: true,
    },
    sisterPastorChurch: {
      type: String,
      trim: true,
    },
    sisterPastorPhone: {
      type: String,
      trim: true,
    },
    sisterLetterOfRecommendationUrl: {
      type: String,
      trim: true,
    },

    // General Information
    proposedWeddingDate: {
      type: Date,
    },
    churchZoneId: {
      type: Schema.Types.ObjectId,
      ref: "ChurchZone",
    },
    supervisingCounselor: {
      type: String,
      trim: true,
      maxlength: [100, "Counselor name must be less than 100 characters"],
    },
    counselorPhone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be less than 20 characters"],
    },

    // Status and Processing
    status: {
      type: String,
      enum: ["pending", "approved", "in_counseling", "completed"],
      default: "pending",
    },

    // Membership Verification
    membershipVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "not_required"],
      default: "pending",
    },
    membershipVerifiedBy: {
      type: String,
      trim: true,
    },
    membershipVerifiedAt: {
      type: Date,
    },
    membershipId: {
      type: String,
      trim: true,
    },
    membershipVerificationComments: {
      type: String,
      trim: true,
    },

    // Zonal Verification
    zonalVerificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    zonalVerifiedBy: {
      type: String,
      trim: true,
    },
    zonalVerifiedAt: {
      type: Date,
    },
    zonalComments: {
      type: String,
      trim: true,
    },
    zonalVerificationComments: {
      type: String,
      trim: true,
    },

    // Regional Approval
    regionalApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    regionalApprovedBy: {
      type: String,
      trim: true,
    },
    regionalApprovedAt: {
      type: Date,
    },
    regionalComments: {
      type: String,
      trim: true,
    },
    regionalApprovalComments: {
      type: String,
      trim: true,
    },

    zonalCoordinator: {
      type: String,
      trim: true,
    },
    zonalCoordinatorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    regionalPastor: {
      type: String,
      trim: true,
    },
    regionalPastorEmail: {
      type: String,
      trim: true,
      lowercase: true,
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
courtshipFormSchema.index({ churchZoneId: 1 });
courtshipFormSchema.index({ status: 1 });
courtshipFormSchema.index({ createdAt: -1 });

export default mongoose.model<ICourtshipForm>(
  "CourtshipForm",
  courtshipFormSchema,
);
