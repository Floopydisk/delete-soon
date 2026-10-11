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
    <div className="min-h-screen bg-[#edeef5] flex items-center justify-center p-4 relative overflow-hidden text-[#091122]">
      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-[#091122] shadow-xl border border-white/20 items-center justify-center mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-white"
            >
              <circle cx="12" cy="5" r="2.5" />
              <path d="M7 13c1.5-2 3-3 5-3s3.5 1 5 3" />
              <path d="M12 10v9" />
              <path d="M9 21l3-2 3 2" />
              <path d="M18 6l2-2" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#091122] tracking-tight">
            Daystar Forms Operations Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Sign in to access your administrative workspace
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/90">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Staff Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@daystarng.org"
                required
                className="w-full px-4 py-3 bg-slate-100/90 focus:bg-white rounded-2xl text-xs font-medium text-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-slate-100/90 focus:bg-white rounded-2xl text-xs font-medium text-slate-800 border border-transparent focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#091122] hover:bg-[#1a2942] text-white py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-navy-900/30 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? "Authenticating…" : "Sign In to Operations Hub"}</span>
            </button>
          </form>

          {/* Quick Demo Fill Pills */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@daystarng.org");
                  setPassword("password123");
                }}
                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors text-center truncate"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("superadmin@daystarng.org");
                  setPassword("password123");
                }}
                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors text-center truncate"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("pastor@daystarng.org");
                  setPassword("password123");
                }}
                className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors text-center truncate"
              >
                Pastor
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              <span>← Return to Public Forms Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
