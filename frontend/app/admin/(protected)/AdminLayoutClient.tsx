"use client";

import { User } from "@/lib/auth";
import AppLayout from "@/components/layout/app-layout";

interface AdminLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  user,
  children,
}: AdminLayoutClientProps) {
  return <AppLayout user={user}>{children}</AppLayout>;
}
