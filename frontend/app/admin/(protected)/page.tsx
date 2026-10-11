"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, User } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, Construction } from "lucide-react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
          setError("unauthorized");
          setTimeout(() => router.push("/admin/login"), 2000);
        } else if (!isAdmin(currentUser)) {
          setError("not-admin");
        } else {
          // User is authenticated and is an admin
          router.push("/admin/dashboard");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError("error");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edeef5] p-4 text-[#091122]">
        <div className="max-w-md w-full bg-white/85 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/90 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-[#091122]">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            You need to be signed in to access the Daystar Forms Operations Hub.
            Redirecting to login...
          </p>
          <Button
            onClick={() => router.push("/admin/login")}
            className="w-full bg-[#091122] hover:bg-[#1a2942] text-white rounded-2xl py-3 text-xs font-bold"
          >
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  if (error === "not-admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edeef5] p-4 text-[#091122]">
        <div className="max-w-md w-full bg-white/85 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white/90 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Construction className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-[#091122]">
            Restricted Ministerial Access
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            Only authorized pastorate members and system administrators can access this portal area.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#091122] hover:bg-[#1a2942] text-white rounded-2xl py-3 text-xs font-bold"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Public Portal
          </Button>
        </div>
      </div>
    );
  }

  return <LoadingSpinner />;
}
