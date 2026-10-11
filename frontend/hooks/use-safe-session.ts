"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/auth";

export function useSafeSession() {
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoading(true);

      try {
        // Check both possible token locations
        const token =
          localStorage.getItem("daystar_token") ||
          localStorage.getItem("authToken");
        setLocalToken(token);

        // Try to get user data
        const storedUser = localStorage.getItem("daystar_user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setLocalUser(parsedUser);
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const mergedSessionData =
    localToken && localUser
    ? {
        user: {
          ...localUser,
          token: localToken,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    : null;

  const update = async () => {
    try {
      const token =
        localStorage.getItem("daystar_token") ||
        localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("daystar_user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      setLocalToken(token);
      setLocalUser(user);
      return { user, token };
    } catch (error) {
      console.error("Error refreshing local auth data:", error);
      return null;
      }
  };

  const mergedStatus = isLoading
    ? ("loading" as const)
    : localToken
    ? ("authenticated" as const)
    : ("unauthenticated" as const);

  return {
    data: mergedSessionData,
    status: mergedStatus,
    update,
    isInProvider: false,
    localToken,
    localUser,
    isAuthenticated: !!mergedSessionData?.user,
  };
}
