import crypto from "crypto";
import express, { Router } from "express";
import {
  ChurchZone,
  CourtshipForm,
  CourtshipInitiation,
  hashCourtshipInitiationToken,
  Notification,
} from "@/models";
import { authenticate, requireAdmin } from "@/middleware";
import validate from "@/middleware/validation";
import {
  createCourtshipFormSchema,
  initiateCourtshipFormSchema,
  paginationSchema,
  idParamSchema,
  statusUpdateSchema,
} from "@/types/schemas";
import {
  sendSubmissionConfirmation,
  sendMembershipVerificationRequest,
  sendFamilyLifeNotification,
  sendCourtshipInitiation,
  sendCourtshipSignatoryNotification,
} from "@/services/emailService";

const router: Router = express.Router();

const getZoneSignatories = (zone: any) => ({
  zonalCoordinator: zone.zonalCoordinatorName,
  zonalCoordinatorEmail: zone.zonalCoordinatorEmail,
  regionalPastor: zone.regionalPastorName || zone.districtPastorName,
  regionalPastorEmail: zone.regionalPastorEmail || zone.districtPastorEmail,
});

const normalizedEmail = (email?: string) => email?.trim().toLowerCase();

/**
 * A Zonal Coordinator (or an administrator) starts the process and receives a
 * completion link to share with the applicants. The token prevents direct,
 * unauthorised public submissions.
 */
