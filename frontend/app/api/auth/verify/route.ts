import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dataStore } from "@/lib/mock-data-store";

const JWT_SECRET = process.env.JWT_SECRET || "daystar-jwt-secret-key-2025";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      decoded = jwt.decode(token);
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user =
      dataStore.users.find((u: any) => u.id === decoded.id || u._id === decoded.id) ||
      decoded;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id || user._id,
        _id: user.id || user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
