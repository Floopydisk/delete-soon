import { z } from "zod";

// User schemas
export const userRegistrationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    phone: z.string().optional(),
    churchZone: z.string().optional(),
    membershipLevel: z.enum(["Member", "Leader", "Pastor", "Elder"]).optional(),
  }),
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Church Zone schemas
export const createChurchZoneSchema = z.object({
  body: z.object({
    zoneName: z.string().min(1, "Zone name is required").max(100),
    districtPastorName: z.string().max(100).optional(),
    districtPastorEmail: z.string().email("Invalid email").optional(),
    regionalPastorName: z.string().max(100).optional(),
    regionalPastorEmail: z.string().email("Invalid email").optional(),
    zonalCoordinatorName: z.string().max(100).optional(),
    zonalCoordinatorEmail: z.string().email("Invalid email").optional(),
  }),
});

// Naming Dedication Form schemas
export const createNamingDedicationFormSchema = z.object({
  body: z.object({
    // Parent Information
    fatherName: z.string().min(1, "Father name is required").max(100),
    fatherPhone: z.string().max(20).optional(),
    motherName: z.string().min(1, "Mother name is required").max(100),
    motherPhone: z.string().max(20).optional(),
    homeAddress: z.string().optional(),
    homeTelephone: z.string().max(20).optional(),

    // Church Information
    churchZoneId: z.string().optional(),
    worshipCenter: z.string().max(100).optional(),
    cellLeaderName: z.string().max(100).optional(),
    districtPastorName: z.string().max(100).optional(),

    // Membership Information
    fatherMembershipLevel: z
      .enum([
        "Zonal Coordinator",
        "Pastor",
        "Area Coordinator",
        "Section Leader/Head of Unit",
        "Cell Leader",
        "Assistant Cell Leader",
        "Church Attendee",
        "Member",
        "Elder",
        "Non-Member",
      ])
      .optional()
      .or(z.literal("")),
    motherMembershipLevel: z
      .enum([
        "Zonal Coordinator",
        "Pastor",
        "Area Coordinator",
        "Section Leader/Head of Unit",
        "Cell Leader",
        "Assistant Cell Leader",
        "Church Attendee",
        "Member",
        "Elder",
        "Non-Member",
      ])
      .optional()
      .or(z.literal("")),
    fatherIsMember: z.boolean().default(false),
    motherIsMember: z.boolean().default(false),

    // Baby Information
    babies: z
      .array(
        z.object({
          name: z.string().min(1, "Baby name is required"),
          dateOfBirth: z.preprocess((arg) => {
            if (typeof arg == "string" || arg instanceof Date)
              return new Date(arg);
          }, z.date()),
          sex: z.string().min(1, "Sex is required"),
        }),
      )
      .min(1, "At least one baby is required"),
    placeOfBirth: z.string().max(100).optional(),
    isTwins: z.boolean().default(false),

    // Ceremony Details
    ceremonyType: z.enum(["naming", "dedication", "both"]),
    intendedNamingDate: z
      .preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
    intendedDedicationDate: z
      .preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
  }),
});

// Courtship Form schemas
const yesNoBoolean = z.preprocess((value) => {
  if (value === "yes" || value === true) return true;
  if (value === "no" || value === false) return false;
  return value;
}, z.boolean());

export const initiateCourtshipFormSchema = z.object({
  body: z
    .object({
      churchZoneId: z.string().min(1, "Church zone is required"),
      brotherEmail: z.string().email("Invalid brother email").optional(),
      sisterEmail: z.string().email("Invalid sister email").optional(),
    })
    .refine((data) => data.brotherEmail || data.sisterEmail, {
      message: "At least one applicant email is required",
      path: ["brotherEmail"],
    }),
});

