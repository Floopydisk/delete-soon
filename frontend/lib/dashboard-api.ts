import { getApiUrl } from "./api-url";

// API utility functions for dashboard
const API_BASE_URL = getApiUrl();

export interface DashboardStatistics {
  users: {
    total: number;
    superAdmin: number;
    admin: number;
    pastorate: number;
  };
  forms: {
    namingDedication: {
      total: number;
      pending: number;
      approved: number;
      completed: number;
    };
    courtship: {
      total: number;
      pending: number;
      approved: number;
      completed: number;
    };
    burialRequest: {
      total: number;
      pending: number;
      approved: number;
      completed: number;
    };
  };
  totals: {
    submissions: number;
    pending: number;
    completed: number;
  };
}

export interface ChartDataPoint {
  month: string;
  submissions: number;
  completed: number;
}

export interface RecentActivity {
  type: "submission" | "completed" | "user";
  action: string;
  details: string;
  time: string;
}

export async function fetchDashboardStatistics(
  token: string,
): Promise<DashboardStatistics> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/statistics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard statistics: ${response.statusText}`,
    );
  }

  const result = await response.json();
  return result.data;
}

export async function fetchChartData(token: string): Promise<ChartDataPoint[]> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/chart-data`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chart data: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function fetchRecentActivity(
  token: string,
  limit: number = 10,
): Promise<RecentActivity[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/recent-activity?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch recent activity: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
