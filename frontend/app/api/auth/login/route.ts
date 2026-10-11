import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dataStore } from "@/lib/mock-data-store";

const JWT_SECRET = process.env.JWT_SECRET || "daystar-jwt-secret-key-2025";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = dataStore.users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase(),
    );

    // Accept valid user with correct password, or default demo password 'password123'
    if (!user || (user.passwordHash !== password && password !== "password123")) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      {
        id: user.id || user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return NextResponse.json({
      token,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
