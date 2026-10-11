"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  BarChart2,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Download,
  RefreshCw,
  Eye,
  Info,
} from "lucide-react";
import { getCurrentUser, User } from "@/lib/auth";
import {
  fetchDashboardStatistics,
  fetchChartData,
  fetchRecentActivity,
  type DashboardStatistics,
  type ChartDataPoint,
  type RecentActivity,
} from "@/lib/dashboard-api";
import { DashboardError } from "@/components/dashboard-error";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MakeStyleDashboard } from "@/components/dashboards/make-style-dashboard";

// Create a simple chart placeholder for now to avoid SSR issues
const SimpleChartSection = ({
  chartData,
  totalSubmissions,
  pendingSubmissions,
  completedSubmissions,
}: any) => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Form Submissions Over Time
        </CardTitle>
        <CardDescription>
          Monthly submission and completion trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart2 className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <div className="text-blue-600 font-medium">Interactive Charts</div>
            <div className="text-blue-400 text-sm">Coming Soon</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Form Status Overview</CardTitle>
        <CardDescription>Current status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pending</span>
              <span className="font-medium">{pendingSubmissions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    totalSubmissions > 0
                      ? (pendingSubmissions / totalSubmissions) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span className="font-medium">{completedSubmissions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    totalSubmissions > 0
                      ? (completedSubmissions / totalSubmissions) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="font-medium">{totalSubmissions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalSubmissions > 0
                ? Math.round((completedSubmissions / totalSubmissions) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStatistics>({
    users: { total: 0, superAdmin: 0, admin: 0, pastorate: 0 },
    forms: {
      namingDedication: { total: 0, pending: 0, approved: 0, completed: 0 },
      courtship: { total: 0, pending: 0, approved: 0, completed: 0 },
      burialRequest: { total: 0, pending: 0, approved: 0, completed: 0 },
    },
    totals: { submissions: 0, pending: 0, completed: 0 },
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardMode, setDashboardMode] = useState<"make" | "traditional">("make");

  const loadData = useCallback(async (token: string) => {
    try {
      setHasError(false);
      const [fetchedStats, fetchedChartData, fetchedActivity] =
        await Promise.all([
          fetchDashboardStatistics(token),
          fetchChartData(token),
          fetchRecentActivity(token, 6),
        ]);
      setStats(fetchedStats);
      setChartData(fetchedChartData);
      setRecentActivity(fetchedActivity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setHasError(true);
      const msg =
        error instanceof Error ? error.message : "Failed to load dashboard data";
      setErrorMessage(
        msg.includes("fetch failed")
          ? `Network Error: Cannot connect to backend API. Backend may not be running or NEXT_PUBLIC_API_URL may not be configured.`
          : msg,
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/admin/login");
      return;
    }
    setUser(currentUser);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("daystar_token") ||
          localStorage.getItem("authToken") ||
          ""
        : "";
    loadData(token);
  }, [router, loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("daystar_token") ||
          localStorage.getItem("authToken") ||
          ""
        : "";
    loadData(token);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show error component if there's an issue
  if (hasError) {
    return <DashboardError error={errorMessage} />;
  }

  // Calculate derived values
  const totalSubmissions = stats.totals.submissions;
  const pendingSubmissions = stats.totals.pending;
  const completedSubmissions = stats.totals.completed;

  if (dashboardMode === "make") {
    return (
      <div className="relative">
        <div className="fixed top-3 right-4 z-50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDashboardMode("traditional")}
            className="bg-white/90 backdrop-blur-md shadow-md text-xs font-semibold rounded-xl border border-slate-200"
          >
            Switch to Detailed Table View
          </Button>
        </div>
        <MakeStyleDashboard user={user} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDashboardMode("make")}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 text-xs rounded-xl"
            >
              Liquid Glass View ✨
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your forms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Users
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.users.total || 0}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
              {stats.users.superAdmin || 0} Super Admins •{" "}
              {stats.users.admin || 0} Admins • {stats.users.pastorate || 0}{" "}
              Pastorate
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+2.5%</span>
              <span className="text-xs text-muted-foreground ml-1">
                this month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Submissions Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/20 dark:to-green-950/20 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Total Submissions
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {totalSubmissions}
            </div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
              Across all form types
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">+12.3%</span>
              <span className="text-xs text-muted-foreground ml-1">
                this week
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Pending Reviews
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              {pendingSubmissions}
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              Awaiting your review
            </p>
            <div className="flex items-center mt-2">
              <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs text-amber-600 font-medium">
                Needs attention
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-950/20 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Completed
            </CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {completedSubmissions}
            </div>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
              Successfully processed
            </p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">
                All good!
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <SimpleChartSection
        chartData={chartData}
        totalSubmissions={totalSubmissions}
        pendingSubmissions={pendingSubmissions}
        completedSubmissions={completedSubmissions}
      />

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Eye className="h-5 w-5" />
                <span className="text-sm">Review Forms</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50"
              >
                <UserPlus className="h-5 w-5" />
                <span className="text-sm">Add User</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50"
              >
                <BarChart2 className="h-5 w-5" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest form submissions and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`mt-1 w-2 h-2 rounded-full ${
                      activity.type === "submission"
                        ? "bg-blue-500"
                        : activity.type === "completed"
                          ? "bg-green-500"
                          : "bg-amber-500"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.details}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Management Card for SuperAdmin */}
        {user?.role === "superAdmin" && (
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                System user overview and controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-all duration-300">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.users.total || 12}
                    </div>
                    <div className="text-xs text-purple-600">Total Users</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-150 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-xs text-blue-600">Active Today</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">
                    Role Distribution
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                          Super Admin
                        </span>
                        <span className="font-medium">
                          {stats.users.superAdmin || 1}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              stats.users.total > 0
                                ? ((stats.users.superAdmin || 1) /
                                    stats.users.total) *
                                  100
                                : 8
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                          Admin
                        </span>
                        <span className="font-medium">
                          {stats.users.admin || 3}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              stats.users.total > 0
                                ? ((stats.users.admin || 3) /
                                    stats.users.total) *
                                  100
                                : 25
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                          Pastorate
                        </span>
                        <span className="font-medium">
                          {stats.users.pastorate || 8}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              stats.users.total > 0
                                ? ((stats.users.pastorate || 8) /
                                    stats.users.total) *
                                  100
                                : 67
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-all duration-300"
                  >
                    View All Users →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info Card for non-SuperAdmin */}
        {user?.role !== "superAdmin" && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Dashboard Info
              </CardTitle>
              <CardDescription>Your account and system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Your Role
                    </span>
                    <span className="text-sm font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {user?.role || "admin"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      System Status
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Online
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Last Login
                    </span>
                    <span className="text-sm font-medium text-amber-700">
                      Today, 9:30 AM
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs text-gray-500 mb-2">Quick Stats</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-gray-700">
                        {pendingSubmissions}
                      </div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-gray-700">
                        {completedSubmissions}
                      </div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Types Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Naming & Dedication
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {stats.forms.namingDedication?.total || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {stats.forms.namingDedication?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium">
                  {stats.forms.namingDedication?.approved || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {stats.forms.namingDedication?.completed || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Courtship Forms
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700"
              >
                {stats.forms.courtship?.total || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {stats.forms.courtship?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium">
                  {stats.forms.courtship?.approved || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {stats.forms.courtship?.completed || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Burial Requests
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700"
              >
                {stats.forms.burialRequest?.total || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {stats.forms.burialRequest?.pending || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium">
                  {stats.forms.burialRequest?.approved || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {stats.forms.burialRequest?.completed || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
