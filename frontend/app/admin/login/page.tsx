"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDebugInfo(null);

    try {
      // Call backend directly for authentication
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "";

      if (process.env.NODE_ENV === "development") {
        console.log("Backend URL:", backendUrl || "(same-origin)");
      }

      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          errorData.message || "Login failed. Please check your credentials.",
        );
        return;
      }

      const data = await response.json();

      if (!data.token) {
        setError("Login failed. No token received.");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("daystar_token", data.token);
      localStorage.setItem("authToken", data.token);

      // Decode token to get user info with proper error handling
      let tokenPayload: any;
      try {
        const tokenParts = data.token.split(".");
        if (!tokenParts || tokenParts.length < 2) {
          throw new Error("Invalid token format");
        }
        tokenPayload = JSON.parse(atob(tokenParts[1]));
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        setError("Login failed. Invalid token format.");
        return;
      }

      const user = {
        id: tokenPayload?.id || "",
        firstName: tokenPayload?.firstName || "",
        lastName: tokenPayload?.lastName || "",
        name:
          `${tokenPayload?.firstName || ""} ${
            tokenPayload?.lastName || ""
          }`.trim() ||
          tokenPayload?.email ||
          "",
        email: tokenPayload?.email || "",
        role: tokenPayload?.role || "",
      };

      // Store user data
      localStorage.setItem("daystar_user", JSON.stringify(user));

      // Set cookie directly for client-side persistence
      if (typeof document !== "undefined") {
        document.cookie = `auth-token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `authToken=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      }

      // Debug info for development
      if (process.env.NODE_ENV === "development") {
        setDebugInfo({ success: true, user, role: user.role });
      }

      // Redirect based on role
      if (user.role === "admin" || user.role === "superAdmin") {
        window.location.href = "/admin/dashboard";
      } else if (user.role) {
        window.location.href = "/";
      } else {
        setError("Login failed. Invalid user role.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      // Provide more helpful error messages
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError")
      ) {
        setError(
          "Network Error: Cannot connect to backend API. Please ensure the backend server is running and NEXT_PUBLIC_API_URL is set correctly.",
        );
      } else if (errorMessage.includes("CORS")) {
        setError(
          "CORS Error: Backend server does not allow requests from this origin.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }

      if (process.env.NODE_ENV === "development") {
        setDebugInfo({
          error: errorMessage,
          backendUrl:
            process.env.NEXT_PUBLIC_API_URL ||
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            "http://localhost:5213",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-daystar-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {debugInfo && (
        <div
          style={{
            background: "#fff",
            color: "#222",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            maxWidth: "500px",
            wordBreak: "break-word",
          }}
        >
          <strong>Debug Info:</strong>
          <pre style={{ fontSize: "0.9em", marginTop: "0.5em" }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <div className="relative w-50 h-50 bg-transparent">
                  <Image
                    src="/images/daystar_logo.png"
                    alt="Daystar Christian Centre"
                    fill
                    className="object-contain bg-transparent"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DAYSTAR</h1>
          <p className="text-white/80 text-sm tracking-wide">FORMS PORTAL</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Shield className="w-5 h-5 text-primary" />
              Administrator Access
            </CardTitle>
            <CardDescription>
              Please enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pastor@daystar.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                ← Back to Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
