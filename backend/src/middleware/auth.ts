import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface DecodedToken {
  id: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message:
          "Authentication required. Please log in to access this resource.",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Authentication token is missing. Please log in again.",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        status: "error",
        message:
          "User account not found. Please contact support if this persists.",
      });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: "error",
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: "error",
        message: "Invalid authentication token. Please log in again.",
        code: "INVALID_TOKEN",
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "Authentication failed. Please try logging in again.",
      });
    }
  }
};

export const authorize = (
  roles: String[]
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required. Please log in to continue.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message:
          "Access denied. You do not have permission to perform this action.",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRole: roles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Middleware to check if user is admin or superAdmin
export const requireAdmin = authorize(["admin", "superAdmin"]);

// Middleware to check if user is superAdmin
export const requireSuperAdmin = authorize(["superAdmin"]);
