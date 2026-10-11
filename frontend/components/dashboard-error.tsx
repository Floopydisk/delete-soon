import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: string;
  retry?: () => void;
}

export function DashboardError({ error, retry }: DashboardErrorProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Dashboard Error</CardTitle>
            <CardDescription>
              There was an error loading the dashboard data.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {error}
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-semibold mb-1">Troubleshooting:</p>
              <ul className="text-left space-y-1">
                <li>• Ensure the backend API server is running</li>
                <li>
                  • Verify NEXT_PUBLIC_API_URL environment variable is set
                </li>
                <li>• Check that you're logged in with valid credentials</li>
                <li>• Try refreshing the page after fixing the issue</li>
              </ul>
            </div>
            {retry && (
              <Button
                onClick={retry}
                variant="outline"
                className="gap-2 w-full"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full bg-gray-100 rounded animate-pulse"></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