router.post(
  "/initiate",
  authenticate,
  validate(initiateCourtshipFormSchema),
  async (req, res) => {
    try {
      const { churchZoneId, brotherEmail, sisterEmail } = req.body;
      if (!churchZoneId || (!brotherEmail && !sisterEmail)) {
        return res.status(400).json({
          status: "error",
          message:
            "A church zone and at least one applicant email are required.",
        });
      }

      const zone = await ChurchZone.findById(churchZoneId);
      if (!zone) {
        return res
          .status(404)
          .json({ status: "error", message: "Church zone not found." });
      }
      const signatories = getZoneSignatories(zone);
      if (
        !signatories.zonalCoordinator ||
        !signatories.zonalCoordinatorEmail ||
        !signatories.regionalPastor ||
        !signatories.regionalPastorEmail
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "This zone must have both a Zonal Coordinator and Regional Pastor with email addresses before a courtship form can be initiated.",
        });
      }

      const requesterEmail = normalizedEmail(req.user?.email);
      const isAdmin = ["admin", "superAdmin"].includes(req.user?.role || "");
      const isAssignedCoordinator =
        requesterEmail &&
        requesterEmail === normalizedEmail(zone.zonalCoordinatorEmail);
      if (!isAdmin && !isAssignedCoordinator) {
        return res.status(403).json({
          status: "error",
          message:
            "Only the selected zone's Zonal Coordinator can initiate this form.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const initiation = await CourtshipInitiation.create({
        churchZoneId: zone._id,
        initiatedBy: req.user!._id,
        brotherEmail: normalizedEmail(brotherEmail),
        sisterEmail: normalizedEmail(sisterEmail),
        tokenHash: hashCourtshipInitiationToken(token),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
      const completionUrl = `${process.env.FRONTEND_URL}/forms/courtship?invite=${token}`;

      await Promise.all(
        [normalizedEmail(brotherEmail), normalizedEmail(sisterEmail)]
          .filter((email): email is string => Boolean(email))
          .map((email) =>
            sendCourtshipInitiation(email, completionUrl, zone.zoneName),
          ),
      );

      res.status(201).json({
        status: "success",
        message:
          "Courtship form initiated and completion link sent to the applicant(s).",
        data: {
          initiationId: initiation._id,
          completionUrl,
          expiresAt: initiation.expiresAt,
        },
      });
    } catch (error: any) {
      console.error("Courtship initiation error:", error);
      res
        .status(500)
        .json({
          status: "error",
          message: "Failed to initiate courtship form.",
          error: error.message,
        });
    }
  },
);

/** Returns the zone preselected by a valid coordinator-issued completion link. */
router.get("/initiation/:token", async (req, res) => {
  const initiation = await CourtshipInitiation.findOne({
    tokenHash: hashCourtshipInitiationToken(req.params.token),
    completedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).populate("churchZoneId");

  if (!initiation) {
    return res
      .status(404)
      .json({
        status: "error",
        message:
          "This form link is invalid, expired, or has already been used.",
      });
  }

  const zone = initiation.churchZoneId as any;
  res.status(200).json({
    status: "success",
    data: {
      zone: {
        _id: zone._id,
        zoneName: zone.zoneName,
        ...getZoneSignatories(zone),
      },
    },
  });
});

// Create new courtship form
router.post("/", validate(createCourtshipFormSchema), async (req, res) => {
  console.log("Received courtship form submission:", req.body);
  try {
    const initiation = await CourtshipInitiation.findOne({
      tokenHash: hashCourtshipInitiationToken(req.body.initiationToken),
      completedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!initiation) {
      return res
        .status(403)
        .json({
          status: "error",
          message:
            "This form link is invalid, expired, or has already been used.",
        });
    }
    if (initiation.churchZoneId.toString() !== req.body.churchZoneId) {
      return res
        .status(400)
        .json({
          status: "error",
          message:
            "The selected church zone does not match the coordinator-issued form link.",
        });
    }
    const expectedEmails = [
      initiation.brotherEmail,
      initiation.sisterEmail,
    ].filter(Boolean);
    const submittedEmails = [
      normalizedEmail(req.body.brotherEmail),
      normalizedEmail(req.body.sisterEmail),
    ];
    if (expectedEmails.some((email) => !submittedEmails.includes(email))) {
      return res
        .status(400)
        .json({
          status: "error",
          message:
            "The applicant email addresses must match the coordinator-issued form link.",
        });
    }

    const zone = await ChurchZone.findById(req.body.churchZoneId);
    if (!zone) {
      return res
        .status(400)
        .json({ status: "error", message: "Church zone not found." });
    }
    const { initiationToken: _initiationToken, ...submission } = req.body;
    const formData = {
      ...submission,
      ...getZoneSignatories(zone),
      status: "pending",
    };

    const form = new CourtshipForm(formData);
    await form.save();
    initiation.completedAt = new Date();
    await initiation.save();

    // Populate references for response
    await form.populate(["churchZoneId"]);
    const emailFailures: string[] = [];

    // Send submission confirmation email to respondent
    const respondentEmail = form.brotherEmail || form.sisterEmail;
    if (respondentEmail) {
      const sent = await sendSubmissionConfirmation(
        respondentEmail,
        form.brotherName,
        form.sisterName,
        form._id.toString(),
      );
      if (!sent) emailFailures.push("respondent confirmation");
    }

    // Send notification to Family Life team
    const churchZoneInfo = (form as any).churchZoneId;
    const churchZoneName = churchZoneInfo?.zoneName || "Unknown Zone";
    const familyLifeSent = await sendFamilyLifeNotification(
      form._id.toString(),
      form.brotherName,
      form.sisterName,
      form.brotherEmail || "",
      form.sisterEmail || "",
      churchZoneName,
      form.supervisingCounselor,
    );
    if (!familyLifeSent) emailFailures.push("Family Life notification");

    // If either is a Daystar member, send membership verification request
    const isDaystarMember =
      form.brotherIsDaystarMember === "yes" ||
      form.sisterIsDaystarMember === "yes";
    if (isDaystarMember) {
      const membershipSent = await sendMembershipVerificationRequest(
        form._id.toString(),
        form.brotherName,
        form.sisterName,
        form.brotherIsDaystarMember,
        form.sisterIsDaystarMember,
        `${process.env.FRONTEND_URL}/admin/courtship/${form._id}/verify-membership`,
      );
      if (!membershipSent) emailFailures.push("membership verification");
    }

    const signatories = getZoneSignatories(zone);
    const notificationRecipients = [
      {
        email: signatories.zonalCoordinatorEmail,
        name: signatories.zonalCoordinator,
        role: "Zonal Coordinator" as const,
      },
      {
        email: signatories.regionalPastorEmail,
        name: signatories.regionalPastor,
        role: "Regional Pastor" as const,
      },
    ].filter((recipient) => recipient.email && recipient.name);
    await Promise.all(
      notificationRecipients.map(async (recipient) => {
        const sent = await sendCourtshipSignatoryNotification(
          recipient.email,
          recipient.name,
          recipient.role,
          form._id.toString(),
          form.brotherName,
          form.sisterName,
          zone.zoneName,
        );
        await Notification.create({
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          subject: `New Courtship Form Submission for ${zone.zoneName}`,
          message: `A new courtship form has been submitted for your zone. You are required to sign as ${recipient.role}.`,
          formType: "courtship",
          formId: form._id.toString(),
          status: sent ? "sent" : "failed",
          ...(sent ? { sentAt: new Date() } : {}),
        });
      }),
    );

    res.status(201).json({
      status: "success",
      message: emailFailures.length
        ? "Courtship form created, but some email notifications failed"
        : "Courtship form created successfully",
      data: {
        form,
        emailFailures,
      },
    });
  } catch (error) {
    console.error("Form creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create form",
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as any).message
          : String(error),
    });
  }
});

/**
 * Workflow work queue. Administrators see all courtship forms; a pastorate
 * user sees only forms for which their email is the assigned coordinator or
 * Regional Pastor.
 */
router.get("/workflow", authenticate, async (req, res) => {
  try {
    const isAdmin = ["admin", "superAdmin"].includes(req.user?.role || "");
    const email = normalizedEmail(req.user?.email);
    const filter = isAdmin
      ? {}
      : {
          $or: [
            { zonalCoordinatorEmail: email },
            { regionalPastorEmail: email },
          ],
        };

    const forms = await CourtshipForm.find(filter)
      .populate("churchZoneId", "zoneName")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ status: "success", data: { forms } });
  } catch (error: any) {
    console.error("Courtship workflow fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch courtship workflow.",
      error: error.message,
    });
  }
});

