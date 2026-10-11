import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

function calcStats(list: any[]) {
  const total = list.length;
  const pending = list.filter((i) => i.status === "pending").length;
  const approved = list.filter((i) => i.status === "approved").length;
  const completed = list.filter((i) => i.status === "completed").length;
  return { total, pending, approved, completed };
}

export async function GET() {
  const users = dataStore.users;
  const namingStats = calcStats(dataStore.namingDedication);
  const courtshipStats = calcStats(dataStore.courtship);
  const burialStats = calcStats(dataStore.burial);

  const totalSubmissions =
    namingStats.total + courtshipStats.total + burialStats.total;
  const totalPending =
    namingStats.pending + courtshipStats.pending + burialStats.pending;
  const totalCompleted =
    namingStats.completed + courtshipStats.completed + burialStats.completed;

  return NextResponse.json({
    status: "success",
    data: {
      users: {
        total: users.length,
        superAdmin: users.filter((u: any) => u.role === "superAdmin").length,
        admin: users.filter((u: any) => u.role === "admin").length,
        pastorate: users.filter((u: any) => u.role === "pastorate").length,
      },
      forms: {
        namingDedication: namingStats,
        courtship: courtshipStats,
        burialRequest: burialStats,
      },
      totals: {
        submissions: totalSubmissions,
        pending: totalPending,
        completed: totalCompleted,
      },
    },
  });
}
