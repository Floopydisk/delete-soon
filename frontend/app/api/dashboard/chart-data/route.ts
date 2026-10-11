import { NextResponse } from "next/server";
import { format, subMonths } from "date-fns";

export async function GET() {
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = subMonths(new Date(), 6 - i);
    return format(d, "MMM");
  });

  // Dynamic sample data with realistic activity
  const data = months.map((month, index) => {
    const baseSub = [8, 12, 15, 11, 14, 18, 22][index] || 10;
    const baseComp = [6, 9, 13, 10, 11, 15, 17][index] || 8;
    return {
      month,
      submissions: baseSub,
      completed: baseComp,
    };
  });

  return NextResponse.json({
    status: "success",
    data,
  });
}