export const createCourtshipFormSchema = z
  .object({
    body: z.object({
      // Brother Information
      brotherName: z.string().min(1, "Brother name is required").max(100),
      brotherDob: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      brotherAge: z
        .preprocess(
          (a) => parseInt(z.string().parse(a), 10),
          z.number().positive(),
        )
        .optional(),
      brotherBloodGroup: z
        .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
        .optional(),
      brotherGenotype: z.enum(["AA", "AS", "AC", "SS", "SC", "CC"]).optional(),
      brotherIsDaystarMember: z.enum(["yes", "no"]),
      brotherChurch: z.string().max(100).optional(),
      brotherSalvationDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      brotherDepartment: z.string().max(100).optional(),
      brotherDaystarCompleted: yesNoBoolean.optional(),
      brotherDaystarLevel: z.string().max(50).optional(),
      brotherBaptizedHolyGhost: yesNoBoolean.optional(),
      brotherBaptizedDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      brotherHomeAddress: z.string().optional(),
      brotherOccupation: z.string().max(100).optional(),
      brotherPhone: z.string().max(20).optional(),
      brotherEmail: z.string().email("Invalid email").optional(),
      brotherOfficeAddress: z.string().optional(),
      brotherMaritalConviction: z.string().optional(),
      brotherPreviouslyMarried: yesNoBoolean,
      brotherPreviousMarriageDetails: z.string().optional(),
      brotherRecentRelationship: yesNoBoolean,
      brotherParentalConsent: yesNoBoolean,
      brotherProposedWeddingDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),

      // Sister Information
      sisterName: z.string().min(1, "Sister name is required").max(100),
      sisterDob: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      sisterAge: z
        .preprocess(
          (a) => parseInt(z.string().parse(a), 10),
          z.number().positive(),
        )
        .optional(),
      sisterBloodGroup: z
        .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
        .optional(),
      sisterGenotype: z.enum(["AA", "AS", "AC", "SS", "SC", "CC"]).optional(),
      sisterIsDaystarMember: z.enum(["yes", "no"]),
      sisterChurch: z.string().max(100).optional(),
      sisterSalvationDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      sisterDepartment: z.string().max(50).optional(),
      sisterDaystarCompleted: yesNoBoolean.optional(),
      sisterDaystarLevel: z.string().max(50).optional(),
      sisterBaptizedHolyGhost: yesNoBoolean.optional(),
      sisterBaptizedDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      sisterHomeAddress: z.string().optional(),
      sisterOccupation: z.string().max(100).optional(),
      sisterPhone: z.string().max(20).optional(),
      sisterEmail: z.string().email("Invalid email").optional(),
      sisterOfficeAddress: z.string().optional(),
      sisterMaritalConviction: z.string().optional(),
      sisterPreviouslyMarried: yesNoBoolean,
      sisterPreviousMarriageDetails: z.string().optional(),
      sisterRecentRelationship: yesNoBoolean,
      sisterParentalConsent: yesNoBoolean,
      sisterProposedWeddingDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),

      // General Information
      proposedWeddingDate: z
        .preprocess((arg) => {
          if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
        }, z.date())
        .optional(),
      churchZoneId: z.string().min(1, "Church zone is required"),
      initiationToken: z
        .string()
        .min(1, "A coordinator-issued form link is required"),
      supervisingCounselor: z.string().max(100).optional(),
      counselorPhone: z.string().max(20).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { body } = data;
    if (body.brotherIsDaystarMember === "yes" && !body.brotherDaystarLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "brotherDaystarLevel"],
        message:
          "Brother's Daystar Academy level is required for Daystar members.",
      });
    }
    if (body.sisterIsDaystarMember === "yes" && !body.sisterDaystarLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "sisterDaystarLevel"],
        message:
          "Sister's Daystar Academy level is required for Daystar members.",
      });
    }
    if (
      body.brotherIsDaystarMember === "yes" &&
      body.sisterIsDaystarMember === "yes" &&
      body.brotherDaystarLevel === "Yet to Attend" &&
      body.sisterDaystarLevel === "Yet to Attend"
    ) {
      const message =
        "At least one applicant must have completed Daystar Academy 100 Level before this form can proceed.";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "brotherDaystarLevel"],
        message,
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "sisterDaystarLevel"],
        message,
      });
    }
  });

// Burial Request Form Schema
export const createBurialRequestFormSchema = z.object({
  body: z.object({
    fullNameOfDeceased: z.string().min(1, "Full name of deceased is required"),
    dateOfBirth: z.preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    dateOfDeath: z.preprocess((arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    ageAtTimeOfDeath: z.string().min(1, "Age at time of death is required"),
    causeOfDeath: z.string().min(1, "Cause of death is required"),
    maritalStatus: z.string().min(1, "Marital status is required"),
    churchInvolvement: z.string().min(1, "Church involvement is required"),
    serviceOfSongsDate: z
      .preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
    serviceOfSongsVenue: z.string().optional(),
    funeralServiceDate: z
      .preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
    funeralServiceVenue: z.string().optional(),
    zonalCoordinator: z.string().min(1, "Zonal coordinator is required"),
    zone: z.string().min(1, "Zone is required"),
    region: z.string().min(1, "Region is required"),
    regionalPastor: z.string().min(1, "Regional pastor is required"),
    remarks: z.string().optional(),
  }),
});

// Common schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10)),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

export const statusUpdateSchema = z.object({
  body: z.object({
    status: z.enum([
      "pending",
      "approved",
      "rejected",
      "completed",
      "in_counseling",
    ]),
    notes: z.string().optional(),
  }),
});

// Notification schema
export const createNotificationSchema = z.object({
  body: z.object({
    recipientEmail: z.string().email("Invalid email address"),
    recipientName: z.string().optional(),
    subject: z.string().min(1, "Subject is required").max(255),
    message: z.string().min(1, "Message is required"),
    formType: z.enum(["naming_dedication", "courtship", "burial", "custom"]),
    formId: z.string().min(1, "Form ID is required"),
  }),
});
