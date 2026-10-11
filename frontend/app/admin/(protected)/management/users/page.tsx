"use client";

import { UserList } from "@/components/admin/user-list";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <UserList />
    </div>
  );
}