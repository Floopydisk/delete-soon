"use client";

import React, { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // This ensures the SessionProvider only renders after mounting on the client
  // which helps prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render the children after the component has mounted
  if (!mounted) {
    // You could return a loading indicator here if needed
    return null;
  }

  return <>{children}</>;
}
