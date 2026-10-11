import express, { Router } from "express";
import { BurialForm } from "@/models";
import { authenticate, requireAdmin } from "@/middleware";
import validate from "@/middleware/validation";
import {
  createBurialRequestFormSchema,
  paginationSchema,
  idParamSchema,
  statusUpdateSchema,
} from "@/types/schemas";

const router: Router = express.Router();

// Create new burial request form
router.post("/", validate(createBurialRequestFormSchema), async (req, res) => {
  console.log("Received burial request form submission:", req.body);
  try {
    const formData = {
      ...req.body,
      submittedBy: req.user?.id,
      status: "pending",
    };

    const form = new BurialForm(formData);
    await form.save();

    res.status(201).json({
      status: "success",
      message: "Burial request form created successfully",
      data: {
        form,
      },
    });
  } catch (error: unknown) {
    console.error("Form creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create form",
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error),
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
    if (req.user && req.user.role === 'pastorate') {
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
      BurialForm.find(filter)
        .populate("churchZoneId", "zoneName")
        .populate("submittedBy", "firstName lastName email")
        .populate("processedBy", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      BurialForm.countDocuments(filter),
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

    const form = await BurialForm.findById(id)
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
      req.user && req.user.role !== 'admin' && req.user.role !== 'superAdmin' &&
      form.submittedBy?.toString() !== req.user.id
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

      const form = await BurialForm.findById(id);
      if (!form) {
        return res.status(404).json({
          status: "error",
          message: "Form not found",
        });
      }

      form.status = status;
      if (req.user) {
        form.processedBy = req.user.id;
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
  }
);

// Update form (only if pending and by owner or admin)
router.put("/:id", authenticate, validate(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const form = await BurialForm.findById(id);
    if (!form) {
      return res.status(404).json({
        status: "error",
        message: "Form not found",
      });
    }

    // Check if user can update this form
    if (
      req.user && req.user.role !== 'admin' && req.user.role !== 'superAdmin' &&
      form.submittedBy?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. You can only update your own forms.",
      });
    }

    // Only allow updates if form is pending
    if (req.user && form.status !== "pending" && req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
      return res.status(400).json({
        status: "error",
        message: "Cannot update form that has been processed",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "deceasedName",
      "deceasedAge",
      "deceasedDate",
      "familyContactName",
      "familyContactPhone",
      "familyContactEmail",
      "churchZoneId",
      "serviceLocation",
      "serviceDate",
      "officiatingMinister",
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
});

// Delete form (Admin only or owner if pending)
router.delete("/:id", authenticate, requireAdmin, validate(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const form = await BurialForm.findById(id);
    if (!form) {
      return res.status(404).json({
        status: "error",
        message: "Form not found",
      });
    }

    await BurialForm.findByIdAndDelete(id);

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
});

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
        completedForms,
        recentForms,
      ] = await Promise.all([
        BurialForm.countDocuments(),
        BurialForm.countDocuments({ status: "pending" }),
        BurialForm.countDocuments({ status: "approved" }),
        BurialForm.countDocuments({ status: "completed" }),
        BurialForm.countDocuments({
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
  }
);

export default router;