// Get all forms (with pagination and filtering)
router.get("/", authenticate, validate(paginationSchema), async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = {};

    // Role-based filtering
    if (req.user && req.user.role === "pastorate") {
      filter.churchZoneId = req.user.churchZone;
    }

    // Additional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.churchZone) {
      filter.churchZoneId = req.query.churchZone;
    }

    // Build sort options
    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    // Execute query
    const [forms, totalCount] = await Promise.all([
      CourtshipForm.find(filter)
        .populate("churchZoneId", "zoneName")
        .populate("submittedBy", "firstName lastName email")
        .populate("processedBy", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      CourtshipForm.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      status: "success",
      data: {
        forms,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          limit: Number(limit),
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error: any) {
    console.error("Forms fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch forms",
      error: error.message,
    });
  }
});

// Get single form by ID
router.get("/:id", authenticate, validate(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const form = await CourtshipForm.findById(id)
      .populate("churchZoneId")
      .populate("submittedBy", "firstName lastName email phone")
      .populate("processedBy", "firstName lastName email");

    if (!form) {
      return res.status(404).json({
        status: "error",
        message: "Form not found",
      });
    }

    // Check if user can view this form
    if (
      req.user &&
      !["admin", "superAdmin"].includes(req.user.role) &&
      form.submittedBy?._id.toString() !== (req.user._id as any).toString()
    ) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only view your own forms.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        form,
      },
    });
  } catch (error: any) {
    console.error("Form fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch form",
      error: error.message,
    });
  }
});

// Update form status (Admin only)
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(idParamSchema),
  validate(statusUpdateSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const form = await CourtshipForm.findById(id);
      if (!form) {
        return res.status(404).json({
          status: "error",
          message: "Form not found",
        });
      }

      form.status = status;
      if (req.user) {
        form.processedBy = req.user._id as any;
      }

      await form.save();

      // Populate for response
      await form.populate(["churchZoneId", "submittedBy", "processedBy"]);

      res.status(200).json({
        status: "success",
        message: "Form status updated successfully",
        data: {
          form,
        },
      });
    } catch (error: any) {
      console.error("Status update error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update form status",
        error: error.message,
      });
    }
  },
);

