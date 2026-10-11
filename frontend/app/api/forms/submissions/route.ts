import { NextResponse } from "next/server";
import { dataStore } from "@/lib/mock-data-store";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      namingDedication: dataStore.namingDedication,
      courtship: dataStore.courtship,
      burial: dataStore.burial,
    },
  });
}
