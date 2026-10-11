"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
      setErrorMessage(msg);
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

  if (hasError) {
    return <DashboardError error={errorMessage} />;
  }

  return (
    <MakeStyleDashboard
      user={user}
      stats={stats}
      chartData={chartData}
      recentActivity={recentActivity}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}
