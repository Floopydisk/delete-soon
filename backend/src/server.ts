import "module-alias/register";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDatabase from "@/utils/database";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5213;

// Security middleware
app.use(helmet());

// CORS configuration
// For production, set the CORS_ORIGIN environment variable to your frontend's domain.
// Example: https://your-app.netlify.app
const configuredCorsOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
const corsOrigins = configuredCorsOrigin
  ? configuredCorsOrigin.split(",").map((url: string) => url.trim())
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin:
      !configuredCorsOrigin || corsOrigins.includes("*")
        ? true
        : corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Daystar Forms API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Import API routes
import apiRoutes from "@/routes";
import authRoutes from "@/routes/auth";

// Mount API routes
app.use("/api", apiRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (
      error.name === "MongooseError" ||
      error.name === "MongoNetworkError" ||
      (error.message && error.message.includes("buffering timed out"))
    ) {
      console.warn("[AI Studio] Database offline — returning mock empty response");
      if (req.method === "GET") {
        return res.json(
          req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {},
        );
      }
      return res
        .status(503)
        .json({ error: "Service temporarily unavailable (database offline)" });
    }

    console.error("Error:", error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation Error",
        errors,
      });
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        status: "error",
        message: `${field} already exists`,
      });
    }

    // JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    // Default error
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal Server Error",
    });
  },
);

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.log("Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: any) => {
  console.log("Uncaught Exception:", err.message);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();

export default app;
