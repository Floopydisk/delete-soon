import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function GET() {
  return NextResponse.json({
    status: "success",
    data: {
      zones: dataStore.zones,
    },
  });
}
