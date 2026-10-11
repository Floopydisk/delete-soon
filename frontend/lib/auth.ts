import jwt from "jsonwebtoken";
import { getApiUrl } from "./api-url";

export type UserRole = "superAdmin" | "admin" | "pastorate";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // NextAuth uses name instead of first/last
  email: string;
  role: UserRole;
  token?: string;
}

/**
 * Verify token server-side or client-side
 */
export const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const backendUrl = getApiUrl();

    try {
      const response = await fetch(`${backendUrl}/api/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          return {
            id: data.user._id || data.user.id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            name:
              data.user.name ||
              `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
            email: data.user.email,
            role: data.user.role,
          };
        }
      }
    } catch (error) {
      console.error("Backend token verification error:", error);
    }

    // Fallback to JWT decode if backend is unavailable or verification fails
    const decoded = jwt.decode(token) as any;

    if (!decoded || !decoded.id || !decoded.role) {
      return null;
    }

    return {
      id: decoded.id,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      name:
        decoded.name ||
        `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim(),
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

let currentUser: User | null = null;

/**
 * Get current user from local storage (legacy approach)
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  if (!currentUser) {
    const stored = localStorage.getItem("daystar_user");
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        return null;
      }
    }
  }
  return currentUser;
};

/**
 * Login using both NextAuth and legacy approach
 */
export const login = async (
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const backendUrl = getApiUrl();
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Login failed" };
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("daystar_token", data.token);

      // For legacy compatibility
      try {
        const decoded = jwt.decode(data.token) as any;
        const user: User = {
          id: decoded.id || data.userId || data.id,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          name:
            decoded.name ||
            `${decoded.firstName || ""} ${decoded.lastName || ""}`.trim(),
          email: decoded.email || email,
          role: decoded.role,
          token: data.token,
        };

        localStorage.setItem("daystar_user", JSON.stringify(user));
        currentUser = user;

        return { success: true, user };
      } catch (error) {
        console.error("Error decoding token:", error);
        return { success: true }; // Still return success since we have a token
      }
    }

    return { success: false, error: "Invalid credentials" };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

/**
 * Logout from both NextAuth and legacy auth
 */
export const logout = async (): Promise<void> => {
  currentUser = null;

  // Clear legacy storage
  if (typeof window !== "undefined") {
    localStorage.removeItem("daystar_user");
    localStorage.removeItem("daystar_token");
    localStorage.removeItem("authToken");
  }

  // Redirect after everything is cleared
  window.location.href = "/admin/login";
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin" || user?.role === "superAdmin";
};

export const requireAuth = (requiredRole?: UserRole): User | null => {
  const user = getCurrentUser();

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return user;
};
