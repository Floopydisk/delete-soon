import express from "express";
import { Notification } from "@/models";
import { authenticate, requireAdmin } from "@/middleware";
import validate from "@/middleware/validation";
import {
  createNotificationSchema,
  paginationSchema,
  idParamSchema,
} from "@/types/schemas";
import { sendEmail } from "@/services/emailService";

const router: express.Router = express.Router();

// Create new notification
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createNotificationSchema),
  async (req, res) => {
    try {
      const sent = await sendEmail({
        to: req.body.recipientEmail,
        subject: req.body.subject,
        html: req.body.message,
      });
      const notification = new Notification({
        ...req.body,
        status: sent ? "sent" : "failed",
        ...(sent ? { sentAt: new Date() } : {}),
      });
      await notification.save();

      res.status(sent ? 201 : 502).json({
        status: sent ? "success" : "error",
        message: sent
          ? "Notification sent successfully"
          : "Notification was saved but could not be sent",
        data: {
          notification,
        },
      });
    } catch (error: any) {
      console.error("Notification creation error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create notification",
        error: error.message,
      });
    }
  },
);

// Get all notifications (Admin only)
router.get(
  "/",
  authenticate,
  requireAdmin,
  validate(paginationSchema),
  async (req, res) => {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build filter
      const filter: any = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.formType) {
        filter.formType = req.query.formType;
      }

      // Build sort options
      const sortOptions: any = {};
      if (sortBy) {
        sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;
      } else {
        sortOptions.createdAt = -1; // Default sort by newest first
      }

      const [notifications, totalCount] = await Promise.all([
        Notification.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(Number(limit)),
        Notification.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalCount / Number(limit));

      res.status(200).json({
        status: "success",
        data: {
          notifications,
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
      console.error("Notifications fetch error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  },
);

// Get single notification by ID (Admin only)
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({
          status: "error",
          message: "Notification not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: {
          notification,
        },
      });
    } catch (error: any) {
      console.error("Notification fetch error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch notification",
        error: error.message,
      });
    }
  },
);

// Update notification status (Admin only)
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "sent", "failed"].includes(status)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid status. Must be pending, sent, or failed",
        });
      }

      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({
          status: "error",
          message: "Notification not found",
        });
      }

      notification.status = status;
      if (status === "sent") {
        notification.sentAt = new Date();
      }

      await notification.save();

      res.status(200).json({
        status: "success",
        message: "Notification status updated successfully",
        data: {
          notification,
        },
      });
    } catch (error: any) {
      console.error("Notification update error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update notification status",
        error: error.message,
      });
    }
  },
);

// Send pending notifications (Admin only)
router.post("/send-pending", authenticate, requireAdmin, async (req, res) => {
  try {
    const pendingNotifications = await Notification.find({
      status: "pending",
    }).limit(50);

    if (pendingNotifications.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No pending notifications to send",
        data: {
          processed: 0,
        },
      });
    }

    const updatePromises = pendingNotifications.map(async (notification) => {
      try {
        const sent = await sendEmail({
          to: notification.recipientEmail,
          subject: notification.subject,
          html: notification.message,
        });

        notification.status = sent ? "sent" : "failed";
        if (sent) {
          notification.sentAt = new Date();
        }
        return notification.save();
      } catch (error) {
        notification.status = "failed";
        return notification.save();
      }
    });

    const processedNotifications = await Promise.all(updatePromises);
    const sentCount = processedNotifications.filter(
      (notification) => notification.status === "sent",
    ).length;

    res.status(200).json({
      status: "success",
      message: "Pending notifications processed",
      data: {
        processed: pendingNotifications.length,
        sent: sentCount,
        failed: pendingNotifications.length - sentCount,
      },
    });
  } catch (error: any) {
    console.error("Send notifications error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send notifications",
      error: error.message,
    });
  }
});

// Delete notification (Admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findByIdAndDelete(id);
      if (!notification) {
        return res.status(404).json({
          status: "error",
          message: "Notification not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Notification deleted successfully",
      });
    } catch (error: any) {
      console.error("Notification deletion error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  },
);

// Get notification statistics (Admin only)
router.get(
  "/statistics/overview",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const [
        totalNotifications,
        pendingNotifications,
        sentNotifications,
        failedNotifications,
        recentNotifications,
      ] = await Promise.all([
        Notification.countDocuments(),
        Notification.countDocuments({ status: "pending" }),
        Notification.countDocuments({ status: "sent" }),
        Notification.countDocuments({ status: "failed" }),
        Notification.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        }),
      ]);

      res.status(200).json({
        status: "success",
        data: {
          statistics: {
            total: totalNotifications,
            pending: pendingNotifications,
            sent: sentNotifications,
            failed: failedNotifications,
            recent: recentNotifications,
          },
        },
      });
    } catch (error: any) {
      console.error("Notification statistics fetch error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch notification statistics",
        error: error.message,
      });
    }
  },
);

export default router;
