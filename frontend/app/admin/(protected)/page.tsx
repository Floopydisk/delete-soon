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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-6 w-6" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You need to be logged in to access the admin area. Redirecting
                to login...
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push("/admin/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error === "not-admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Construction className="h-6 w-6" />
              User Dashboard Under Construction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>Coming Soon!</AlertTitle>
              <AlertDescription>
                Your personalized dashboard is currently under construction. In
                the meantime, you can submit forms from the home page.
              </AlertDescription>
            </Alert>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Note:</strong> Only administrators can access the admin
                dashboard.
              </p>
              <p className="text-sm text-blue-700">
                If you believe you should have admin access, please contact your
                system administrator.
              </p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <LoadingSpinner />;
}
