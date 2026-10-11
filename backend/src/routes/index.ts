import express, { Router } from "express";
import authRoutes from "./auth";
import namingDedicationFormRoutes from "./namingDedicationForms";
import courtshipFormRoutes from "./courtshipForms";
import burialRequestFormRoutes from "./burialRequestForms";
import churchZoneRoutes from "./churchZones";
import notificationRoutes from "./notifications";
import userRoutes from "./users";
import formRoutes from "./forms";
import dashboardRoutes from "./dashboard";
import courtshipVerificationRoutes from "./courtshipVerification";

const router: Router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/forms/naming-dedication", namingDedicationFormRoutes);
router.use("/forms/courtship", courtshipFormRoutes);
router.use("/courtship", courtshipVerificationRoutes);
router.use("/forms/burial-request", burialRequestFormRoutes);
router.use("/church-zones", churchZoneRoutes);
router.use("/notifications", notificationRoutes);
router.use("/forms", formRoutes);

export default router;
