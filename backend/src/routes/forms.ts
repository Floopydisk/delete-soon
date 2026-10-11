import express from "express";
import {
  getAllSubmissions,
  updateNamingDedicationStatus,
  updateCourtshipStatus,
  updateBurialRequestStatus,
} from "../controllers/formController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = express.Router();

// Get all submissions
router.get("/submissions", authenticate, requireAdmin, getAllSubmissions);

// Update status endpoints
router.patch(
  "/naming-dedication/:id/status",
  authenticate,
  requireAdmin,
  updateNamingDedicationStatus
);
router.patch(
  "/courtship/:id/status",
  authenticate,
  requireAdmin,
  updateCourtshipStatus
);
router.patch(
  "/burial/:id/status",
  authenticate,
  requireAdmin,
  updateBurialRequestStatus
);

export default router;
