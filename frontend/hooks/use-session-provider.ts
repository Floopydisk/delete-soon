"use client";

import { SessionContext } from "next-auth/react";
import { useContext } from "react";

/**
 * Custom hook to determine if the component is rendered within a SessionProvider
 * This is more reliable than just checking context existence
 */
export function useIsInSessionProvider() {
  try {
    // Try to access the SessionContext synchronously. If it's defined,
    // then the component is rendered within a SessionProvider.
    const context = useContext(SessionContext);

    const isInSessionProvider = Boolean(context !== undefined && context !== null);

    return {
      isInProvider: isInSessionProvider,
      sessionContext: context,
    };
  } catch (error) {
    // If anything goes wrong, treat as not in provider
    console.warn("Error checking SessionProvider context:", error);
    return {
      isInProvider: false,
      sessionContext: null,
    };
  }
}
