"use client";

import { useCallback } from "react";
import { useSafeSession } from "./use-safe-session";
import { getApiUrl } from "@/lib/api-url";

/**
 * Authentication operations backed by the API JWT flow.
 */
export function useAuth() {
  const {
    data: session,
    update,
    isAuthenticated,
    localToken,
  } = useSafeSession();

  /**
   * Log in a user with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const backendUrl = getApiUrl();
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, error: error.message || "Login failed" };
        }

        const data = await response.json();
        if (!data.token || !data.user) {
          return { success: false, error: "Invalid login response" };
        }

        localStorage.setItem("daystar_token", data.token);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem(
          "daystar_user",
          JSON.stringify({
            id: data.user.id || data.user._id,
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
            email: data.user.email || email,
            role: data.user.role,
            token: data.token,
          }),
        );
        await update();

        return { success: true, user: data.user };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: "An unexpected error occurred. Please try again.",
        };
      }
    },
    [update],
  );

  /**
   * Log out the current user
   */
  const logout = useCallback(async () => {
    try {
      // Clear legacy storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("daystar_user");
        localStorage.removeItem("daystar_token");
        localStorage.removeItem("authToken");
      }

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: String(error) };
    }
  }, []);

  /**
   * Get the current authentication token from any source
   */
  const getAuthToken = useCallback(() => {
    // Try to get token from session first (NextAuth)
    const sessionToken = session?.user?.token as string | undefined;

    // Then fall back to local token
    if (sessionToken) return sessionToken;

    // Then try localStorage (legacy)
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("daystar_token") ||
        localStorage.getItem("authToken");
      return token || "";
    }

    return "";
  }, [session, localToken]);

  return {
    login,
    logout,
    getAuthToken,
    isAuthenticated,
    session,
    user: session?.user,
  };
}
