"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, User } from "@/lib/auth";
import AdminLayoutClient from "./AdminLayoutClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/admin/login");
    } else {
      setUser(currentUser);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
