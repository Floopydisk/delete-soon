import express from "express";
import {
  getDashboardStatistics,
  getChartData,
  getRecentActivity,
} from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Dashboard content is role-scoped in the controller. Admins see all data;
// assigned coordinators and Regional Pastors see only their courtship queue.
router.use(authenticate);

// @route   GET /api/dashboard/statistics
// @desc    Get comprehensive dashboard statistics
// @access  Private/Admin
router.get("/statistics", getDashboardStatistics);

// @route   GET /api/dashboard/chart-data
// @desc    Get chart data for form submissions over time
// @access  Private/Admin
router.get("/chart-data", getChartData);

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity feed
// @access  Private/Admin
router.get("/recent-activity", getRecentActivity);

export default router;
