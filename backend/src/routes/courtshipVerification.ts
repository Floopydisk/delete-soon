import { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import CourtshipForm from "../models/CourtshipForm";
import validate from "../middleware/validation";
import { authenticate, authorize } from "../middleware/auth";
import {
  sendVerificationConfirmation,
  sendZonalVerificationRequest,
  sendRegionalApprovalRequest,
  sendFinalApprovalNotification,
} from "../services/emailService";

const router = Router();

/**
 * Verify membership (Festus only)
 * POST /api/courtship/verify-membership/:id
 */
router.post(
  "/verify-membership/:id",
  authenticate,
  authorize(["admin"]), // Only admin (Festus) can verify membership
  [
    param("id").isMongoId().withMessage("Invalid form ID"),
    body("brotherMembershipId").optional().trim().notEmpty(),
    body("sisterMembershipId").optional().trim().notEmpty(),
    body("comments").optional().trim(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const form = await CourtshipForm.findById(req.params.id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      // Check if already verified
      if (form.membershipVerificationStatus === "verified") {
        return res.status(400).json({ message: "Membership already verified" });
      }

      const { brotherMembershipId, sisterMembershipId, comments } = req.body;

      // Update form with membership verification
      form.membershipVerificationStatus = "verified";
      form.membershipVerifiedBy = (req.user as any)?.name || "Admin";
      form.membershipVerifiedAt = new Date();
      form.membershipVerificationComments = comments;

      // Update membership IDs if provided
      if (brotherMembershipId && form.brotherIsDaystarMember === "yes") {
        form.membershipId = brotherMembershipId;
      }
      if (sisterMembershipId && form.sisterIsDaystarMember === "yes") {
        form.membershipId = sisterMembershipId;
      }

      await form.save();

      // Send confirmation email to respondent
      await sendVerificationConfirmation(
        form.brotherEmail || form.sisterEmail || "",
        form.brotherName,
        form.sisterName,
        brotherMembershipId || sisterMembershipId || "",
        form._id.toString(),
      );

      if (form.zonalCoordinator && form.zonalCoordinatorEmail) {
        await sendZonalVerificationRequest(
          form.zonalCoordinatorEmail,
          form.zonalCoordinator,
          form._id.toString(),
          form.brotherName,
          form.sisterName,
          `${process.env.FRONTEND_URL}/admin/courtship/${form._id}/verify-zonal`,
        );
      }

      res.json({
        message: "Membership verified successfully",
        form,
      });
    } catch (error) {
      console.error("Error verifying membership:", error);
      res.status(500).json({ message: "Failed to verify membership" });
    }
  },
);

/**
 * Verify zonal coordinator review
 * POST /api/courtship/verify-zonal/:id
 * Single-button approval - no required fields, comments optional
 */
router.post(
  "/verify-zonal/:id",
  authenticate,
  authorize(["admin", "superAdmin", "pastorate"]),
  [
    param("id").isMongoId().withMessage("Invalid form ID"),
    body("comments").optional().trim(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const form = await CourtshipForm.findById(req.params.id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      const userEmail = (req.user as any)?.email?.toLowerCase();
      const isAdmin = ["admin", "superAdmin"].includes((req.user as any)?.role);
      if (!isAdmin && userEmail !== form.zonalCoordinatorEmail?.toLowerCase()) {
        return res.status(403).json({ message: "Only the assigned Zonal Coordinator can verify this form." });
      }

      // For Daystar members, check if membership verification is complete
      if (
        (form.brotherIsDaystarMember === "yes" || form.sisterIsDaystarMember === "yes") &&
        form.membershipVerificationStatus !== "verified"
      ) {
        return res.status(400).json({
          message: "Membership verification must be completed first",
        });
      }

      // Check if already verified
      if (form.zonalVerificationStatus === "verified") {
        return res
          .status(400)
          .json({ message: "Zonal verification already completed" });
      }

      const { comments } = req.body;

      // Update form with zonal verification
      form.zonalVerificationStatus = "verified";
      form.zonalVerifiedBy = (req.user as any)?.name || "Zonal Coordinator";
      form.zonalVerifiedAt = new Date();
      form.zonalVerificationComments = comments;

      await form.save();

      if (form.regionalPastor && form.regionalPastorEmail) {
        await sendRegionalApprovalRequest(
          form.regionalPastorEmail,
          form.regionalPastor,
          form._id.toString(),
          form.brotherName,
          form.sisterName,
          `${process.env.FRONTEND_URL}/admin/courtship/${form._id}/approve-regional`,
        );
      }

      res.json({
        message: "Zonal verification completed successfully",
        form,
      });
    } catch (error) {
      console.error("Error verifying zonal coordinator:", error);
      res
        .status(500)
        .json({ message: "Failed to complete zonal verification" });
    }
  },
);

/**
 * Regional pastor final approval
 * POST /api/courtship/approve-regional/:id
 * Single-button approval - no required fields, comments optional
 */
router.post(
  "/approve-regional/:id",
  authenticate,
  authorize(["admin", "superAdmin", "pastorate"]),
  [
    param("id").isMongoId().withMessage("Invalid form ID"),
    body("comments").optional().trim(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const form = await CourtshipForm.findById(req.params.id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      const userEmail = (req.user as any)?.email?.toLowerCase();
      const isAdmin = ["admin", "superAdmin"].includes((req.user as any)?.role);
      if (!isAdmin && userEmail !== form.regionalPastorEmail?.toLowerCase()) {
        return res.status(403).json({ message: "Only the assigned Regional Pastor can approve this form." });
      }

      // Check if zonal verification is complete
      if (form.zonalVerificationStatus !== "verified") {
        return res.status(400).json({
          message: "Zonal verification must be completed first",
        });
      }

      // Check if already approved
      if (form.regionalApprovalStatus === "approved") {
        return res
          .status(400)
          .json({ message: "Already approved by regional pastor" });
      }

      const { comments } = req.body;

      // Update form with regional approval
      form.regionalApprovalStatus = "approved";
      form.regionalApprovedBy = (req.user as any)?.name || "Regional Pastor";
      form.regionalApprovedAt = new Date();
      form.regionalApprovalComments = comments;

      await form.save();

      // Send final approval notification to respondent
      await sendFinalApprovalNotification(
        form.brotherEmail || form.sisterEmail || "",
        form.brotherName,
        form.sisterName,
        form._id.toString(),
        form.supervisingCounselor,
      );

      res.json({
        message: "Application approved successfully",
        form,
      });
    } catch (error) {
      console.error("Error approving application:", error);
      res.status(500).json({ message: "Failed to approve application" });
    }
  },
);

/**
 * Get verification status
 * GET /api/courtship/verification-status/:id
 */
router.get(
  "/verification-status/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid form ID")],
  validate,
  async (req: Request, res: Response) => {
    try {
      const form = await CourtshipForm.findById(req.params.id).select(
        "membershipVerificationStatus zonalVerificationStatus regionalApprovalStatus " +
          "membershipVerifiedBy membershipVerifiedAt membershipVerificationComments " +
          "zonalVerifiedBy zonalVerifiedAt zonalVerificationComments " +
          "regionalApprovedBy regionalApprovedAt regionalApprovalComments " +
          "brotherName sisterName createdAt",
      );

      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      res.json({
        formId: form._id,
        couple: {
          brother: form.brotherName,
          sister: form.sisterName,
        },
        submittedAt: form.createdAt,
        membershipVerification: {
          status: form.membershipVerificationStatus,
          verifiedBy: form.membershipVerifiedBy,
          verifiedAt: form.membershipVerifiedAt,
          comments: form.membershipVerificationComments,
        },
        zonalVerification: {
          status: form.zonalVerificationStatus,
          verifiedBy: form.zonalVerifiedBy,
          verifiedAt: form.zonalVerifiedAt,
          comments: form.zonalVerificationComments,
        },
        regionalApproval: {
          status: form.regionalApprovalStatus,
          approvedBy: form.regionalApprovedBy,
          approvedAt: form.regionalApprovedAt,
          comments: form.regionalApprovalComments,
        },
      });
    } catch (error) {
      console.error("Error fetching verification status:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  },
);

export default router;
