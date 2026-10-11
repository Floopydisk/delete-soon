import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function GET() {
  const safeUsers = dataStore.users.map((u: any) => ({
    id: u.id,
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return NextResponse.json({
    status: "success",
    data: {
      users: safeUsers,
    },
  });
}