// Update form (only if pending and by owner or admin)
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      const form = await CourtshipForm.findById(id);
      if (!form) {
        return res.status(404).json({
          status: "error",
          message: "Form not found",
        });
      }

      // No member-specific permission checks

      // Update allowed fields
      const allowedUpdates = [
        // Brother Information
        "brotherName",
        "brotherDob",
        "brotherAge",
        "brotherBloodGroup",
        "brotherGenotype",
        "brotherChurch",
        "brotherSalvationDate",
        "brotherDepartment",
        "brotherDaystarCompleted",
        "brotherDaystarLevel",
        "brotherBaptizedHolyGhost",
        "brotherBaptizedDate",
        "brotherHomeAddress",
        "brotherOccupation",
        "brotherPhone",
        "brotherEmail",
        "brotherOfficeAddress",
        "brotherMaritalConviction",
        "brotherPreviouslyMarried",
        "brotherPreviousMarriageDetails",
        "brotherRecentRelationship",
        "brotherParentalConsent",
        "brotherProposedWeddingDate",
        // Sister Information
        "sisterName",
        "sisterDob",
        "sisterAge",
        "sisterBloodGroup",
        "sisterGenotype",
        "sisterChurch",
        "sisterSalvationDate",
        "sisterDepartment",
        "sisterDaystarCompleted",
        "sisterDaystarLevel",
        "sisterBaptizedHolyGhost",
        "sisterBaptizedDate",
        "sisterHomeAddress",
        "sisterOccupation",
        "sisterPhone",
        "sisterEmail",
        "sisterOfficeAddress",
        "sisterMaritalConviction",
        "sisterPreviouslyMarried",
        "sisterPreviousMarriageDetails",
        "sisterRecentRelationship",
        "sisterParentalConsent",
        "sisterProposedWeddingDate",
        // General Information
        "proposedWeddingDate",
        "churchZoneId",
        "supervisingCounselor",
        "counselorPhone",
      ];

      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          (form as any)[key] = req.body[key];
        }
      });

      await form.save();
      await form.populate(["churchZoneId", "submittedBy", "processedBy"]);

      res.status(200).json({
        status: "success",
        message: "Form updated successfully",
        data: {
          form,
        },
      });
    } catch (error: any) {
      console.error("Form update error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update form",
        error: error.message,
      });
    }
  },
);

// Delete courtship form
// Only admins can delete any form; regular users can delete their own forms if status is 'pending'
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      const form = await CourtshipForm.findById(id);
      if (!form) {
        return res.status(404).json({
          status: "error",
          message: "Form not found",
        });
      }

      const deletedForm = await CourtshipForm.findByIdAndDelete(id);

      if (!deletedForm) {
        return res.status(404).json({
          status: "error",
          message: "Form not found or already deleted",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Form deleted successfully",
      });
    } catch (error: any) {
      console.error("Form deletion error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete form",
        error: error.message,
      });
    }
  },
);

// Get form statistics (Admin only)
router.get(
  "/statistics/overview",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [
        totalForms,
        pendingForms,
        approvedForms,
        inCounselingForms,
        completedForms,
        recentForms,
      ] = await Promise.all([
        CourtshipForm.countDocuments(),
        CourtshipForm.countDocuments({ status: "pending" }),
        CourtshipForm.countDocuments({ status: "approved" }),
        CourtshipForm.countDocuments({ status: "in_counseling" }),
        CourtshipForm.countDocuments({ status: "completed" }),
        CourtshipForm.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        }),
      ]);

      res.status(200).json({
        status: "success",
        data: {
          statistics: {
            total: totalForms,
            pending: pendingForms,
            approved: approvedForms,
            inCounseling: inCounselingForms,
            completed: completedForms,
            recent: recentForms,
          },
        },
      });
    } catch (error: any) {
      console.error("Statistics fetch error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch statistics",
        error: error.message,
      });
    }
  },
);

export default router;
